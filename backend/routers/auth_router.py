from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from models.db_models import User, Student
from models.schemas import UserResponse, LoginRequest, LoginResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication & Personas"])

@router.get("/personas")
def get_personas(db: Session = Depends(get_db)):
    """Returns quick login switch personas for demo purposes (FR-2)."""
    users = db.query(User).all()
    personas = []
    for u in users:
        student_id = u.student_profile.id if u.student_profile else None
        personas.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "student_id": student_id,
            "department": u.student_profile.department if u.student_profile else None,
            "year": u.student_profile.year if u.student_profile else None
        })
    return personas

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Simple login supporting FR-3."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found")
        
    student_id = user.student_profile.id if user.student_profile else None
    
    return LoginResponse(
        user=UserResponse.from_orm(user),
        student_id=student_id,
        token=f"mock-jwt-token-{user.id}-{user.role}"
    )
