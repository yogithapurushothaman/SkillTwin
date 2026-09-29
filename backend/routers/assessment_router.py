from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database import get_db
from models.schemas import (
    AssessmentStartRequest, 
    AssessmentQuestion, 
    AssessmentSubmitRequest, 
    AssessmentResultResponse
)
from services.assessment_service import generate_adaptive_assessment, grade_assessment_submission

router = APIRouter(prefix="/api/assessment", tags=["Online Assessments"])

@router.post("/start")
def start_assessment(data: AssessmentStartRequest, db: Session = Depends(get_db)):
    """
    FR-21, FR-22: Generates gap-prioritized assessment questions targeting
    the student's critical skill gaps.
    """
    try:
        assessment_id, questions = generate_adaptive_assessment(
            db=db,
            student_id=data.student_id,
            target_role_id=data.target_role_id,
            limit=10
        )
        return {
            "assessment_id": assessment_id,
            "student_id": data.student_id,
            "questions": questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit", response_model=AssessmentResultResponse)
def submit_assessment(data: AssessmentSubmitRequest, db: Session = Depends(get_db)):
    """
    FR-23: Evaluates submitted answers, updates skill and topic scores,
    and commits verifiable evidence into SkillTwin.
    """
    try:
        answers_dict = [
            {"question_id": a.question_id, "selected_option_id": a.selected_option_id}
            for a in data.answers
        ]
        return grade_assessment_submission(
            db=db,
            assessment_id=data.assessment_id,
            student_id=data.student_id,
            answers=answers_dict
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
