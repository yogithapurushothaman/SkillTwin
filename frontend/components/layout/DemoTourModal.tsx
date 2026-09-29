'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { 
  FileText, 
  Target, 
  Search, 
  CheckCircle2, 
  Code, 
  UserCheck, 
  BarChart3, 
  Award,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onSwitchPersona: (role: 'student' | 'academician' | 'industry' | 'admin') => void;
}

export function DemoTourModal({
  isOpen,
  onClose,
  onNavigateTab,
  onSwitchPersona
}: DemoTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      step: 1,
      title: 'Claim: Upload & Extract Resume',
      persona: 'student' as const,
      tab: 'resume',
      icon: <FileText className="w-6 h-6 text-cyan-400" />,
      description:
        'A static resume is uploaded (PDF or text). Skills are extracted into structured JSON and strictly normalized against the predefined dictionary. All extracted skills are cataloged as Self-Declared (🟡) with provisional claimed scores.',
      actionLabel: 'Go to Resume Uploader'
    },
    {
      step: 2,
      title: 'Blueprint: Define Industry Role Requirements',
      persona: 'student' as const,
      tab: 'blueprint',
      icon: <Target className="w-6 h-6 text-indigo-400" />,
      description:
        'Select the target industry blueprint (seeded: Software Developer Intern — Java 70, DSA 65, SQL 60, Git 50, OOP 65, Problem Solving 65, Communication 60). Companies set explicit required proficiencies.',
      actionLabel: 'View Role Blueprint'
    },
    {
      step: 3,
      title: 'Gap: Deterministic Gap Engine',
      persona: 'student' as const,
      tab: 'gaps',
      icon: <Search className="w-6 h-6 text-rose-400" />,
      description:
        'The Gap Engine compares verified skills against the blueprint: Role Match Score = ∑ min(Actual / Required, 1.0) × Weight. Surfaces Critical Gaps (e.g. DSA shortfall > 15 pts) and gap-prioritized assessment recommendations.',
      actionLabel: 'Inspect Skill Gaps'
    },
    {
      step: 4,
      title: 'Verify: Gap-Prioritized Online Assessment',
      persona: 'student' as const,
      tab: 'assessment',
      icon: <Code className="w-6 h-6 text-emerald-400" />,
      description:
        'Take an adaptive quiz that targets identified gap skills. Instant auto-grading breaks down topic scores (e.g., DSA: Arrays, Trees) and commits verifiable evidence into SkillTwin.',
      actionLabel: 'Launch Assessment'
    },
    {
      step: 5,
      title: 'Evaluate: Structured Technical Interview',
      persona: 'student' as const,
      tab: 'tech_interview',
      icon: <CheckCircle2 className="w-6 h-6 text-blue-400" />,
      description:
        'Complete rubric-scored technical questions (Correctness 40%, Depth 30%, Example 20%, Clarity 10%). System clamps to fixed bounds and flags AI-assisted scoring in the verifiable evidence log.',
      actionLabel: 'Open Tech Interview'
    },
    {
      step: 6,
      title: 'DNA & Readiness: Placement Intelligence',
      persona: 'student' as const,
      tab: 'dna',
      icon: <Award className="w-6 h-6 text-amber-400" />,
      description:
        'Skill DNA updates to 🟢 Verified. The 6-component weighted Placement Readiness Score computes: Resume (15%) + Tech Skills (25%) + Assessment (25%) + Tech Interview (15%) + HR (10%) + Soft Skills (10%).',
      actionLabel: 'Explore Verified Skill DNA'
    },
    {
      step: 7,
      title: 'Academia & Institution: Batch Analytics',
      persona: 'academician' as const,
      tab: 'institution',
      icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
      description:
        'Switch to Academician / Admin persona. View batch-level readiness bands (25+ students), common skill-gap ranking (% below threshold), department filters, and post-intervention reassessment trends.',
      actionLabel: 'Open Institution Analytics'
    },
    {
      step: 8,
      title: 'Industry Discovery: Verified Candidate Match',
      persona: 'industry' as const,
      tab: 'industry',
      icon: <UserCheck className="w-6 h-6 text-teal-400" />,
      description:
        'Switch to Industry Recruiter persona. View ranked candidates for the Software Developer Intern role. Filter by skill thresholds, inspect verified evidence chains behind scores, and shortlist talent.',
      actionLabel: 'Open Recruiter Dashboard'
    }
  ];

  const activeStep = steps[currentStep];

  const handleStepAction = () => {
    onSwitchPersona(activeStep.persona);
    onNavigateTab(activeStep.tab);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SkillTwin — Primary User Journey Walkthrough"
      subtitle="PRD Section 9: Claim → Verify → Map → Gap → Improve → Re-verify → Match"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Progress pills */}
        <div className="grid grid-cols-8 gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-indigo-500 ring-2 ring-indigo-400/50'
                  : idx < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-gray-800'
              }`}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Step Card */}
        <div className="p-6 rounded-xl bg-gray-800/60 border border-gray-700/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gray-900 border border-gray-700 shadow-md">
              {activeStep.icon}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                Step {activeStep.step} of 8
              </span>
              <h4 className="text-lg font-bold text-white">{activeStep.title}</h4>
            </div>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">{activeStep.description}</p>

          <div className="pt-2 flex items-center justify-between border-t border-gray-700/60">
            <span className="text-xs text-gray-400">
              Active Persona Context: <strong className="text-white capitalize">{activeStep.persona}</strong>
            </span>
            <button
              onClick={handleStepAction}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-colors"
            >
              <span>{activeStep.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-xs font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
          </button>
          <span className="text-xs text-gray-500">
            {currentStep + 1} / {steps.length}
          </span>
          <button
            onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStep === steps.length - 1}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-xs font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Next Step <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
