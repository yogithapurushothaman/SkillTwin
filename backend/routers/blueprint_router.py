from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import datetime

from database import get_db
from models.db_models import IndustryRole, RoleSkill, Skill
from models.schemas import IndustryRoleResponse, RoleSkillRequirement, IndustryRoleCreate, SkillCategory

router = APIRouter(prefix="/api/blueprints", tags=["Industry Skill Blueprints"])

def format_role_response(role: IndustryRole) -> IndustryRoleResponse:
    reqs = []
    for rs in role.role_skills:
        reqs.append(RoleSkillRequirement(
            skill_id=rs.skill_id,
            skill_name=rs.skill.name if rs.skill else "Skill",
            category=SkillCategory(rs.skill.category) if rs.skill else SkillCategory.TECHNICAL,
            required_score=rs.required_score,
            weight=rs.weight
        ))
    return IndustryRoleResponse(
        id=role.id,
        title=role.title,
        company=role.company,
        description=role.description,
        is_seed=role.is_seed,
        skills=reqs
    )

@router.get("", response_model=List[IndustryRoleResponse])
def list_blueprints(db: Session = Depends(get_db)):
    roles = db.query(IndustryRole).all()
    return [format_role_response(r) for r in roles]

@router.get("/{role_id}", response_model=IndustryRoleResponse)
def get_blueprint(role_id: int, db: Session = Depends(get_db)):
    role = db.query(IndustryRole).filter(IndustryRole.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role blueprint not found")
    return format_role_response(role)

@router.post("", response_model=IndustryRoleResponse)
def create_blueprint(data: IndustryRoleCreate, db: Session = Depends(get_db)):
    """Creates a new industry role blueprint with required scores (FR-14)."""
    new_role = IndustryRole(
        title=data.title,
        company=data.company,
        description=data.description,
        is_seed=False,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_role)
    db.flush()

    for item in data.skills:
        s_name = item.get("skill_name")
        req_score = float(item.get("required_score", 65.0))
        weight = float(item.get("weight", 1.0))

        skill = db.query(Skill).filter(Skill.name == s_name).first()
        if skill:
            rs = RoleSkill(
                role_id=new_role.id,
                skill_id=skill.id,
                required_score=req_score,
                weight=weight
            )
            db.add(rs)

    db.commit()
    db.refresh(new_role)
    return format_role_response(new_role)

@router.post("/{role_id}/clone", response_model=IndustryRoleResponse)
def clone_blueprint(role_id: int, db: Session = Depends(get_db)):
    """Clones an existing role blueprint for custom editing (FR-16)."""
    orig = db.query(IndustryRole).filter(IndustryRole.id == role_id).first()
    if not orig:
        raise HTTPException(status_code=404, detail="Role not found")

    cloned = IndustryRole(
        title=f"{orig.title} (Custom Clone)",
        company=orig.company,
        description=orig.description,
        is_seed=False,
        created_at=datetime.datetime.utcnow()
    )
    db.add(cloned)
    db.flush()

    for rs in orig.role_skills:
        new_rs = RoleSkill(
            role_id=cloned.id,
            skill_id=rs.skill_id,
            required_score=rs.required_score,
            weight=rs.weight
        )
        db.add(new_rs)

    db.commit()
    db.refresh(cloned)
    return format_role_response(cloned)
