from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from database import get_db
from models.schemas import CandidateMatchItem
from services.industry_service import get_ranked_candidates_for_role, toggle_candidate_shortlist

router = APIRouter(prefix="/api/industry", tags=["Industry Recruiter & Talent Discovery"])

@router.get("/candidates", response_model=List[CandidateMatchItem])
def list_candidates_for_role(
    role_id: int = Query(...),
    min_match_score: float = Query(0.0),
    min_readiness_score: float = Query(0.0),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    FR-39, FR-41: Discovers and ranks candidates against role blueprint requirements
    with verified evidence and filtering.
    """
    try:
        return get_ranked_candidates_for_role(
            db=db,
            role_id=role_id,
            min_match_score=min_match_score,
            min_readiness_score=min_readiness_score,
            department=department
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/shortlist")
def toggle_shortlist(data: Dict[str, int], db: Session = Depends(get_db)):
    """Toggles candidate shortlist status (FR-41)."""
    role_id = data.get("role_id")
    student_id = data.get("student_id")
    if not role_id or not student_id:
        raise HTTPException(status_code=400, detail="Missing role_id or student_id")
    is_shortlisted = toggle_candidate_shortlist(db, role_id, student_id)
    return {
        "status": "success",
        "is_shortlisted": is_shortlisted,
        "message": "Candidate added to shortlist" if is_shortlisted else "Candidate removed from shortlist"
    }
