"""
Skill Engine Service (FR-9, FR-10, FR-11, FR-12, FR-13, Section 8)
Implements deterministic scoring logic and aggregation rules across evidence sources.
"""
from typing import List, Dict, Any, Tuple, Optional
import datetime
from sqlalchemy.orm import Session
from models.db_models import Student, Skill, StudentSkill, SkillEvidence, SkillHistory
from models.schemas import (
    SkillCategory, 
    VerificationStatus, 
    ProficiencyBand, 
    SkillDNAItem, 
    SkillDNAResponse,
    SkillEvidenceResponse,
    EvidenceSourceType
)
from services.skill_dictionary import score_to_proficiency, proficiency_to_provisional_score

# Evidence Weights in Aggregation Rule (deterministic & explainable)
SOURCE_WEIGHTS = {
    EvidenceSourceType.ASSESSMENT.value: 0.45,
    EvidenceSourceType.TECH_INTERVIEW.value: 0.25,
    EvidenceSourceType.INTERNSHIP.value: 0.20,
    EvidenceSourceType.PROJECT.value: 0.15,
    EvidenceSourceType.RESUME.value: 0.10,
}

def aggregate_skill_score(evidence_list: List[SkillEvidence], claimed_score: float) -> Tuple[float, VerificationStatus]:
    """
    Computes deterministic aggregated skill score based on available evidence.
    Rule:
    1. If no verified evidence (only resume or none):
       Status = SELF_DECLARED (🟡), score = claimed_score (provisional)
    2. If verified evidence exists:
       Status = VERIFIED (🟢)
       Combines evidence using normalized weights of present sources.
    """
    verified_evidence = [e for e in evidence_list if e.source != EvidenceSourceType.RESUME.value]
    
    if not verified_evidence:
        return claimed_score, VerificationStatus.SELF_DECLARED
        
    total_weight = 0.0
    weighted_sum = 0.0
    
    for ev in evidence_list:
        weight = SOURCE_WEIGHTS.get(ev.source, 0.10)
        weighted_sum += ev.score * weight
        total_weight += weight
        
    if total_weight > 0:
        final_score = round(weighted_sum / total_weight, 1)
    else:
        final_score = claimed_score
        
    # Clamping between 0 and 100
    final_score = max(0.0, min(100.0, final_score))
    return final_score, VerificationStatus.VERIFIED

