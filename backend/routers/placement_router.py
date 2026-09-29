from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import PlacementReadinessResponse
from services.placement_service import compute_placement_readiness

router = APIRouter(prefix="/api/placement", tags=["Placement Readiness"])

@router.get("/{student_id}/readiness", response_model=PlacementReadinessResponse)
def get_placement_readiness(student_id: int, db: Session = Depends(get_db)):
    """
    Computes deterministic multi-stage placement readiness score across 6 components
    (Resume, Tech Skills, Assessment, Interview, HR, Soft Skills) with readiness bands (FR-30, FR-31).
    """
    try:
        return compute_placement_readiness(db, student_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
