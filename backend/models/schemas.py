from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field

class UserRole(str, Enum):
    STUDENT = "student"
    ACADEMICIAN = "academician"
    INDUSTRY = "industry"
    ADMIN = "admin"

class SkillCategory(str, Enum):
    TECHNICAL = "Technical"
    PROBLEM_SOLVING = "Problem Solving"
    SOFT_SKILLS = "Soft Skills"

class VerificationStatus(str, Enum):
    VERIFIED = "verified"          # 🟢
    SELF_DECLARED = "self_declared" # 🟡
    GAP = "gap"                    # 🔴

class EvidenceSourceType(str, Enum):
    RESUME = "resume"
    ASSESSMENT = "assessment"
    TECH_INTERVIEW = "tech_interview"
    HR_INTERVIEW = "hr_interview"
    INTERNSHIP = "internship"
    PROJECT = "project"

class ProficiencyBand(str, Enum):
    BASIC = "Basic"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

# User Models
class UserBase(BaseModel):
    email: str
    name: str
    role: UserRole

class UserCreate(UserBase):
    password: Optional[str] = "password123"

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = "password123"

class LoginResponse(BaseModel):
    user: UserResponse
    student_id: Optional[int] = None
    token: str

# Student Models
class StudentBase(BaseModel):
    department: str
    year: int
    cgpa: float
    bio: Optional[str] = None

class StudentCreate(StudentBase):
    user_id: int

class StudentResponse(StudentBase):
    id: int
    user_id: int
    name: str
    email: str
    created_at: datetime
    class Config:
        from_attributes = True

# Skill Models
class SkillBase(BaseModel):
    name: str
    normalized_name: str
    category: SkillCategory
    description: Optional[str] = None

class SkillResponse(SkillBase):
    id: int
    class Config:
        from_attributes = True

# Evidence Models
class SkillEvidenceResponse(BaseModel):
    id: int
    student_id: int
    skill_id: int
    skill_name: str
    source: EvidenceSourceType
    score: float
    details_json: Optional[Dict[str, Any]] = None
    ai_assisted: bool = False
    created_at: datetime
    class Config:
        from_attributes = True

class SkillEvidenceCreate(BaseModel):
    skill_name: str
    source: EvidenceSourceType
    score: float
    details_json: Optional[Dict[str, Any]] = None
    ai_assisted: bool = False

# Skill DNA Models
class SkillDNAItem(BaseModel):
    skill_id: int
    skill_name: str
    category: SkillCategory
    score: float
    claimed_score: float
    assessment_score: Optional[float] = None
    interview_score: Optional[float] = None
    internship_score: Optional[float] = None
    proficiency_level: ProficiencyBand
    verification_status: VerificationStatus
    evidence_count: int
    evidence_items: List[SkillEvidenceResponse] = []
    last_updated: datetime

class SkillDNAResponse(BaseModel):
    student_id: int
    student_name: str
    skills: List[SkillDNAItem]
    technical_skills: List[SkillDNAItem]
    problem_solving_skills: List[SkillDNAItem]
    soft_skills: List[SkillDNAItem]
    verified_count: int
    self_declared_count: int
    gap_count: int

# Resume Parsing Models
class ExtractedSkillItem(BaseModel):
    raw_term: str
    normalized_name: Optional[str]
    category: Optional[SkillCategory]
    claimed_level: ProficiencyBand
    claimed_score: float
    is_recognized: bool

class ResumeExtractionResponse(BaseModel):
    student_name: Optional[str]
    education: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    certifications: List[str] = []
    internships: List[Dict[str, Any]] = []
    skills: List[ExtractedSkillItem] = []
    unrecognized_terms: List[str] = []
    summary: str

class ResumeConfirmRequest(BaseModel):
    skills: List[Dict[str, Any]]

# Industry Blueprint Models
class RoleSkillRequirement(BaseModel):
    skill_id: int
    skill_name: str
    category: SkillCategory
    required_score: float
    weight: float = 1.0

class IndustryRoleCreate(BaseModel):
    title: str
    company: str
    description: Optional[str] = None
    skills: List[Dict[str, Any]]  # [{"skill_name": "Java", "required_score": 70, "weight": 1.0}]

class IndustryRoleResponse(BaseModel):
    id: int
    title: str
    company: str
    description: Optional[str] = None
    is_seed: bool = False
    skills: List[RoleSkillRequirement]
    class Config:
        from_attributes = True

# Gap Engine Models
class SkillGapItem(BaseModel):
    skill_id: int
    skill_name: str
    category: SkillCategory
    required_score: float
    actual_score: float
    deficit: float
    weight: float
    is_critical_gap: bool
    is_met: bool
    verification_status: VerificationStatus
    evidence_sources: List[EvidenceSourceType]

