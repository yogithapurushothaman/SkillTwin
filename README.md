# SkillTwin — Evidence-Based Skill Intelligence & Placement Platform

> **PRD Prototype Version 1.0 (Hackathon MVP)**  
> Turn static resumes into living, evidence-backed skill profiles (**SkillTwin**) connecting students, academicians, industries, and institutions.
> **Core Loop:** Claim → Verify → Map → Gap → Improve → Re-verify → Match

---

## 🌟 System Architecture & Modular Design

Built strictly to the Product Requirements Document (PRD) with decoupled, modular components, services, and hooks:

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Recharts (`/frontend`)
- **Backend:** Python 3.12, FastAPI, SQLite (persisted to `skilltwin.db`), SQLAlchemy ORM, Pydantic schemas (`/backend`)
- **Resume Processing:** PyPDF text extraction with predefined dictionary normalization and alias mapping.
- **Deterministic Core Engines:**
  - `skill_engine.py`: Evidence aggregation rules across assessment (45%), tech interview (25%), internship (20%), and resume claim (10% provisional).
  - `gap_engine.py`: Role blueprint matcher `∑ min(actual / required, 1.0) × weight` with transparent step-by-step calculations and critical gap detection.
  - `assessment_service.py`: Gap-prioritized adaptive test builder with topic-level score reporting (e.g., Arrays, Searching, Trees).
  - `interview_service.py`: Rubric-based scoring (Correctness 40%, Depth 30%, Example 20%, Clarity 10%) with clamped bounds and AI-assisted flag tracking.
  - `placement_service.py`: 6-component weighted readiness index and action plan.
  - `institution_service.py`: Batch analytics across 25+ realistic student profiles, department filters, and intervention impact metrics.
  - `industry_service.py`: Recruiter talent discovery ranked by blueprint match score and candidate shortlisting.

---

## 🚀 Running the Prototype

### 1. Backend Server (FastAPI)
The backend runs on `http://127.0.0.1:8000`:
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
- Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 2. Frontend Application (Next.js)
The frontend runs on `http://localhost:3000`:
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧭 Primary Demo Walkthrough (PRD Section 9)

You can launch the interactive 8-step guide directly from the **"Demo Tour (8 Steps)"** button in the header navbar, or follow this primary user journey:

1. **Claim (Resume Extraction):** Go to the `Resume & Claim` tab. Upload a PDF resume or paste plain text. Skills are extracted into structured JSON and strictly normalized against the curriculum dictionary (unmapped buzzwords are flagged and never auto-added per AI-2). Review and confirm to catalog them as *Self-Declared* (🟡).
2. **Role Blueprint:** Navigate to the `Role Blueprints` tab. Inspect the seeded **Software Developer Intern** blueprint (Java 70, DSA 65, SQL 60, Git 50, OOP 65, Problem Solving 65, Communication 60) or clone/create custom roles.
3. **Gap Engine:** Navigate to the `Gap Engine` tab. The deterministic engine calculates the exact Role Match Score, surfaces *Critical Gaps* (e.g., DSA deficit > 15 pts), and reveals the transparent formula breakdown.
4. **Adaptive Assessment:** Click `Launch Gap-Prioritized Assessment`. The system prioritizes questions targeting the student's highest gap skills. Submit the quiz to view the topic-level scorecard (e.g. Arrays, Sorting) and immediately update the SkillTwin DNA to *Verified* (🟢).
5. **Technical Interview:** Navigate to `Technical Interview`. Answer structured questions scored against the system-defined rubric (Correctness 40%, Depth 30%, Example 20%, Clarity 10%) with AI-assisted evidence logging.
6. **Placement Readiness & DNA:** Navigate to `Placement Readiness` and `Skill DNA & Evidence`. View the 6-component weighted readiness score, readiness band (🟢 Industry Ready ≥75%, 🟡 Needs Development 50-74%, 🔴 Critical Gaps <50%), and audit proof links.
7. **Institution & Batch Analytics:** Use the top-right persona switcher to switch to **Prof. Rajesh Kulkarni (HOD CSE)**. Explore batch-level readiness across 25 students, common skill-gap rankings, and intervention trends.
8. **Industry Recruiter Discovery:** Switch to **Vikramaditya Rao (Lead Recruiter)**. Discover matched candidates ranked by blueprint match score, filter by minimum match or readiness thresholds, inspect verifiable evidence, and toggle candidate shortlists.

