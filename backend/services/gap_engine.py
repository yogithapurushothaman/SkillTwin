"""
Skill Gap Engine Service (FR-17, FR-18, FR-19, FR-20, Section 8)
Calculates deterministic role match score, classifies met/gap skills,
and prioritizes critical gaps and assessment recommendations.
"""
from typing import List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from models.db_models import Student, IndustryRole, RoleSkill, StudentSkill, SkillEvidence
from models.schemas import (
    RoleMatchResponse, 
    SkillGapItem, 
    GapCalculationStep, 
    SkillCategory, 
    VerificationStatus,
    EvidenceSourceType
)

def evaluate_role_match(db: Session, student_id: int, role_id: int) -> RoleMatchResponse:
    """
    Compares student's verified skills to industry role blueprint.
    Formula (Section 8):
    Match Score = 100 * [ Sum( min(actual_score / required_score, 1.0) * weight ) / Sum(weights) ]
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise ValueError(f"Student with id {student_id} not found")
        
    role = db.query(IndustryRole).filter(IndustryRole.id == role_id).first()
    if not role:
        raise ValueError(f"Industry role with id {role_id} not found")
        
    role_skills = db.query(RoleSkill).filter(RoleSkill.role_id == role_id).all()
    if not role_skills:
        raise ValueError(f"Role {role.title} has no defined skill requirements")
        
    total_weight = 0.0
    weighted_ratio_sum = 0.0
    
    all_gaps: List[SkillGapItem] = []
    critical_gaps: List[SkillGapItem] = []
    strong_areas: List[SkillGapItem] = []
    calculation_steps: List[GapCalculationStep] = []
    skills_met_count = 0
    recommended_assessments: List[str] = []
    
    for rs in role_skills:
        skill = rs.skill
        required = rs.required_score
        weight = rs.weight if rs.weight and rs.weight > 0 else 1.0
        total_weight += weight
        
        # Look up student's current skill record
        ss = db.query(StudentSkill).filter(
            StudentSkill.student_id == student_id,
            StudentSkill.skill_id == skill.id
        ).first()
        
        actual = ss.score if ss else 0.0
        v_status = VerificationStatus(ss.verification_status) if ss else VerificationStatus.GAP
        
        # Fetch evidence sources
        evidences = db.query(SkillEvidence).filter(
            SkillEvidence.student_id == student_id,
            SkillEvidence.skill_id == skill.id
        ).all()
        source_types = [EvidenceSourceType(e.source) for e in evidences]
        
        # Calculations
        raw_ratio = actual / required if required > 0 else 1.0
        clamped_ratio = min(raw_ratio, 1.0)
        weighted_contribution = clamped_ratio * weight
        weighted_ratio_sum += weighted_contribution
        
        deficit = max(0.0, round(required - actual, 1))
        is_met = actual >= required
        
        # Critical Gap criteria:
        # 1. Deficit >= 15 points, OR
        # 2. Actual score < 50 when requirement >= 60, OR
        # 3. Not attempted/unverified with high requirement
        is_critical = (deficit >= 15.0) or (actual < 50.0 and required >= 60.0)
        
        gap_item = SkillGapItem(
            skill_id=skill.id,
            skill_name=skill.name,
            category=SkillCategory(skill.category),
            required_score=required,
            actual_score=actual,
            deficit=deficit,
            weight=weight,
            is_critical_gap=is_critical,
            is_met=is_met,
            verification_status=v_status,
            evidence_sources=source_types
        )
        
        all_gaps.append(gap_item)
        
        calculation_steps.append(GapCalculationStep(
            skill_name=skill.name,
            actual=actual,
            required=required,
            ratio=round(raw_ratio, 3),
            clamped_ratio=round(clamped_ratio, 3),
            weight=weight,
            weighted_contribution=round(weighted_contribution, 3)
        ))
        
        if is_met:
            skills_met_count += 1
            strong_areas.append(gap_item)
        else:
            if is_critical:
                critical_gaps.append(gap_item)
                recommended_assessments.append(f"{skill.name} Assessment & Practice")
            else:
                recommended_assessments.append(f"{skill.name} Refresher")
                
    overall_match = round((weighted_ratio_sum / total_weight) * 100.0, 1) if total_weight > 0 else 0.0
    
    # Sort critical gaps by largest deficit first
    critical_gaps.sort(key=lambda x: x.deficit, reverse=True)
    
    formula_text = (
        "Role Match Score = [ ∑ min(Actual_Score / Required_Score, 1.0) × Weight ] / Total_Weights × 100. "
        "Each skill's contribution is clamped at 100% so surplus in one skill cannot artificially mask a critical gap in another."
    )
    
    return RoleMatchResponse(
        role_id=role.id,
        role_title=role.title,
        company=role.company,
        overall_match_score=overall_match,
        skills_met_count=skills_met_count,
        total_skills_count=len(role_skills),
        critical_gaps=critical_gaps,
        strong_areas=strong_areas,
        all_gaps=all_gaps,
        calculation_breakdown=calculation_steps,
        formula_explanation=formula_text,
        recommended_assessments=recommended_assessments[:5]
    )
