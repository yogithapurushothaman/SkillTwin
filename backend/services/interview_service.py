"""
Interview Service (FR-25, FR-26, FR-27, FR-28, FR-29, AI-3, AI-4, AI-6)
Evaluates structured technical and HR interview answers against predefined rubrics.
Clamps criteria scores to fixed bounds and computes deterministic final scores.
"""
import json
import re
from typing import Dict, Any, List, Optional
import datetime
from sqlalchemy.orm import Session
from models.db_models import Student, Skill, Interview
from models.schemas import InterviewResponse, InterviewEvaluationResult
from services.skill_engine import record_skill_evidence_and_update

# Fixed Rubric Criteria & Bounds (AI-3: System defined, not AI defined)
TECHNICAL_RUBRIC = {
    "correctness": {"max": 40.0, "weight": 0.40, "desc": "Technical accuracy and conceptual soundness"},
    "depth": {"max": 30.0, "weight": 0.30, "desc": "Underlying mechanisms, edge cases, space/time trade-offs"},
    "example": {"max": 20.0, "weight": 0.20, "desc": "Real-world code illustration, practical scenario reference"},
    "clarity": {"max": 10.0, "weight": 0.10, "desc": "Concise communication, structured response, precise terminology"}
}

HR_RUBRIC = {
    "professionalism": {"max": 30.0, "weight": 0.30, "desc": "Accountability, ethical conduct, reliability"},
    "communication": {"max": 25.0, "weight": 0.25, "desc": "Clear articulation, active listening, structured reasoning"},
    "teamwork": {"max": 25.0, "weight": 0.25, "desc": "Conflict resolution, empathy, collaboration over ego"},
    "adaptability": {"max": 20.0, "weight": 0.20, "desc": "Constructive response to adversity, willingness to learn"}
}

# Seeded Interview Question Bank
INTERVIEW_QUESTIONS = [
    {
        "id": 1,
        "type": "technical",
        "skill": "DSA",
        "topic": "Hash Maps & Collisions",
        "question": "Explain how HashMap handles hash collisions in Java. What happens when multiple keys produce the same hash code, and how does Java 8 optimize this?",
        "expected_keywords": ["hashcode", "equals", "bucket", "linked list", "red-black tree", "treeify", "threshold 8", "o(log n)"]
    },
    {
        "id": 2,
        "type": "technical",
        "skill": "SQL",
        "topic": "Indexing & Joins",
        "question": "How do B-Tree indexes accelerate queries in SQL? When would an index degrade performance instead of improving it?",
        "expected_keywords": ["b-tree", "lookup", "binary search", "insert", "update", "delete", "write overhead", "cardinality", "full table scan"]
    },
    {
        "id": 3,
        "type": "technical",
        "skill": "OOP",
        "topic": "Polymorphism & Design",
        "question": "Differentiate between compile-time and runtime polymorphism with concrete code examples. Why is composition preferred over inheritance in modern architecture?",
        "expected_keywords": ["overloading", "overriding", "dynamic method dispatch", "vtable", "tight coupling", "composition", "has-a", "is-a", "flexibility"]
    },
    {
        "id": 4,
        "type": "technical",
        "skill": "Git",
        "topic": "Branching & Merge Conflicts",
        "question": "Explain the difference between git merge and git rebase. Under what circumstances would rebasing a public shared branch be considered dangerous?",
        "expected_keywords": ["merge commit", "linear history", "fast-forward", "rebase", "rewriting history", "shared branch", "force push", "conflict"]
    },
    {
        "id": 5,
        "type": "hr",
        "skill": "Teamwork",
        "topic": "Conflict Resolution",
        "question": "Describe a situation where a teammate strongly disagreed with your technical decision or architectural approach. How did you handle the impasse and what was the outcome?",
        "expected_keywords": ["listen", "data", "benchmark", "trade-off", "meeting", "compromise", "respect", "consensus", "user impact"]
    },
    {
        "id": 6,
        "type": "hr",
        "skill": "Adaptability",
        "topic": "Handling Changing Priorities",
        "question": "Tell me about a time when project requirements changed abruptly close to a deadline. How did you re-prioritize your deliverables and maintain quality?",
        "expected_keywords": ["prioritize", "mvp", "communication", "stakeholder", "scope", "focus", "quality", "calm", "delivery"]
    }
]

def get_interview_questions(interview_type: Optional[str] = None) -> List[Dict[str, Any]]:
    if not interview_type:
        return INTERVIEW_QUESTIONS
    return [q for q in INTERVIEW_QUESTIONS if q["type"].lower() == interview_type.lower()]

