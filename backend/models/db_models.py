import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # student, academician, industry, admin
    password_hash = Column(String(255), default="hashed_password")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student_profile = relationship("Student", back_populates="user", uselist=False)

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    cgpa = Column(Float, default=8.0)
    bio = Column(Text, nullable=True)
    resume_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    skills = relationship("StudentSkill", back_populates="student")
    evidence = relationship("SkillEvidence", back_populates="student")
    assessments = relationship("Assessment", back_populates="student")
    interviews = relationship("Interview", back_populates="student")
    internships = relationship("Internship", back_populates="student")
    history = relationship("SkillHistory", back_populates="student")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    normalized_name = Column(String(100), index=True, nullable=False)
    category = Column(String(50), nullable=False)  # Technical, Problem Solving, Soft Skills
    description = Column(Text, nullable=True)

    student_skills = relationship("StudentSkill", back_populates="skill")
    evidence = relationship("SkillEvidence", back_populates="skill")
    role_skills = relationship("RoleSkill", back_populates="skill")
    questions = relationship("Question", back_populates="skill")

class StudentSkill(Base):
    __tablename__ = "student_skills"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    score = Column(Float, default=0.0)
    claimed_score = Column(Float, default=50.0)
    verification_status = Column(String(50), default="self_declared")  # verified, self_declared, gap
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="skills")
    skill = relationship("Skill", back_populates="student_skills")

class SkillEvidence(Base):
    __tablename__ = "skill_evidence"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    source = Column(String(50), nullable=False)  # resume, assessment, tech_interview, hr_interview, internship, project
    score = Column(Float, nullable=False)
    details_json = Column(Text, nullable=True)  # JSON-encoded extra data
    ai_assisted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="evidence")
    skill = relationship("Skill", back_populates="evidence")

class IndustryRole(Base):
    __tablename__ = "industry_roles"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_seed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    role_skills = relationship("RoleSkill", back_populates="role")

class RoleSkill(Base):
    __tablename__ = "role_skills"
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("industry_roles.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    required_score = Column(Float, nullable=False)
    weight = Column(Float, default=1.0)

    role = relationship("IndustryRole", back_populates="role_skills")
    skill = relationship("Skill", back_populates="role_skills")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    topic = Column(String(100), nullable=False)
    difficulty = Column(String(50), nullable=False)  # Easy, Medium, Hard
    marks = Column(Integer, default=5)
    question_text = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False)  # JSON array of options
    correct_answer = Column(String(10), nullable=False)
    explanation = Column(Text, nullable=True)

    skill = relationship("Skill", back_populates="questions")

class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    target_role_id = Column(Integer, ForeignKey("industry_roles.id"), nullable=True)
    total_score = Column(Float, default=0.0)
    max_score = Column(Float, default=100.0)
    status = Column(String(50), default="completed")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="assessments")
    answers = relationship("AssessmentAnswer", back_populates="assessment")

class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_option = Column(String(10), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    score_awarded = Column(Float, default=0.0)

    assessment = relationship("Assessment", back_populates="answers")

class Interview(Base):
    __tablename__ = "interviews"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("industry_roles.id"), nullable=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    interview_type = Column(String(50), nullable=False)  # technical, hr
    question_text = Column(Text, nullable=False)
    student_answer = Column(Text, nullable=False)
    rubric_scores_json = Column(Text, nullable=False)  # JSON {correctness: 35, depth: 25, example: 15, clarity: 8}
    total_score = Column(Float, nullable=False)
    feedback = Column(Text, nullable=True)
    ai_assisted = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="interviews")

class Internship(Base):
    __tablename__ = "internships"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    duration = Column(String(100), nullable=False)
    mentor_name = Column(String(255), nullable=False)
    mentor_email = Column(String(255), nullable=True)
    mentor_feedback = Column(Text, nullable=True)
    verified_skills_json = Column(Text, nullable=False)  # JSON array of {"skill": "Java", "score": 80}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="internships")

class SkillHistory(Base):
    __tablename__ = "skill_history"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    old_score = Column(Float, nullable=False)
    new_score = Column(Float, nullable=False)
    change_reason = Column(String(255), nullable=False)  # e.g., "Online Assessment Completed", "Interview Evaluation"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="history")

class ShortlistedCandidate(Base):
    __tablename__ = "shortlisted_candidates"
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("industry_roles.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    status = Column(String(50), default="shortlisted")  # shortlisted, interviewing, offered
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
