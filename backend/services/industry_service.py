"""
Industry Recruiter & Talent Discovery Service (FR-39, FR-40, FR-41)
Matches and ranks candidates based on verified evidence blueprints,
handles threshold filtering, deep candidate profile drill-down, and shortlists.
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from models.db_models import (
    Student, 
    IndustryRole, 
    RoleSkill, 
    StudentSkill, 
    ShortlistedCandidate
)
from models.schemas import CandidateMatchItem
from services.gap_engine import evaluate_role_match
from services.placement_service import compute_placement_readiness

def get_ranked_candidates_for_role(
    db: Session,
    role_id: int,
    min_match_score: float = 0.0,
    min_readiness_score: float = 0.0,
    department: Optional[str] = None
) -> List[CandidateMatchItem]:
    role = db.query(IndustryRole).filter(IndustryRole.id == role_id).first()
    if not role:
        raise ValueError(f"Industry role with id {role_id} not found")
        
    query = db.query(Student)
    if department and department.lower() != "all":
        query = query.filter(Student.department == department)
        
    students = query.all()
    results: List[CandidateMatchItem] = []
    
    # Retrieve existing shortlists
    shortlisted_ids = set(
        s.student_id for s in db.query(ShortlistedCandidate).filter(ShortlistedCandidate.role_id == role_id).all()
    )

    for st in students:
        try:
            match_res = evaluate_role_match(db, st.id, role_id)
            readiness = compute_placement_readiness(db, st.id)
            
            if match_res.overall_match_score < min_match_score:
                continue
            if readiness.overall_readiness_score < min_readiness_score:
                continue
                
            # Top verified skills
            verified_skills_list = []
            verified_count = 0
            for ss in st.skills:
                if ss.verification_status == "verified":
                    verified_count += 1
                    verified_skills_list.append({
                        "name": ss.skill.name,
                        "score": ss.score,
                        "status": ss.verification_status
                    })
            # Sort top skills
            verified_skills_list.sort(key=lambda x: x["score"], reverse=True)
            
            crit_gaps = [g.skill_name for g in match_res.critical_gaps]
            
            results.append(CandidateMatchItem(
                student_id=st.id,
                student_name=st.user.name if st.user else f"Candidate #{st.id}",
                department=st.department,
                year=st.year,
                cgpa=st.cgpa,
                match_score=match_res.overall_match_score,
                readiness_score=readiness.overall_readiness_score,
                readiness_band=readiness.readiness_band,
                verified_skills_count=verified_count,
                total_skills_count=len(st.skills),
                top_verified_skills=verified_skills_list[:4],
                critical_gaps=crit_gaps[:3],
                is_shortlisted=(st.id in shortlisted_ids)
            ))
        except Exception:
            continue

    # Rank by match score descending, then readiness score descending (FR-39)
    results.sort(key=lambda c: (c.match_score, c.readiness_score), reverse=True)
    return results

def toggle_candidate_shortlist(db: Session, role_id: int, student_id: int) -> bool:
    """Toggles candidate shortlist status for a specific role (FR-41)."""
    existing = db.query(ShortlistedCandidate).filter(
        ShortlistedCandidate.role_id == role_id,
        ShortlistedCandidate.student_id == student_id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return False
    else:
        new_shortlist = ShortlistedCandidate(role_id=role_id, student_id=student_id)
        db.add(new_shortlist)
        db.commit()
        return True
