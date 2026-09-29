"""
Placement Readiness Service (FR-30, FR-31, Section 8)
Computes multi-stage weighted placement readiness score, readiness bands,
top strengths, priority gaps, and actionable recommendations.
"""
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models.db_models import Student, StudentSkill, SkillEvidence, Assessment, Interview
from models.schemas import (
    PlacementReadinessResponse, 
    PlacementComponentScore, 
    SkillCategory, 
    EvidenceSourceType
)

# 6-Component Weights (Section 6.9 & Section 8)
WEIGHT_RESUME = 0.15
WEIGHT_TECH_SKILLS = 0.25
WEIGHT_CODING_ASSESSMENT = 0.25
WEIGHT_TECH_INTERVIEW = 0.15
WEIGHT_HR_ASSESSMENT = 0.10
WEIGHT_SOFT_SKILLS = 0.10

def compute_placement_readiness(db: Session, student_id: int) -> PlacementReadinessResponse:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise ValueError(f"Student with id {student_id} not found")

    student_skills = db.query(StudentSkill).filter(StudentSkill.student_id == student_id).all()
    evidences = db.query(SkillEvidence).filter(SkillEvidence.student_id == student_id).all()
    assessments = db.query(Assessment).filter(Assessment.student_id == student_id, Assessment.status == "completed").all()
    interviews = db.query(Interview).filter(Interview.student_id == student_id).all()

    # 1. Resume Evidence Score (15%)
    # Evaluated based on completeness: student bio, education, internship, skills count
    resume_score = 50.0
    if student.resume_text and len(student.resume_text) > 100:
        resume_score += 20.0
    if len(student_skills) >= 5:
        resume_score += 20.0
    if student.cgpa >= 8.0:
        resume_score += 10.0
    resume_score = min(100.0, resume_score)

    # 2. Technical Skills Average Score (25%)
    tech_skills = [ss for ss in student_skills if ss.skill.category == SkillCategory.TECHNICAL.value]
    if tech_skills:
        tech_score = round(sum(ss.score for ss in tech_skills) / len(tech_skills), 1)
    else:
        tech_score = 45.0

    # 3. Coding Assessment Score (25%)
    if assessments:
        assessment_pcts = [(a.total_score / a.max_score * 100.0) if a.max_score > 0 else 0.0 for a in assessments]
        assessment_score = round(sum(assessment_pcts) / len(assessment_pcts), 1)
    else:
        assessment_score = 0.0

    # 4. Technical Interview Score (15%)
    tech_interviews = [i for i in interviews if i.interview_type == "technical"]
    if tech_interviews:
        tech_interview_score = round(sum(i.total_score for i in tech_interviews) / len(tech_interviews), 1)
    else:
        tech_interview_score = 0.0

    # 5. HR Assessment Score (10%)
    hr_interviews = [i for i in interviews if i.interview_type == "hr"]
    if hr_interviews:
        hr_score = round(sum(i.total_score for i in hr_interviews) / len(hr_interviews), 1)
    else:
        hr_score = 50.0

    # 6. Soft Skills Score (10%)
    soft_skills = [ss for ss in student_skills if ss.skill.category == SkillCategory.SOFT_SKILLS.value]
    if soft_skills:
        soft_score = round(sum(ss.score for ss in soft_skills) / len(soft_skills), 1)
    else:
        soft_score = 60.0

    # Weighted Overall Calculation (FR-30)
    overall_readiness = round(
        (resume_score * WEIGHT_RESUME) +
        (tech_score * WEIGHT_TECH_SKILLS) +
        (assessment_score * WEIGHT_CODING_ASSESSMENT) +
        (tech_interview_score * WEIGHT_TECH_INTERVIEW) +
        (hr_score * WEIGHT_HR_ASSESSMENT) +
        (soft_score * WEIGHT_SOFT_SKILLS),
        1
    )

    # Readiness Band Classification (Section 8)
    if overall_readiness >= 75.0:
        band = "Industry Ready"
        band_color = "#10B981"  # Emerald Green
    elif overall_readiness >= 50.0:
        band = "Needs Development"
        band_color = "#F59E0B"  # Amber Orange
    else:
        band = "Critical Gaps"
        band_color = "#EF4444"  # Red

    components = [
        PlacementComponentScore(
            name="Resume Evidence",
            weight=WEIGHT_RESUME,
            raw_score=resume_score,
            weighted_score=round(resume_score * WEIGHT_RESUME, 1),
            status="Complete" if resume_score >= 70 else "Partial",
            description="Extracted credentials, education, GPA, and self-declared profiles"
        ),
        PlacementComponentScore(
            name="Technical Skills (Verified)",
            weight=WEIGHT_TECH_SKILLS,
            raw_score=tech_score,
            weighted_score=round(tech_score * WEIGHT_TECH_SKILLS, 1),
            status="Strong" if tech_score >= 70 else "Developing",
            description="Aggregated proficiency in core programming, DSA, SQL, Git & OOP"
        ),
        PlacementComponentScore(
            name="Online Assessment",
            weight=WEIGHT_CODING_ASSESSMENT,
            raw_score=assessment_score,
            weighted_score=round(assessment_score * WEIGHT_CODING_ASSESSMENT, 1),
            status="Verified" if assessment_score >= 60 else ("Pending" if assessment_score == 0 else "Needs Retake"),
            description="Rigorous gap-prioritized technical questions across core concepts"
        ),
        PlacementComponentScore(
            name="Technical Interview",
            weight=WEIGHT_TECH_INTERVIEW,
            raw_score=tech_interview_score,
            weighted_score=round(tech_interview_score * WEIGHT_TECH_INTERVIEW, 1),
            status="Evaluated" if tech_interview_score >= 60 else ("Pending" if tech_interview_score == 0 else "Low"),
            description="Rubric-scored technical explanation, depth, examples, and clarity"
        ),
        PlacementComponentScore(
            name="HR Assessment",
            weight=WEIGHT_HR_ASSESSMENT,
            raw_score=hr_score,
            weighted_score=round(hr_score * WEIGHT_HR_ASSESSMENT, 1),
            status="Evaluated" if hr_score >= 60 else "Pending",
            description="Scenario-based evaluation of professionalism, communication & ethics"
        ),
        PlacementComponentScore(
            name="Soft Skills",
            weight=WEIGHT_SOFT_SKILLS,
            raw_score=soft_score,
            weighted_score=round(soft_score * WEIGHT_SOFT_SKILLS, 1),
            status="Good" if soft_score >= 65 else "Developing",
            description="Demonstrated teamwork, adaptability, leadership, and time management"
        ),
    ]

    # Strengths and Gaps Identification
    sorted_skills = sorted(student_skills, key=lambda s: s.score, reverse=True)
    top_strengths = [f"{s.skill.name} ({s.score}%)" for s in sorted_skills if s.score >= 65][:4]
    if not top_strengths:
        top_strengths = ["Structured Resume Profile", "Baseline Core Fundamentals"]

    low_skills = [s for s in sorted_skills if s.score < 60]
    priority_gaps = [f"{s.skill.name} (Current: {s.score}%)" for s in low_skills][:3]
    if assessment_score == 0:
        priority_gaps.insert(0, "No Online Assessment Completed")

    # Actionable Recommendations (FR-31)
    recommended_actions = []
    if assessment_score < 60:
        recommended_actions.append({
            "action": "Take Gap-Prioritized Assessment",
            "impact": "+15-20 pts to Readiness",
            "urgency": "High"
        })
    if tech_interview_score == 0:
        recommended_actions.append({
            "action": "Complete Structured Technical Interview",
            "impact": "+10-15 pts to Readiness",
            "urgency": "High"
        })
    if low_skills:
        weakest = low_skills[0].skill.name
        recommended_actions.append({
            "action": f"Review {weakest} fundamentals and practice mock questions",
            "impact": f"Closes critical gap in {weakest}",
            "urgency": "Medium"
        })
    recommended_actions.append({
        "action": "Record mentor verification for internship or capstone project",
        "impact": "Converts self-declared experience into verified evidence",
        "urgency": "Medium"
    })

    formula_explanation = (
        "Readiness = (Resume × 15%) + (Tech Skills × 25%) + (Assessment × 25%) + "
        "(Tech Interview × 15%) + (HR × 10%) + (Soft Skills × 10%). "
        "Deterministic, fully transparent, and explainable."
    )

    return PlacementReadinessResponse(
        student_id=student.id,
        overall_readiness_score=overall_readiness,
        readiness_band=band,
        readiness_band_color=band_color,
        components=components,
        top_strengths=top_strengths,
        priority_gaps=priority_gaps,
        recommended_actions=recommended_actions,
        formula_explanation=formula_explanation
    )
