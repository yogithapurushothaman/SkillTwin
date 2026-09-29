from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import RoleMatchResponse
from services.gap_engine import evaluate_role_match

router = APIRouter(prefix="/api/gap", tags=["Skill Gap Engine"])

@router.get("/{student_id}/{role_id}", response_model=RoleMatchResponse)
def get_gap_evaluation(student_id: int, role_id: int, db: Session = Depends(get_db)):
    """
    Evaluates student's verified skills against role blueprint (FR-17, FR-18, FR-19).
    Surfaces role match score, critical gaps, strong areas, and transparent calculations.
    """
    try:
        return evaluate_role_match(db, student_id, role_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
