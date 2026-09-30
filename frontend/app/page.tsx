'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSkillTwin } from '@/hooks/useSkillTwin';
import { useGapEngine } from '@/hooks/useGapEngine';
import { usePlacementReadiness } from '@/hooks/usePlacementReadiness';

// Layout & Navigation
import { Navbar } from '@/components/layout/Navbar';
import { DemoTourModal } from '@/components/layout/DemoTourModal';

// Feature Components
import { SkillDnaVisualizer } from '@/components/skill-dna/SkillDnaVisualizer';
import { ResumeUploadCard } from '@/components/resume/ResumeUploadCard';
import { BlueprintViewer } from '@/components/blueprint/BlueprintViewer';
import { GapAnalysisCard } from '@/components/gap-engine/GapAnalysisCard';
import { AdaptiveQuizRunner } from '@/components/assessment/AdaptiveQuizRunner';
import { TechnicalInterviewModal } from '@/components/interview/TechnicalInterviewModal';
import { HrInterviewModal } from '@/components/interview/HrInterviewModal';
import { PlacementReadinessCard } from '@/components/placement/PlacementReadinessCard';
import { SkillHistoryChart } from '@/components/history/SkillHistoryChart';
import { InternshipEvidenceCard } from '@/components/internship/InternshipEvidenceCard';
import { InstitutionDashboard } from '@/components/institution/InstitutionDashboard';
import { IndustryRecruiterDashboard } from '@/components/industry/IndustryRecruiterDashboard';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { personas, currentUser, switchPersona, switchRole } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('dna');
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  // Active student profile (default to Aarav Sharma, ID 1)
  const [activeStudentId, setActiveStudentId] = useState<number>(1);

  // Sync active student ID with persona if a student is chosen
  const studentIdToUse =
    currentUser?.role === 'student' && currentUser.student_id
      ? currentUser.student_id
      : activeStudentId;

  // Domain Hooks
  const {
    student,
    dna,
    history,
    internships,
    loading: dnaLoading,
    refreshSkillTwin
  } = useSkillTwin(studentIdToUse);

  const {
    blueprints,
    selectedRoleId,
    selectedRole,
    matchResult,
    selectRole,
    refreshGap
  } = useGapEngine(studentIdToUse);

  const {
    readiness,
    refreshReadiness
  } = usePlacementReadiness(studentIdToUse);

  // Callback to refresh all student metrics upon verification (assessment/interview/internship)
  const handleEvidenceAdded = () => {
    refreshSkillTwin();
    refreshGap();
    refreshReadiness();
  };

  const handlePersonaChange = (userId: number) => {
    switchPersona(userId);
    const p = personas.find(u => u.id === userId);
    if (p) {
      if (p.role === 'student') {
        setActiveTab('dna');
        if (p.student_id) setActiveStudentId(p.student_id);
      } else if (p.role === 'academician' || p.role === 'admin') {
        setActiveTab('institution');
      } else if (p.role === 'industry') {
        setActiveTab('industry');
      }
    }
  };

  const handleActionClick = (actionName: string) => {
    const act = actionName.toLowerCase();
    if (act.includes('assessment') || act.includes('quiz') || act.includes('test')) {
      setActiveTab('assessment');
    } else if (act.includes('interview') || act.includes('technical')) {
      setActiveTab('tech_interview');
    } else if (act.includes('mentor') || act.includes('internship')) {
      setActiveTab('dna');
    } else {
      setActiveTab('assessment');
    }
  };

  const handleInspectStudentDna = (sid: number) => {
    setActiveStudentId(sid);
    switchRole('student');
    setActiveTab('dna');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EE] text-[#18181B]">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        personas={personas}
        onSwitchPersona={handlePersonaChange}
        onOpenTour={() => setIsTourOpen(true)}
        activeTab={activeTab}
        onTabChange={tabId => setActiveTab(tabId)}
      />

      {/* Hero Section inspired directly by reference design */}
      <section className="border-b border-[#E7E2D9] bg-[#FAF8F5]/60 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Eyebrow Label */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-6 h-[1px] bg-[#78716C]"></span>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#78716C]">
              FOR STUDENTS, ACADEMIA & INDUSTRY RECRUITERS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Headline */}
            <div className="lg:col-span-7">
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-[#18181B] leading-[1.08]">
                Turn Static Resumes into Verifiable{' '}
                <span className="hand-drawn-underline text-[#18181B]">
                  Living Skill DNA.
                </span>
              </h1>
            </div>

            {/* Right Sub-paragraph & Actions */}
            <div className="lg:col-span-5 space-y-5 lg:pt-1">
              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
                Stop trusting inflated keyword claims. SkillTwin deterministically validates proficiencies through gap-prioritized assessments, rubric-clamped technical interviews, and mentor-verified internships.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => setActiveTab('gaps')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#18181B] text-white hover:bg-[#2E2E33] text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <span>Analyze Skill Gaps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('blueprint')}
                  className="px-4 py-2.5 rounded-lg bg-white border border-[#DDD6CA] hover:bg-[#FAF8F5] text-[#18181B] text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Role Blueprints
                </button>
                <button
                  onClick={() => setIsTourOpen(true)}
                  className="px-3.5 py-2.5 rounded-lg bg-[#FAF1EC] border border-[#F4CDC4] hover:bg-[#FBE9E2] text-[#D46238] text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>8-Step Demo Tour</span>
                </button>
              </div>

              {/* Micro Kicker */}
              <div className="pt-2 text-[10px] font-mono uppercase tracking-[0.16em] text-[#78716C]">
                DETERMINISTIC EVALUATION · ZERO AI HALLUCINATIONS · FULL EVIDENCE AUDIT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* TAB 1: Skill DNA Profile & Evidence */}
        {activeTab === 'dna' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <SkillDnaVisualizer
              dna={dna}
              onTakeAssessment={() => setActiveTab('assessment')}
            />
            <InternshipEvidenceCard
              studentId={studentIdToUse}
              internships={internships}
              onInternshipAdded={handleEvidenceAdded}
            />
          </div>
        )}

        {/* TAB 2: Resume Extraction & Review (FR-4, FR-5, FR-6, FR-7, FR-8) */}
        {activeTab === 'resume' && (
          <div className="animate-in fade-in duration-200">
            <ResumeUploadCard
              studentId={studentIdToUse}
              onExtractionSuccess={() => {
                handleEvidenceAdded();
                setActiveTab('dna');
              }}
            />
          </div>
        )}

        {/* TAB 3: Industry Role Blueprints (FR-14, FR-15, FR-16) */}
        {(activeTab === 'blueprint' || activeTab === 'blueprints_manage') && (
          <div className="animate-in fade-in duration-200">
            <BlueprintViewer
              blueprints={blueprints}
              selectedRoleId={selectedRoleId}
              onSelectRole={roleId => {
                selectRole(roleId);
                setActiveTab('gaps');
              }}
              onRefreshBlueprints={refreshGap}
            />
          </div>
        )}

        {/* TAB 4: Skill Gap Engine (FR-17, FR-18, FR-19, FR-20) */}
        {activeTab === 'gaps' && (
          <div className="animate-in fade-in duration-200">
            <GapAnalysisCard
              matchResult={matchResult}
              onTakeGapAssessment={() => setActiveTab('assessment')}
            />
          </div>
        )}

        {/* TAB 5: Adaptive Gap-Prioritized Assessment (FR-21, FR-22, FR-23, FR-24) */}
        {activeTab === 'assessment' && (
          <div className="animate-in fade-in duration-200">
            <AdaptiveQuizRunner
              studentId={studentIdToUse}
              targetRoleId={selectedRoleId || undefined}
              roleTitle={selectedRole?.title}
              onAssessmentCompleted={handleEvidenceAdded}
              onViewSkillDna={() => setActiveTab('dna')}
            />
          </div>
        )}

        {/* TAB 6: Technical Interview with Rubric Scoring (FR-25, FR-26, FR-27) */}
        {activeTab === 'tech_interview' && (
          <div className="animate-in fade-in duration-200">
            <TechnicalInterviewModal
              studentId={studentIdToUse}
              onInterviewComplete={handleEvidenceAdded}
            />
          </div>
        )}

        {/* TAB 7: HR & Soft Skills Assessment (FR-28, FR-29) */}
        {activeTab === 'hr_interview' && (
          <div className="animate-in fade-in duration-200">
            <HrInterviewModal
              studentId={studentIdToUse}
              onInterviewComplete={handleEvidenceAdded}
            />
          </div>
        )}

        {/* TAB 8: Placement Readiness Engine (FR-30, FR-31) */}
        {activeTab === 'readiness' && (
          <div className="animate-in fade-in duration-200">
            <PlacementReadinessCard
              readiness={readiness}
              onTakeAction={handleActionClick}
            />
          </div>
        )}

        {/* TAB 9: Improvement Loop & Skill History (FR-32, FR-34) */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-200">
            <SkillHistoryChart
              history={history}
              onRetakeAssessment={() => setActiveTab('assessment')}
            />
          </div>
        )}

        {/* TAB 10: Institution & Academia Batch Analytics (FR-35, FR-36, FR-37, FR-38) */}
        {(activeTab === 'institution' || activeTab === 'common_gaps' || activeTab === 'interventions') && (
          <div className="animate-in fade-in duration-200">
            <InstitutionDashboard />
          </div>
        )}

        {/* TAB 11: Industry Recruiter Candidate Discovery (FR-39, FR-40, FR-41) */}
        {activeTab === 'industry' && (
          <div className="animate-in fade-in duration-200">
            <IndustryRecruiterDashboard
              onInspectStudentDna={handleInspectStudentDna}
            />
          </div>
        )}
      </main>

      {/* Primary User Journey Demo Tour Modal */}
      <DemoTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={tabId => setActiveTab(tabId)}
        onSwitchPersona={role => switchRole(role)}
      />

      {/* Minimalist Editorial Footer */}
      <footer className="border-t border-[#E7E2D9] bg-[#FAF8F5] py-8 text-xs text-[#78716C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D46238]"></span>
            <span className="font-semibold text-[#18181B]">SkillTwin</span>
            <span>© 2026 · Evidence-Based Skill Intelligence Platform</span>
          </div>
          <span className="font-mono text-[#78716C] text-[11px]">
            DETERMINISTIC EVALUATION · ZERO PSEUDO-SCIENCE · VERIFIABLE EVIDENCE CHAINS
          </span>
        </div>
      </footer>
    </div>
  );
}