def evaluate_free_text_answer(
    question_type: str,
    question_text: str,
    student_answer: str,
    expected_keywords: List[str]
) -> InterviewEvaluationResult:
    """
    Deterministic rule-based rubric evaluation engine (with LLM schema compatibility).
    Clamps all subscores strictly to system-defined rubric bounds (FR-27, AI-3).
    """
    answer_clean = student_answer.strip().lower()
    word_count = len(answer_clean.split())
    
    # 1. Keyword density & conceptual coverage
    keyword_hits = [kw for kw in expected_keywords if kw in answer_clean]
    coverage_ratio = len(keyword_hits) / len(expected_keywords) if expected_keywords else 0.5
    
    # 2. Length & depth metric
    # Detailed answers: > 80 words; Adequate: > 40 words
    depth_factor = min(1.0, word_count / 100.0)
    
    # 3. Code / Example indicators
    has_code_or_example = bool(re.search(r'(for example|e\.g\.|such as|class |def |function|table |select |git )', answer_clean))
    
    if question_type == "technical":
        # Technical rubric bounds: correctness (0-40), depth (0-30), example (0-20), clarity (0-10)
        correctness = min(40.0, max(5.0, round(coverage_ratio * 38.0 + 2.0, 1)))
        depth = min(30.0, max(4.0, round(depth_factor * 26.0 + 4.0, 1)))
        example = 18.0 if has_code_or_example else round(min(12.0, word_count * 0.15), 1)
        clarity = 9.0 if word_count >= 30 else 5.0
        
        total = round(correctness + depth + example + clarity, 1)
        feedback = (
            f"Evaluated across technical rubric criteria: Correctness: {correctness}/40, "
            f"Depth: {depth}/30, Example: {example}/20, Clarity: {clarity}/10. "
            f"Identified {len(keyword_hits)}/{len(expected_keywords)} core domain concepts. "
            + ("Strong practical illustration provided." if has_code_or_example else "Consider including explicit code or architectural examples.")
        )
        
        return InterviewEvaluationResult(
            correctness=correctness,
            depth=depth,
            example=example,
            clarity=clarity,
            total_score=total,
            feedback=feedback,
            ai_assisted=True
        )
    else:
        # HR rubric: professionalism 30, communication 25, teamwork 25, adaptability 20
        prof = min(30.0, max(10.0, round(coverage_ratio * 25.0 + 5.0, 1)))
        comm = min(25.0, max(8.0, round(depth_factor * 20.0 + 5.0, 1)))
        team = min(25.0, max(8.0, round(coverage_ratio * 20.0 + 5.0, 1)))
        adapt = min(20.0, max(6.0, round(depth_factor * 16.0 + 4.0, 1)))
        total = round(prof + comm + team + adapt, 1)
        
        feedback = (
            f"Scenario-based HR evaluation: Professionalism: {prof}/30, Communication: {comm}/25, "
            f"Teamwork: {team}/25, Adaptability: {adapt}/20. "
            f"Demonstrated thoughtful situational reasoning without pseudo-scientific personality profiling."
        )
        return InterviewEvaluationResult(
            correctness=prof,
            depth=comm,
            example=team,
            clarity=adapt,
            total_score=total,
            feedback=feedback,
            ai_assisted=True
        )

def process_interview_submission(
    db: Session,
    student_id: int,
    question_id: int,
    interview_type: str,
    student_answer: str,
    role_id: Optional[int] = None
) -> InterviewResponse:
    """
    Evaluates interview answer, clamps scores to rubric bounds,
    stores in DB, and commits verifiable evidence flagged as ai_assisted=True (AI-6).
    """
    q_data = next((q for q in INTERVIEW_QUESTIONS if q["id"] == question_id), None)
    if not q_data:
        raise ValueError(f"Question #{question_id} not found in interview bank")
        
    skill_name = q_data["skill"]
    skill = db.query(Skill).filter(Skill.name == skill_name).first()
    if not skill:
        raise ValueError(f"Skill '{skill_name}' not found in dictionary")

    eval_result = evaluate_free_text_answer(
        question_type=interview_type,
        question_text=q_data["question"],
        student_answer=student_answer,
        expected_keywords=q_data["expected_keywords"]
    )

    rubric_scores = {
        "correctness": eval_result.correctness,
        "depth": eval_result.depth,
        "example": eval_result.example,
        "clarity": eval_result.clarity
    }

    interview = Interview(
        student_id=student_id,
        role_id=role_id,
        skill_id=skill.id,
        interview_type=interview_type,
        question_text=q_data["question"],
        student_answer=student_answer,
        rubric_scores_json=json.dumps(rubric_scores),
        total_score=eval_result.total_score,
        feedback=eval_result.feedback,
        ai_assisted=True,
        created_at=datetime.datetime.utcnow()
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    # Record verifiable evidence with ai_assisted=True (AI-6, FR-12, FR-13)
    record_skill_evidence_and_update(
        db=db,
        student_id=student_id,
        skill_id=skill.id,
        source="tech_interview" if interview_type == "technical" else "hr_interview",
        score=eval_result.total_score,
        details_json=json.dumps({
            "interview_id": interview.id,
            "question": q_data["question"],
            "rubric_scores": rubric_scores,
            "feedback": eval_result.feedback
        }),
        ai_assisted=True,
        change_reason=f"Structured {interview_type.capitalize()} Interview Evaluated"
    )

    return InterviewResponse(
        id=interview.id,
        student_id=student_id,
        interview_type=interview_type,
        skill_name=skill_name,
        question_text=q_data["question"],
        student_answer=student_answer,
        rubric_scores=rubric_scores,
        total_score=eval_result.total_score,
        feedback=eval_result.feedback,
        ai_assisted=True,
        created_at=interview.created_at
    )