class GapCalculationStep(BaseModel):
    skill_name: str
    actual: float
    required: float
    ratio: float
    clamped_ratio: float
    weight: float
    weighted_contribution: float

class RoleMatchResponse(BaseModel):
    role_id: int
    role_title: str
    company: str
    overall_match_score: float  # 0 to 100
    skills_met_count: int
    total_skills_count: int
    critical_gaps: List[SkillGapItem]
    strong_areas: List[SkillGapItem]
    all_gaps: List[SkillGapItem]
    calculation_breakdown: List[GapCalculationStep]
    formula_explanation: str
    recommended_assessments: List[str]

# Online Assessment Models
class QuestionOption(BaseModel):
    id: str
    text: str

class AssessmentQuestion(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    topic: str
    difficulty: str
    marks: int
    question_text: str
    options: List[QuestionOption]

class AssessmentStartRequest(BaseModel):
    student_id: int
    target_role_id: Optional[int] = None
    focus_skill_names: Optional[List[str]] = None

class AssessmentAnswerSubmission(BaseModel):
    question_id: int
    selected_option_id: str

class AssessmentSubmitRequest(BaseModel):
    student_id: int
    assessment_id: int
    answers: List[AssessmentAnswerSubmission]

class TopicScore(BaseModel):
    topic: str
    skill_name: str
    score: float
    total_questions: int
    correct_questions: int

class AssessmentResultResponse(BaseModel):
    assessment_id: int
    student_id: int
    total_score: float
    max_score: float
    percentage: float
    topic_scores: List[TopicScore]
    skill_updates: List[Dict[str, Any]]
    feedback: str

# Technical & HR Interview Models
class RubricCriterionScore(BaseModel):
    name: str
    weight: float
    score: float
    max_score: float
    criterion_feedback: str

class InterviewEvaluationResult(BaseModel):
    correctness: float = Field(ge=0, le=40)
    depth: float = Field(ge=0, le=30)
    example: float = Field(ge=0, le=20)
    clarity: float = Field(ge=0, le=10)
    total_score: float
    feedback: str
    ai_assisted: bool = True

class InterviewSubmitRequest(BaseModel):
    student_id: int
    question_id: int
    interview_type: str  # "technical" or "hr"
    student_answer: str

class InterviewResponse(BaseModel):
    id: int
    student_id: int
    interview_type: str
    skill_name: str
    question_text: str
    student_answer: str
    rubric_scores: Dict[str, float]
    total_score: float
    feedback: str
    ai_assisted: bool
    created_at: datetime

# Placement Readiness Models
class PlacementComponentScore(BaseModel):
    name: str
    weight: float
    raw_score: float
    weighted_score: float
    status: str
    description: str

class PlacementReadinessResponse(BaseModel):
    student_id: int
    overall_readiness_score: float
    readiness_band: str  # "Industry Ready", "Needs Development", "Critical Gaps"
    readiness_band_color: str
    components: List[PlacementComponentScore]
    top_strengths: List[str]
    priority_gaps: List[str]
    recommended_actions: List[Dict[str, str]]
    formula_explanation: str

# Skill History Models
class SkillHistoryItem(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    old_score: float
    new_score: float
    delta: float
    change_reason: str
    created_at: datetime

class SkillHistoryResponse(BaseModel):
    student_id: int
    history: List[SkillHistoryItem]
    progress_summary: List[Dict[str, Any]]

# Institution Dashboard Models
class ReadinessBandCount(BaseModel):
    band: str
    count: int
    percentage: float
    color: str

class SkillGapRankItem(BaseModel):
    skill_name: str
    category: SkillCategory
    students_below_threshold_count: int
    total_students: int
    gap_percentage: float
    average_score: float
    industry_demand_score: float

class BatchAnalyticsResponse(BaseModel):
    total_students: int
    readiness_distribution: List[ReadinessBandCount]
    common_skill_gaps: List[SkillGapRankItem]
    departments: List[str]
    reassessment_improvement: Dict[str, Any]

# Industry Dashboard Models
class CandidateMatchItem(BaseModel):
    student_id: int
    student_name: str
    department: str
    year: int
    cgpa: float
    match_score: float
    readiness_score: float
    readiness_band: str
    verified_skills_count: int
    total_skills_count: int
    top_verified_skills: List[Dict[str, Any]]
    critical_gaps: List[str]
    is_shortlisted: bool

class CandidateSearchFilters(BaseModel):
    role_id: int
    min_match_score: Optional[float] = 0.0
    min_readiness_score: Optional[float] = 0.0
    required_skills: Optional[List[str]] = None
    department: Optional[str] = None