---

## 📋 PRD Functional Requirements Matrix

| Requirement ID | Description | Status | Implementation File |
| :--- | :--- | :--- | :--- |
| **FR-1, FR-2, FR-3** | Registration, Auth & 4 Personas | ✅ Completed | `backend/routers/auth_router.py`, `frontend/hooks/useAuth.ts` |
| **FR-4, FR-5, FR-6** | PDF/Text Resume Extraction & Dictionary Normalization | ✅ Completed | `backend/services/resume_service.py`, `frontend/components/resume/ResumeUploadCard.tsx` |
| **FR-7, FR-8** | Self-Declared Storage & Student Review/Edit | ✅ Completed | `backend/routers/resume_router.py`, `frontend/components/resume/ResumeUploadCard.tsx` |
| **FR-9, FR-10, FR-11** | Fixed Thresholds, Claim vs Verified, Skill DNA Grouping | ✅ Completed | `backend/services/skill_engine.py`, `frontend/components/skill-dna/SkillDnaVisualizer.tsx` |
| **FR-12, FR-13** | Traceable Evidence Links & Deterministic Aggregation Rule | ✅ Completed | `frontend/components/skill-dna/EvidenceInspectorModal.tsx` |
| **FR-14, FR-15, FR-16** | Industry Role Blueprints (Seeded SW Intern Role) & Cloning | ✅ Completed | `backend/services/seed_data.py`, `frontend/components/blueprint/BlueprintViewer.tsx` |
| **FR-17, FR-18, FR-19** | Gap Engine, Role Match Score, Transparent Calculation | ✅ Completed | `backend/services/gap_engine.py`, `frontend/components/gap-engine/GapAnalysisCard.tsx` |
| **FR-20, FR-21, FR-22** | Question Bank Metadata & Gap-Prioritized Test Generation | ✅ Completed | `backend/services/assessment_service.py`, `frontend/components/assessment/AdaptiveQuizRunner.tsx` |
| **FR-23, FR-24** | Topic-Level Scores & MVP Question Bank | ✅ Completed | `backend/services/seed_data.py`, `frontend/components/assessment/AdaptiveQuizRunner.tsx` |
| **FR-25, FR-26, FR-27** | Structured Tech Interview, Clamped Rubric Bounds, AI Flag | ✅ Completed | `backend/services/interview_service.py`, `frontend/components/interview/TechnicalInterviewModal.tsx` |
| **FR-28, FR-29** | Scenario-Based HR & Soft Skills Evaluation | ✅ Completed | `frontend/components/interview/HrInterviewModal.tsx` |
| **FR-30, FR-31** | 6-Component Weighted Placement Readiness & Action Plan | ✅ Completed | `backend/services/placement_service.py`, `frontend/components/placement/PlacementReadinessCard.tsx` |
| **FR-32, FR-33, FR-34** | Skill History Audit, Re-test Retake, Progression Chart | ✅ Completed | `backend/services/skill_engine.py`, `frontend/components/history/SkillHistoryChart.tsx` |
| **FR-35, FR-36, FR-37** | Batch View, Common Skill Gaps Ranking, Department Filters | ✅ Completed | `backend/services/institution_service.py`, `frontend/components/institution/InstitutionDashboard.tsx` |
| **FR-38** | Industry Demand vs. Student Skills & Intervention Impact | ✅ Completed | `frontend/components/institution/InstitutionDashboard.tsx` |
| **FR-39, FR-40, FR-41** | Recruiter Candidate Discovery, Verified Evidence & Shortlist | ✅ Completed | `backend/services/industry_service.py`, `frontend/components/industry/IndustryRecruiterDashboard.tsx` |
| **FR-42** | Mentor-Verified Internship Evidence Recording | ✅ Completed | `backend/routers/student_router.py`, `frontend/components/internship/InternshipEvidenceCard.tsx` |
| **AI-1 to AI-6** | Controlled AI Requirements & Clamped Bounded Fallbacks | ✅ Completed | `backend/services/interview_service.py`, `backend/services/resume_service.py` |