def compute_student_skill_dna(db: Session, student_id: int) -> SkillDNAResponse:
    """
    Builds the full Skill DNA profile for a student grouped by categories
    (Technical, Problem Solving, Soft Skills) with full evidence linking.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise ValueError(f"Student with id {student_id} not found")
        
    student_skills = db.query(StudentSkill).filter(StudentSkill.student_id == student_id).all()
    
    technical_items: List[SkillDNAItem] = []
    problem_solving_items: List[SkillDNAItem] = []
    soft_skills_items: List[SkillDNAItem] = []
    all_items: List[SkillDNAItem] = []
    
    verified_count = 0
    self_declared_count = 0
    gap_count = 0
    
    for ss in student_skills:
        skill = ss.skill
        # Fetch all evidence for this skill
        ev_records = db.query(SkillEvidence).filter(
            SkillEvidence.student_id == student_id,
            SkillEvidence.skill_id == skill.id
        ).order_by(SkillEvidence.created_at.desc()).all()
        
        # Sub-scores breakdown
        assessment_ev = next((e for e in ev_records if e.source == EvidenceSourceType.ASSESSMENT.value), None)
        interview_ev = next((e for e in ev_records if e.source in [EvidenceSourceType.TECH_INTERVIEW.value, EvidenceSourceType.HR_INTERVIEW.value]), None)
        internship_ev = next((e for e in ev_records if e.source == EvidenceSourceType.INTERNSHIP.value), None)
        
        assessment_score = assessment_ev.score if assessment_ev else None
        interview_score = interview_ev.score if interview_ev else None
        internship_score = internship_ev.score if internship_ev else None
        
        # Recompute score deterministically from evidence
        computed_score, status = aggregate_skill_score(ev_records, ss.claimed_score)
        proficiency = score_to_proficiency(computed_score)
        
        # Format evidence list
        evidence_dto_list = []
        for e in ev_records:
            import json
            details = None
            if e.details_json:
                try:
                    details = json.loads(e.details_json) if isinstance(e.details_json, str) else e.details_json
                except Exception:
                    details = {"raw": e.details_json}
            evidence_dto_list.append(SkillEvidenceResponse(
                id=e.id,
                student_id=e.student_id,
                skill_id=e.skill_id,
                skill_name=skill.name,
                source=EvidenceSourceType(e.source),
                score=e.score,
                details_json=details,
                ai_assisted=e.ai_assisted,
                created_at=e.created_at
            ))
            
        if status == VerificationStatus.VERIFIED:
            verified_count += 1
        elif status == VerificationStatus.SELF_DECLARED:
            self_declared_count += 1
        else:
            gap_count += 1
            
        dna_item = SkillDNAItem(
            skill_id=skill.id,
            skill_name=skill.name,
            category=SkillCategory(skill.category),
            score=computed_score,
            claimed_score=ss.claimed_score,
            assessment_score=assessment_score,
            interview_score=interview_score,
            internship_score=internship_score,
            proficiency_level=proficiency,
            verification_status=status,
            evidence_count=len(ev_records),
            evidence_items=evidence_dto_list,
            last_updated=ss.updated_at
        )
        
        all_items.append(dna_item)
        if skill.category == SkillCategory.TECHNICAL.value:
            technical_items.append(dna_item)
        elif skill.category == SkillCategory.PROBLEM_SOLVING.value:
            problem_solving_items.append(dna_item)
        elif skill.category == SkillCategory.SOFT_SKILLS.value:
            soft_skills_items.append(dna_item)
            
    return SkillDNAResponse(
        student_id=student.id,
        student_name=student.user.name if student.user else f"Student #{student.id}",
        skills=all_items,
        technical_skills=technical_items,
        problem_solving_skills=problem_solving_items,
        soft_skills=soft_skills_items,
        verified_count=verified_count,
        self_declared_count=self_declared_count,
        gap_count=gap_count
    )

def record_skill_evidence_and_update(
    db: Session,
    student_id: int,
    skill_id: int,
    source: str,
    score: float,
    details_json: Optional[str] = None,
    ai_assisted: bool = False,
    change_reason: str = "Evidence Added"
) -> Tuple[float, float]:
    """
    Appends verifiable evidence, recalculates the deterministic skill score,
    and logs the delta in skill_history (FR-32).
    Returns (old_score, new_score).
    """
    # 1. Save new evidence
    evidence = SkillEvidence(
        student_id=student_id,
        skill_id=skill_id,
        source=source,
        score=score,
        details_json=details_json,
        ai_assisted=ai_assisted,
        created_at=datetime.datetime.utcnow()
    )
    db.add(evidence)
    db.flush()
    
    # 2. Get student_skill or create it
    ss = db.query(StudentSkill).filter(
        StudentSkill.student_id == student_id,
        StudentSkill.skill_id == skill_id
    ).first()
    
    if not ss:
        ss = StudentSkill(
            student_id=student_id,
            skill_id=skill_id,
            score=score,
            claimed_score=score,
            verification_status="verified"
        )
        db.add(ss)
        old_score = 0.0
    else:
        old_score = ss.score

    # 3. Retrieve all evidence and re-aggregate
    all_evidence = db.query(SkillEvidence).filter(
        SkillEvidence.student_id == student_id,
        SkillEvidence.skill_id == skill_id
    ).all()
    
    new_score, status = aggregate_skill_score(all_evidence, ss.claimed_score)
    ss.score = new_score
    ss.verification_status = status.value
    ss.updated_at = datetime.datetime.utcnow()
    
    # 4. Record History Entry (FR-32)
    history_entry = SkillHistory(
        student_id=student_id,
        skill_id=skill_id,
        old_score=old_score,
        new_score=new_score,
        change_reason=change_reason,
        created_at=datetime.datetime.utcnow()
    )
    db.add(history_entry)
    db.commit()
    
    return old_score, new_score
