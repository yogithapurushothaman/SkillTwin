import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def log_test(title):
    print(f"\n{'='*70}\n[TEST] {title}\n{'='*70}")

def assert_true(cond, msg):
    if not cond:
        print(f"FAILED: {msg}")
        sys.exit(1)
    else:
        print(f"PASS: {msg}")

def run_tests():
    session = requests.Session()

    # Step 0: Ensure fresh seed state
    log_test("Step 0: Reset Database to Baseline Seed State")
    r = session.post(f"{BASE_URL}/api/dev/reset-database")
    assert_true(r.status_code == 200, "Database reset endpoint responded 200 OK")
    print("  Database re-seeded with fresh baseline data.")

    # Step 1: Health / Root check
    log_test("Step 1: Backend Health Check")
    r = session.get(f"{BASE_URL}/")
    assert_true(r.status_code == 200, f"Root endpoint status {r.status_code}")
    data = r.json()
    assert_true("SkillTwin" in data.get("app", ""), f"API Title: {data.get('app')}")

    # Step 2: Load Seeded Student Aarav Sharma (ID 1)
    log_test("Step 2: Load Student Profile (Aarav Sharma)")
    r = session.get(f"{BASE_URL}/api/students/1")
    assert_true(r.status_code == 200, f"Student profile status {r.status_code}")
    st_data = r.json()
    assert_true(st_data.get("name") == "Aarav Sharma", f"Student name is {st_data.get('name')}")
    assert_true("Computer Science" in st_data.get("department", ""), f"Department: {st_data.get('department')}")
    print(f"  Aarav Sharma loaded successfully: CGPA={st_data.get('cgpa')}, Skills={len(st_data.get('skills', []))}")

    # Step 3: Skill DNA Profile & Categories
    log_test("Step 3: Retrieve Student Skill DNA")
    r = session.get(f"{BASE_URL}/api/students/1/dna")
    assert_true(r.status_code == 200, f"Skill DNA status {r.status_code}")
    dna = r.json()
    skills = dna.get("skills", [])
    assert_true(len(skills) > 0, f"DNA has {len(skills)} skills")
    assert_true("technical_skills" in dna and "problem_solving_skills" in dna, "Category groupings present")
    print(f"  Verified Count: {dna.get('verified_count')}, Self-Declared: {dna.get('self_declared_count')}")

    # Step 4: Skill History (Testing the fix for AttributeError)
    log_test("Step 4: Skill History Audit Records")
    r = session.get(f"{BASE_URL}/api/students/1/history")
    assert_true(r.status_code == 200, f"Skill history status {r.status_code}")
    hist = r.json()
    print(f"  Total history records: {hist.get('total_records')}")
    print(f"  Progress summary items: {len(hist.get('progress_summary', []))}")
    assert_true(isinstance(hist.get("history"), list), "History records returned as list")

    # Step 5: Resume Extraction Edge Cases
    log_test("Step 5a: Resume Text Extraction - Empty Input Edge Case")
    r = session.post(f"{BASE_URL}/api/resume/extract-text", json={"text": "   "})
    assert_true(r.status_code == 400, f"Empty resume rejected with HTTP 400 (got {r.status_code})")

    log_test("Step 5b: Resume Text Extraction - Unknown Buzzwords Filtering")
    buzzword_resume = """
    Aarav Sharma
    Skills: Java, Data Structures and Algorithms, SQL, Kubernetes, Flutter, GraphQL, Blockchain
    Experience: Built web applications using Java and SQL database. Solved 200 DSA problems.
    """
    r = session.post(f"{BASE_URL}/api/resume/extract-text", json={"text": buzzword_resume})
    assert_true(r.status_code == 200, f"Resume extract status {r.status_code}")
    res_data = r.json()
    extracted_names = [s["normalized_name"] for s in res_data.get("skills", [])]
    unrecognized = res_data.get("unrecognized_terms", [])
    print(f"  Canonical Extracted Skills: {extracted_names}")
    print(f"  Unrecognized Terms: {unrecognized}")
    assert_true("Java" in extracted_names, "Java extracted")
    assert_true("DSA" in extracted_names, "DSA extracted and normalized")
    assert_true(any("Kubernetes" in u for u in unrecognized), "Kubernetes correctly tagged unrecognized")
    assert_true(any("Graph" in u for u in unrecognized), "GraphQL correctly tagged unrecognized")
    assert_true(any("Flutter" in u for u in unrecognized), "Flutter correctly tagged unrecognized")

    # Step 6: Review and Confirm Self-Declared Skills
    log_test("Step 6: Review & Confirm Extracted Skills (Self-Declared)")
    confirm_payload = {
        "skills": [
            {"normalized_name": "Java", "claimed_level": "Advanced", "claimed_score": 75.0},
            {"normalized_name": "DSA", "claimed_level": "Basic", "claimed_score": 40.0},
            {"normalized_name": "SQL", "claimed_level": "Intermediate", "claimed_score": 60.0}
        ]
    }
    r = session.post(f"{BASE_URL}/api/resume/confirm/1", json=confirm_payload)
    assert_true(r.status_code == 200, f"Resume confirm status {r.status_code}")
    confirm_res = r.json()
    assert_true("Successfully mapped" in confirm_res.get("message", ""), f"Response message: {confirm_res.get('message')}")

    # Verify skills recorded as self_declared
    r = session.get(f"{BASE_URL}/api/students/1/dna")
    dna_after_resume = r.json()
    java_skill = next((s for s in dna_after_resume["skills"] if s["skill_name"] == "Java"), None)
    assert_true(java_skill is not None, "Java skill exists in DNA")
    print(f"  Java status: {java_skill['verification_status']}, claimed: {java_skill['claimed_score']}, score: {java_skill['score']}")

    # Step 7: Load Role Blueprint & Evaluate Match
    log_test("Step 7: Role Blueprint & Deterministic Gap Match Calculation")
    r = session.get(f"{BASE_URL}/api/gap/1/1")
    assert_true(r.status_code == 200, f"Gap analysis status {r.status_code}")
    gap_data = r.json()
    match_score_initial = gap_data.get("overall_match_score")
    print(f"  Target Role: {gap_data.get('role_title')} at {gap_data.get('company')}")
    print(f"  Initial Match Score: {match_score_initial}%")
    print(f"  Skills Met: {gap_data.get('skills_met_count')} / {gap_data.get('total_skills_count')}")
    
    crit_gaps = gap_data.get("critical_gaps", [])
    crit_gap_names = [g["skill_name"] for g in crit_gaps]
    print(f"  Critical Gaps Found: {crit_gap_names}")
    assert_true(len(crit_gaps) > 0, "At least 1 critical gap identified")
    assert_true("DSA" in crit_gap_names, "DSA is identified as a critical gap")

    # Step 8: Start Gap-Prioritized Assessment
    log_test("Step 8: Start Adaptive Assessment Targeting Gaps")
    r = session.post(f"{BASE_URL}/api/assessment/start", json={"student_id": 1, "target_role_id": 1})
    assert_true(r.status_code == 200, f"Assessment start status {r.status_code}")
    test_session = r.json()
    assessment_id = test_session.get("assessment_id")
    questions = test_session.get("questions", [])
    assert_true(assessment_id is not None, f"Assessment ID created: {assessment_id}")
    assert_true(len(questions) > 0, f"Questions returned: {len(questions)}")
    
    q_skills = [q["skill_name"] for q in questions]
    print(f"  Assessment #{assessment_id} questions target: {set(q_skills)}")
    assert_true("DSA" in q_skills, "Gap skill DSA prioritized in question selection")

    # Step 9: Grade Assessment with 100% Score
    log_test("Step 9: Submit & Grade Assessment with Verified Answers")
    # For each question, get correct answer from database directly or simulate correct option
    # First, let's query the question bank or test submitting valid option choices
    submission_answers = []
    from database import SessionLocal
    from models.db_models import Question
    db = SessionLocal()
    try:
        for q in questions:
            q_record = db.query(Question).filter(Question.id == q["id"]).first()
            submission_answers.append({
                "question_id": q["id"],
                "selected_option_id": q_record.correct_answer.strip()
            })
    finally:
        db.close()

    r = session.post(f"{BASE_URL}/api/assessment/submit", json={
        "assessment_id": assessment_id,
        "student_id": 1,
        "answers": submission_answers
    })
    assert_true(r.status_code == 200, f"Assessment submit status {r.status_code}")
    res_grade = r.json()
    print(f"  Total Score: {res_grade.get('total_score')} / {res_grade.get('max_score')}")
    print(f"  Percentage: {res_grade.get('percentage')}%")
    assert_true(res_grade.get("percentage") == 100.0, "Scored 100% on all correct answers")
    
    skill_updates = res_grade.get("skill_updates", [])
    print(f"  Skill updates recorded: {len(skill_updates)}")
    for su in skill_updates:
        print(f"    - {su['skill_name']}: old={su['old_score']} -> new={su['new_score']} (improvement: +{su['improvement']})")

    # Step 10: Verify Role Match Score Increased from Persisted DB
    log_test("Step 10: Recalculate Role Match from Persisted DB")
    r = session.get(f"{BASE_URL}/api/gap/1/1")
    assert_true(r.status_code == 200, f"Post-assessment gap analysis status {r.status_code}")
    post_gap_data = r.json()
    match_score_new = post_gap_data.get("overall_match_score")
    print(f"  Previous Match Score: {match_score_initial}%")
    print(f"  New Match Score:      {match_score_new}%")
    assert_true(match_score_new > match_score_initial, f"Match score increased from {match_score_initial}% to {match_score_new}%")

    # Step 11: Verify Skill DNA Verification Status Updated to VERIFIED (🟢)
    log_test("Step 11: Check Skill DNA Status Post-Assessment")
    r = session.get(f"{BASE_URL}/api/students/1/dna")
    assert_true(r.status_code == 200, f"Post-assessment DNA status {r.status_code}")
    post_dna = r.json()
    dsa_skill = next((s for s in post_dna["skills"] if s["skill_name"] == "DSA"), None)
    assert_true(dsa_skill is not None, "DSA skill exists in post-assessment DNA")
    print(f"  DSA Skill Verification Status: {dsa_skill['verification_status']}")
    print(f"  DSA Assessment Score: {dsa_skill['assessment_score']}")
    print(f"  DSA Aggregated Score: {dsa_skill['score']}")
    assert_true(dsa_skill["verification_status"] == "verified", "DSA is now VERIFIED [GREEN]")
    assert_true(dsa_skill["assessment_score"] == 100.0, "Assessment sub-score is 100.0")

    # Step 12: Interview Evaluation Engine (Technical Interview)
    log_test("Step 12: Interview Evaluation & Rubric Breakdown")
    interview_payload = {
        "student_id": 1,
        "question_id": 1,
        "interview_type": "technical",
        "student_answer": "In Java, a HashMap uses hashcode and equals methods to index elements into an array of buckets. When a collision occurs, entries are stored in a linked list in the bucket. In Java 8, when the bucket exceeds threshold 8, the linked list treeify process converts it into a red-black tree, reducing worst-case lookup from O(n) to O(log n). For example, class Node stores the key, value, hash, and next pointer."
    }
    r = session.post(f"{BASE_URL}/api/interview/submit", json=interview_payload)
    assert_true(r.status_code == 200, f"Interview evaluation status {r.status_code}")
    int_res = r.json()
    print(f"  Interview Score: {int_res.get('total_score')}/100")
    print(f"  Rubric Breakdown: {int_res.get('rubric_scores')}")
    print(f"  Feedback: {int_res.get('feedback')[:100]}...")
    assert_true(int_res.get("total_score") >= 70, "Rubric awarded high score for detailed technical explanation")
    assert_true(int_res.get("ai_assisted") is True, "Interview flagged as ai_assisted=True")

    # Step 13: Placement Readiness Index
    log_test("Step 13: Placement Readiness Index")
    r = session.get(f"{BASE_URL}/api/placement/1/readiness")
    assert_true(r.status_code == 200, f"Placement readiness status {r.status_code}")
    readiness = r.json()
    print(f"  Overall Readiness Score: {readiness.get('overall_readiness_score')}%")
    print(f"  Readiness Band: {readiness.get('readiness_band')}")
    print(f"  Components Count: {len(readiness.get('components', []))}")
    assert_true("components" in readiness, "Readiness components calculated")

    # Step 14: Secondary Dashboards - Institution Analytics
    log_test("Step 14: Institution Cohort Analytics")
    r = session.get(f"{BASE_URL}/api/institution/batch-analytics")
    assert_true(r.status_code == 200, f"Institution analytics status {r.status_code}")
    inst = r.json()
    print(f"  Cohort Total Students: {inst.get('total_students')}")
    print(f"  Readiness Distribution Bands: {len(inst.get('readiness_distribution', []))}")
    print(f"  Common Skill Gaps Tracked: {len(inst.get('common_skill_gaps', []))}")
    assert_true(inst.get("total_students") >= 25, "Cohort includes all seeded students")

    # Step 15: Recruiter Talent Discovery & Shortlisting
    log_test("Step 15: Recruiter Candidate Discovery & Shortlist Toggle")
    r = session.get(f"{BASE_URL}/api/industry/candidates?role_id=1")
    assert_true(r.status_code == 200, f"Recruiter candidates status {r.status_code}")
    candidates = r.json()
    print(f"  Found {len(candidates)} ranked candidates for Software Developer Intern")
    assert_true(len(candidates) > 0, "Candidates returned")
    
    # Check Aarav Sharma is in candidate list
    aarav_candidate = next((c for c in candidates if c["student_id"] == 1), None)
    assert_true(aarav_candidate is not None, "Aarav Sharma is ranked in candidate list")
    initial_shortlist_state = aarav_candidate.get("is_shortlisted", False)
    print(f"  Aarav Sharma initial shortlisted state: {initial_shortlist_state}")

    # Toggle shortlist
    r = session.post(f"{BASE_URL}/api/industry/shortlist", json={"role_id": 1, "student_id": 1})
    assert_true(r.status_code == 200, f"Shortlist toggle status {r.status_code}")
    toggle_res = r.json()
    new_state = toggle_res.get("is_shortlisted")
    print(f"  Aarav Sharma new shortlisted state: {new_state}")
    assert_true(new_state != initial_shortlist_state, "Shortlist toggle inverted state")

    # Re-verify candidates list reflects persisted shortlist
    r = session.get(f"{BASE_URL}/api/industry/candidates?role_id=1")
    candidates_after = r.json()
    aarav_candidate_after = next((c for c in candidates_after if c["student_id"] == 1), None)
    assert_true(aarav_candidate_after["is_shortlisted"] == new_state, "Persisted shortlist reflected in candidate query")

    # Step 16: Verify Final Skill History Audit Trail
    log_test("Step 16: Verify Full Chronological Audit Trail")
    r = session.get(f"{BASE_URL}/api/students/1/history")
    assert_true(r.status_code == 200, f"Audit trail status {r.status_code}")
    final_hist = r.json()
    reasons = [h["change_reason"] for h in final_hist.get("history", [])]
    print(f"  Recorded change reasons in audit trail:")
    for rs in reasons[:5]:
        print(f"    - {rs}")
    assert_true(any("Online Assessment" in rs for rs in reasons), "Assessment change reason logged")
    assert_true(any("Interview" in rs for rs in reasons), "Interview change reason logged")

    print("\n" + "="*70)
    print("ALL 16 VERTICAL SLICE & AUDIT TRAIL TESTS PASSED PERFECTLY!")
    print("="*70 + "\n")

if __name__ == "__main__":
    run_tests()
