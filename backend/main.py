import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, SessionLocal
from services.seed_data import seed_database

# Routers
from routers.auth_router import router as auth_router
from routers.student_router import router as student_router
from routers.resume_router import router as resume_router
from routers.blueprint_router import router as blueprint_router
from routers.gap_router import router as gap_router
from routers.assessment_router import router as assessment_router
from routers.interview_router import router as interview_router
from routers.placement_router import router as placement_router
from routers.institution_router import router as institution_router
from routers.industry_router import router as industry_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    # Seed default data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="SkillTwin API",
    description="Evidence-Based Skill Intelligence & Placement Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router)
app.include_router(student_router)
app.include_router(resume_router)
app.include_router(blueprint_router)
app.include_router(gap_router)
app.include_router(assessment_router)
app.include_router(interview_router)
app.include_router(placement_router)
app.include_router(institution_router)
app.include_router(industry_router)

@app.get("/")
def root():
    return {
        "app": "SkillTwin Evidence-Based Skill Intelligence API",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/dev/reset-database")
def reset_database_endpoint():
    db = SessionLocal()
    try:
        seed_database(db, force_reset=True)
        return {"status": "success", "message": "Database reset and re-seeded successfully."}
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
