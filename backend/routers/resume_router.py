from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import json
import datetime

from database import get_db
from models.db_models import Student, Skill, StudentSkill, SkillEvidence, SkillHistory
from models.schemas import ResumeExtractionResponse
from services.resume_service import extract_text_from_pdf, parse_resume_content
from services.skill_dictionary import normalize_skill, proficiency_to_provisional_score

router = APIRouter(prefix="/api/resume", tags=["Resume Extraction"])

@router.post("/extract-pdf", response_model=ResumeExtractionResponse)
async def extract_resume_pdf(file: UploadFile = File(...)):
    """Extracts text and normalizes skills against predefined dictionary from PDF (FR-4, FR-5, FR-6)."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    try:
        content = await file.read()
        text = extract_text_from_pdf(content)
        return parse_resume_content(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

@router.post("/extract-text", response_model=ResumeExtractionResponse)
def extract_resume_text(data: Dict[str, str]):
    """Parses pasted resume text into structured fields and dictionary-mapped skills (FR-5, FR-6)."""
    text = data.get("text", "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    return parse_resume_content(text)

@router.post("/confirm/{student_id}")
def confirm_extracted_skills(
    student_id: int,
    data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    FR-7, FR-8: Stores reviewed skills as self-declared with claimed level.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    skills_to_save = data.get("skills", [])
    updated_skills_count = 0

    try:
        for item in skills_to_save:
            s_name = item.get("normalized_name")
            claimed_level = item.get("claimed_level", "Intermediate")
            provisional_score = float(item.get("claimed_score", 60.0))

            # Check dictionary
            skill = db.query(Skill).filter(Skill.name == s_name).first()
            if not skill:
                continue

            # Check existing student skill
            ss = db.query(StudentSkill).filter(
                StudentSkill.student_id == student_id,
                StudentSkill.skill_id == skill.id
            ).first()

            old_score = 0.0
            if ss:
                old_score = ss.score
                ss.claimed_score = provisional_score
                # If not yet verified, keep score at provisional
                if ss.verification_status != "verified":
                    ss.score = provisional_score
                    ss.verification_status = "self_declared"
                ss.updated_at = datetime.datetime.utcnow()
            else:
                ss = StudentSkill(
                    student_id=student_id,
                    skill_id=skill.id,
                    score=provisional_score,
                    claimed_score=provisional_score,
                    verification_status="self_declared"
                )
                db.add(ss)

            # Record resume evidence
            db.add(SkillEvidence(
                student_id=student_id,
                skill_id=skill.id,
                source="resume",
                score=provisional_score,
                details_json=json.dumps({"claimed_level": claimed_level}),
                ai_assisted=False,
                created_at=datetime.datetime.utcnow()
            ))

            # Record history
            db.add(SkillHistory(
                student_id=student_id,
                skill_id=skill.id,
                old_score=old_score,
                new_score=provisional_score,
                change_reason="Resume Skill Extraction Confirmed (Self-Declared)",
                created_at=datetime.datetime.utcnow()
            ))
            updated_skills_count += 1

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to confirm skills: {str(e)}")

    return {
        "status": "success",
        "message": f"Successfully mapped and saved {updated_skills_count} skills to SkillTwin as Self-Declared."
    }
