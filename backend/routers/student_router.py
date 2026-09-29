from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json
import datetime

from database import get_db
from models.db_models import Student, SkillHistory, Internship, Skill
from models.schemas import (
    StudentResponse, 
    SkillDNAResponse, 
    SkillHistoryResponse, 
    SkillHistoryItem
)
from services.skill_engine import compute_student_skill_dna, record_skill_evidence_and_update

router = APIRouter(prefix="/api/students", tags=["Student Profile & Skill DNA"])

@router.get("", response_model=List[StudentResponse])
def list_students(
    department: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if department:
        query = query.filter(Student.department == department)
    if year:
        query = query.filter(Student.year == year)
        
    students = query.all()
    results = []
    for s in students:
        results.append(StudentResponse(
            id=s.id,
            user_id=s.user_id,
            name=s.user.name if s.user else f"Student #{s.id}",
            email=s.user.email if s.user else "",
            department=s.department,
            year=s.year,
            cgpa=s.cgpa,
            bio=s.bio,
            created_at=s.created_at
        ))
    return results

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return StudentResponse(
        id=student.id,
        user_id=student.user_id,
        name=student.user.name if student.user else f"Student #{student.id}",
        email=student.user.email if student.user else "",
        department=student.department,
        year=student.year,
        cgpa=student.cgpa,
        bio=student.bio,
        created_at=student.created_at
    )

@router.get("/{student_id}/dna", response_model=SkillDNAResponse)
def get_skill_dna(student_id: int, db: Session = Depends(get_db)):
    """
    Returns full Skill DNA profile grouped by Technical, Problem Solving, Soft Skills
    with linked evidence and deterministic aggregated scores (FR-10, FR-11, FR-12).
    """
    try:
        return compute_student_skill_dna(db, student_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{student_id}/history", response_model=SkillHistoryResponse)
def get_skill_history(student_id: int, db: Session = Depends(get_db)):
    """
    Returns chronological score changes for student across evidence sources (FR-32, FR-34).
    """
    history_records = db.query(SkillHistory).filter(
        SkillHistory.student_id == student_id
    ).order_by(SkillHistory.created_at.desc()).all()
    
    items = []
    skill_progress_map: Dict[str, Dict[str, float]] = {}
    
    for h in history_records:
        items.append(SkillHistoryItem(
            id=h.id,
            skill_id=h.skill_id,
            skill_name=h.skill.name if h.skill else "Skill",
            old_score=h.old_score,
            new_score=h.new_score,
            delta=round(h.new_score - h.old_score, 1),
            change_reason=h.change_reason,
            created_at=h.created_at
        ))
        
        s_name = h.skill.name if h.skill else "Skill"
        if s_name not in skill_progress_map:
            skill_progress_map[s_name] = {"initial": h.old_score, "current": h.new_score}
        else:
            skill_progress_map[s_name]["initial"] = h.old_score

    summary = [
        {
            "skill": k,
            "initial_score": v["initial"],
            "current_score": v["current"],
            "improvement": round(v["current"] - v["initial"], 1)
        }
        for k, v in skill_progress_map.items()
    ]

    return SkillHistoryResponse(
        student_id=student_id,
        history=items,
        progress_summary=summary
    )

@router.get("/{student_id}/internships")
def get_internships(student_id: int, db: Session = Depends(get_db)):
    """Returns verified internship records (FR-42)."""
    internships = db.query(Internship).filter(Internship.student_id == student_id).all()
    results = []
    for it in internships:
        try:
            skills_data = json.loads(it.verified_skills_json)
        except Exception:
            skills_data = []
        results.append({
            "id": it.id,
            "company": it.company,
            "role": it.role,
            "duration": it.duration,
            "mentor_name": it.mentor_name,
            "mentor_email": it.mentor_email,
            "mentor_feedback": it.mentor_feedback,
            "verified_skills": skills_data,
            "created_at": it.created_at
        })
    return results

@router.post("/{student_id}/internships")
def add_internship(
    student_id: int,
    data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Records internship with mentor-verified skills feeding into SkillTwin (FR-42)."""
    skills_list = data.get("verified_skills", [])
    
    internship = Internship(
        student_id=student_id,
        company=data.get("company", "Tech Company"),
        role=data.get("role", "Software Intern"),
        duration=data.get("duration", "3 Months"),
        mentor_name=data.get("mentor_name", "Mentor"),
        mentor_email=data.get("mentor_email", ""),
        mentor_feedback=data.get("mentor_feedback", "Demonstrated solid technical execution."),
        verified_skills_json=json.dumps(skills_list),
        created_at=datetime.datetime.utcnow()
    )
    db.add(internship)
    db.commit()

    # Feed verified skills into SkillTwin evidence
    for item in skills_list:
        s_name = item.get("skill")
        s_score = float(item.get("score", 70.0))
        skill = db.query(Skill).filter(Skill.name == s_name).first()
        if skill:
            record_skill_evidence_and_update(
                db=db,
                student_id=student_id,
                skill_id=skill.id,
                source="internship",
                score=s_score,
                details_json=json.dumps({
                    "internship_id": internship.id,
                    "company": internship.company,
                    "mentor": internship.mentor_name
                }),
                ai_assisted=False,
                change_reason=f"Mentor-Verified Internship at {internship.company}"
            )

    return {"status": "success", "message": "Internship evidence recorded and Skill DNA updated."}
