from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models.schemas import BatchAnalyticsResponse
from services.institution_service import get_batch_analytics

router = APIRouter(prefix="/api/institution", tags=["Institution & Academician Dashboards"])

@router.get("/batch-analytics", response_model=BatchAnalyticsResponse)
def batch_analytics(
    department: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    role_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    FR-35, FR-36, FR-37, FR-38: Provides batch-level readiness metrics,
    common skill-gap ranking, department filtering, and intervention trend analysis.
    """
    return get_batch_analytics(db, department=department, year=year, role_id=role_id)
