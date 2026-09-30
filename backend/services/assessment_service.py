"""
Online Assessment Service (FR-21, FR-22, FR-23, FR-24, FR-33)
Manages question bank, gap-prioritized adaptive test generation,
topic-level score calculation, and evidence generation.
"""
import json
from typing import List, Dict, Any, Optional, Tuple
import datetime
from sqlalchemy.orm import Session
from models.db_models import (
    Question, 
    Assessment, 
    AssessmentAnswer, 
    Student, 
    IndustryRole, 
    RoleSkill,
    StudentSkill, 
    Skill
)
from models.schemas import (
    AssessmentQuestion, 
    QuestionOption, 
    AssessmentResultResponse, 
    TopicScore
)
from services.skill_engine import record_skill_evidence_and_update
from services.gap_engine import evaluate_role_match

def generate_adaptive_assessment(
    db: Session,
    student_id: int,
    target_role_id: Optional[int] = None,
    limit: int = 10
) -> Tuple[int, List[AssessmentQuestion]]:
    """
    FR-22: Generates an assessment prioritizing questions targeting
    the student's critical skill gaps for their target role.
    """
    gap_skill_ids = []
    
    # 1. If role is provided, find gap skills
    if target_role_id:
        try:
            match_res = evaluate_role_match(db, student_id, target_role_id)
            gap_skill_ids = [g.skill_id for g in match_res.critical_gaps]
            # Also add other gaps if critical gaps are few
            if len(gap_skill_ids) < 3:
                gap_skill_ids.extend([g.skill_id for g in match_res.all_gaps if not g.is_met and g.skill_id not in gap_skill_ids])
        except Exception:
            pass

    # 2. Select questions: prioritize gap skills
    selected_questions: List[Question] = []
    
    if gap_skill_ids:
        # Fetch up to 70% from gap skills
        gap_limit = max(4, int(limit * 0.7))
        gap_qs = db.query(Question).filter(Question.skill_id.in_(gap_skill_ids)).order_by(Question.id.asc()).limit(gap_limit).all()
        selected_questions.extend(gap_qs)
        
    # Fill remaining from other skills
    needed = limit - len(selected_questions)
    if needed > 0:
        existing_ids = [q.id for q in selected_questions]
        filler_qs = db.query(Question).filter(~Question.id.in_(existing_ids) if existing_ids else True).order_by(Question.id.asc()).limit(needed).all()
        selected_questions.extend(filler_qs)

    # 3. Create Assessment instance in DB
    assessment = Assessment(
        student_id=student_id,
        target_role_id=target_role_id,
        total_score=0.0,
        max_score=float(sum(q.marks for q in selected_questions)),
        status="in_progress",
        created_at=datetime.datetime.utcnow()
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # 4. Map to AssessmentQuestion DTOs
    question_dtos: List[AssessmentQuestion] = []
    for q in selected_questions:
        try:
            opts_raw = json.loads(q.options_json)
            opts = [QuestionOption(id=opt["id"], text=opt["text"]) for opt in opts_raw]
        except Exception:
            opts = [
                QuestionOption(id="A", text="Option A"),
                QuestionOption(id="B", text="Option B"),
                QuestionOption(id="C", text="Option C"),
                QuestionOption(id="D", text="Option D"),
            ]
            
        question_dtos.append(AssessmentQuestion(
            id=q.id,
            skill_id=q.skill_id,
            skill_name=q.skill.name if q.skill else "General",
            topic=q.topic,
            difficulty=q.difficulty,
            marks=q.marks,
            question_text=q.question_text,
            options=opts
        ))

    return assessment.id, question_dtos

def grade_assessment_submission(
    db: Session,
    assessment_id: int,
    student_id: int,
    answers: List[Dict[str, Any]]
) -> AssessmentResultResponse:
    """
    FR-23: Evaluates submitted answers, updates skill and topic-level scores,
    and commits verifiable evidence records.
    """
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise ValueError(f"Assessment #{assessment_id} not found")

    total_marks_earned = 0.0
    total_marks_possible = 0.0
    
    # Track performance by skill and topic
    # skill_id -> {"total": float, "earned": float, "skill_name": str}
    skill_stats: Dict[int, Dict[str, Any]] = {}
    # (topic, skill_name) -> {"total_q": int, "correct_q": int, "marks_earned": float, "marks_total": float}
    topic_stats: Dict[Tuple[str, str], Dict[str, Any]] = {}

    try:
        for ans in answers:
            q_id = ans.get("question_id")
            chosen = str(ans.get("selected_option_id", "")).strip().upper()
            
            q = db.query(Question).filter(Question.id == q_id).first()
            if not q:
                continue
                
            is_correct = (chosen == q.correct_answer.strip().upper())
            marks_awarded = float(q.marks) if is_correct else 0.0
            
            total_marks_earned += marks_awarded
            total_marks_possible += float(q.marks)
            
            # Save record
            db_answer = AssessmentAnswer(
                assessment_id=assessment_id,
                question_id=q.id,
                selected_option=chosen,
                is_correct=is_correct,
                score_awarded=marks_awarded
            )
            db.add(db_answer)
            
            # Aggregate skill stats
            if q.skill_id not in skill_stats:
                skill_stats[q.skill_id] = {
                    "total": 0.0, 
                    "earned": 0.0, 
                    "name": q.skill.name if q.skill else "Skill"
                }
            skill_stats[q.skill_id]["total"] += float(q.marks)
            skill_stats[q.skill_id]["earned"] += marks_awarded
            
            # Aggregate topic stats
            key = (q.topic, q.skill.name if q.skill else "General")
            if key not in topic_stats:
                topic_stats[key] = {
                    "total_q": 0,
                    "correct_q": 0,
                    "marks_earned": 0.0,
                    "marks_total": 0.0
                }
            topic_stats[key]["total_q"] += 1
            if is_correct:
                topic_stats[key]["correct_q"] += 1
            topic_stats[key]["marks_earned"] += marks_awarded
            topic_stats[key]["marks_total"] += float(q.marks)

        # Finalize Assessment
        assessment.total_score = total_marks_earned
        assessment.max_score = total_marks_possible if total_marks_possible > 0 else 100.0
        assessment.status = "completed"
        db.commit()

        overall_pct = round((total_marks_earned / assessment.max_score) * 100.0, 1) if assessment.max_score > 0 else 0.0

        # Format topic scores (FR-23)
        topic_scores_list: List[TopicScore] = []
        for (t_name, s_name), t_data in topic_stats.items():
            t_pct = round((t_data["marks_earned"] / t_data["marks_total"]) * 100.0, 1) if t_data["marks_total"] > 0 else 0.0
            topic_scores_list.append(TopicScore(
                topic=t_name,
                skill_name=s_name,
                score=t_pct,
                total_questions=t_data["total_q"],
                correct_questions=t_data["correct_q"]
            ))

        # Update skills & generate verifiable evidence (FR-12, FR-13, FR-32)
        skill_updates: List[Dict[str, Any]] = []
        for skill_id, s_data in skill_stats.items():
            if s_data["total"] > 0:
                assessed_score = round((s_data["earned"] / s_data["total"]) * 100.0, 1)
                
                details = {
                    "assessment_id": assessment_id,
                    "marks_earned": s_data["earned"],
                    "marks_total": s_data["total"],
                    "topics_tested": [t.topic for t in topic_scores_list if t.skill_name == s_data["name"]]
                }
                
                old_score, new_score = record_skill_evidence_and_update(
                    db=db,
                    student_id=student_id,
                    skill_id=skill_id,
                    source="assessment",
                    score=assessed_score,
                    details_json=json.dumps(details),
                    ai_assisted=False,
                    change_reason=f"Online Assessment #{assessment_id} Completed"
                )
                
                skill_updates.append({
                    "skill_id": skill_id,
                    "skill_name": s_data["name"],
                    "assessed_score": assessed_score,
                    "old_score": old_score,
                    "new_score": new_score,
                    "improvement": round(new_score - old_score, 1)
                })

        feedback = (
            f"You scored {overall_pct}% ({total_marks_earned}/{assessment.max_score} marks). "
            f"Evidence recorded for {len(skill_updates)} skills. Your Skill DNA and Role Match have been updated."
        )

        return AssessmentResultResponse(
            assessment_id=assessment_id,
            student_id=student_id,
            total_score=total_marks_earned,
            max_score=assessment.max_score,
            percentage=overall_pct,
            topic_scores=topic_scores_list,
            skill_updates=skill_updates,
            feedback=feedback
        )
    except Exception as e:
        db.rollback()
        raise e
