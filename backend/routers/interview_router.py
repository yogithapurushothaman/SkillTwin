from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from database import get_db
from models.schemas import InterviewSubmitRequest, InterviewResponse
from services.interview_service import get_interview_questions, process_interview_submission

router = APIRouter(prefix="/api/interview", tags=["Technical & HR Interviews"])

@router.get("/questions")
def list_interview_questions(interview_type: Optional[str] = Query(None)):
    """Returns structured interview questions tagged with skill, topic, and rubric (FR-25, FR-28)."""
    return get_interview_questions(interview_type)

@router.post("/submit", response_model=InterviewResponse)
def submit_interview_answer(data: InterviewSubmitRequest, db: Session = Depends(get_db)):
    """
    FR-26, FR-27: Evaluates free-text answer against fixed rubric criteria,
    clamps to system bounds, and stores verifiable evidence with AI-assisted flag.
    """
    try:
        return process_interview_submission(
            db=db,
            student_id=data.student_id,
            question_id=data.question_id,
            interview_type=data.interview_type,
            student_answer=data.student_answer
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
