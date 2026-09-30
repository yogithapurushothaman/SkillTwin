'use client';

import React, { useState, useEffect } from 'react';
import { useAssessment } from '@/hooks/useAssessment';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { 
  Code, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  RotateCcw,
  Target
} from 'lucide-react';

interface AdaptiveQuizRunnerProps {
  studentId: number;
  targetRoleId?: number;
  roleTitle?: string;
  onAssessmentCompleted?: () => void;
  onViewSkillDna?: () => void;
}

export function AdaptiveQuizRunner({
  studentId,
  targetRoleId,
  roleTitle = 'Software Developer Intern',
  onAssessmentCompleted,
  onViewSkillDna
}: AdaptiveQuizRunnerProps) {
  const {
    assessmentId,
    questions,
    currentIndex,
    currentQuestion,
    answers,
    result,
    loading,
    submitting,
    error,
    startTest,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    submitTest,
    resetTest
  } = useAssessment(studentId, onAssessmentCompleted);

  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes

  // Timer countdown while test in progress
  useEffect(() => {
    if (!assessmentId || result) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [assessmentId, result]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // 1. Initial State: Start Test Launcher
  if (!assessmentId && !result) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E7E2D9] text-center space-y-5 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D9] p-3 mx-auto flex items-center justify-center">
          <Code className="w-7 h-7 text-[#D46238]" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-2xl font-black text-[#18181B] tracking-tight">Gap-Prioritized Assessment</h3>
          <p className="text-xs text-[#78716C] leading-relaxed">
            System dynamically selects questions targeting your identified skill gaps for <strong className="text-[#18181B]">{roleTitle}</strong>.
          </p>
        </div>

        <div className="max-w-lg mx-auto p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D9] text-left text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#18181B] font-mono text-[11px] uppercase tracking-wider">
            <Target className="w-4 h-4 text-[#D46238]" />
            <span>Assessment Specifications:</span>
          </div>
          <ul className="list-disc pl-5 text-[#57534E] space-y-1 leading-relaxed">
            <li>10 adaptive questions targeting DSA, Java, SQL, Git & OOP</li>
            <li>Prioritizes questions from your highest deficit skills</li>
            <li>Detailed topic-level score reporting (e.g. Arrays, Trees, Indexing)</li>
            <li>Scores update SkillTwin to 🟢 Verified with verifiable evidence</li>
          </ul>
        </div>

        {error && <div className="text-xs text-[#B0432E] font-medium">{error}</div>}

        <button
          onClick={() => startTest(targetRoleId)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#18181B] hover:bg-[#2E2E33] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
        >
          {loading ? 'Generating Adaptive Test...' : 'Start Gap-Prioritized Assessment'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 2. Results State
  if (result) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2D9] space-y-6 shadow-xs animate-in fade-in duration-300">
        {/* Results Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-[#E7E2D9] gap-4">
          <div>
            <span className="text-[11px] font-mono font-bold text-[#24482B] uppercase tracking-[0.16em] block">
              Assessment Completed & Verified
            </span>
            <h3 className="text-2xl font-black text-[#18181B] tracking-tight">Performance Scorecard</h3>
            <p className="text-xs text-[#78716C] mt-1">{result.feedback}</p>
          </div>

          <div className="px-5 py-3 rounded-xl bg-[#EDF3EE] border border-[#CFDEC2] text-center">
            <span className="text-[10px] font-mono text-[#24482B] block uppercase">Overall Score</span>
            <span className="text-3xl font-black text-[#24482B]">{result.percentage}%</span>
          </div>
        </div>

        {/* Topic-Level Breakdown */}
        <div>
          <h4 className="text-xs font-mono font-bold text-[#78716C] uppercase tracking-[0.16em] mb-3">
            Topic-Level Granular Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.topic_scores.map((ts, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#18181B]">{ts.topic}</span>
                  <span className="text-[10px] text-[#78716C] font-mono">{ts.skill_name}</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[#78716C] text-[11px] font-mono">
                    {ts.correct_questions}/{ts.total_questions} correct
                  </span>
                  <span className="font-bold font-mono text-[#24482B]">{ts.score}%</span>
                </div>
                <ProgressBar value={ts.score} showLabel={false} height="sm" color="auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Skill Improvements Delta */}
        <div>
          <h4 className="text-xs font-mono font-bold text-[#78716C] uppercase tracking-[0.16em] mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#4E6554]" />
            SkillTwin DNA Updates & Verifiable Score Improvements
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.skill_updates.map((su, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] flex justify-between items-center">
                <div>
                  <h5 className="text-sm font-bold text-[#18181B]">{su.skill_name}</h5>
                  <span className="text-xs text-[#78716C] font-mono">
                    Baseline: {su.old_score}% → Assessed: {su.assessed_score}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-[#24482B] font-mono">{su.new_score}%</span>
                  <span className="block text-[11px] font-bold text-[#D46238] font-mono">
                    +{su.improvement} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-[#E7E2D9] flex justify-between items-center">
          <button
            onClick={resetTest}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#DDD6CA] hover:bg-[#FAF8F5] text-xs font-semibold text-[#18181B] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Retake Assessment</span>
          </button>

          {onViewSkillDna && (
            <button
              onClick={onViewSkillDna}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#18181B] hover:bg-[#2E2E33] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>View Updated Skill DNA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Active Test Taking State
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2D9] space-y-6 shadow-xs">
      {/* Header bar: Question indicator & timer */}
      <div className="flex justify-between items-center pb-4 border-b border-[#E7E2D9]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.16em] font-bold text-[#D46238]">
            Adaptive Assessment in Progress
          </span>
          <h4 className="text-base font-bold text-[#18181B]">
            Question {currentIndex + 1} of {questions.length}
          </h4>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D9] text-xs font-mono text-[#18181B]">
          <Clock className="w-4 h-4 text-[#D46238]" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress pill indicator */}
      <div className="grid grid-cols-10 gap-1.5">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full ${
              answers[q.id]
                ? 'bg-[#4E6554]'
                : idx === currentIndex
                ? 'bg-[#D46238]'
                : 'bg-[#EAE4D9]'
            }`}
          />
        ))}
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#18181B] border border-[#E7E2D9] text-[11px] font-semibold font-mono">
              {currentQuestion.skill_name}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E7E2D9] text-[#78716C] text-[11px] font-mono">
              Topic: {currentQuestion.topic}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono text-[#78716C]">
              {currentQuestion.difficulty} · {currentQuestion.marks} marks
            </span>
          </div>

          <p className="text-sm font-bold text-[#18181B] leading-relaxed">
            {currentQuestion.question_text}
          </p>

          {/* Options */}
          <div className="space-y-2 pt-1">
            {currentQuestion.options.map(opt => {
              const isSelected = answers[currentQuestion.id] === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => selectAnswer(currentQuestion.id, opt.id)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#FAF8F5] border-[#18181B] text-[#18181B] ring-1 ring-[#18181B] shadow-xs'
                      : 'bg-white border-[#E7E2D9] hover:border-[#DDD6CA] text-[#57534E] hover:bg-[#FAF8F5]/50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                      isSelected
                        ? 'bg-[#18181B] text-white'
                        : 'bg-[#FAF8F5] text-[#78716C] border border-[#E7E2D9]'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="pt-0.5 leading-relaxed font-medium">{opt.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-[#E7E2D9] flex justify-between items-center">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#DDD6CA] text-xs font-semibold text-[#18181B] hover:bg-[#FAF8F5] disabled:opacity-40 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Previous
        </button>

        <div className="flex items-center gap-2">
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={nextQuestion}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FAF8F5] border border-[#DDD6CA] hover:bg-[#F3EFEA] text-xs font-semibold text-[#18181B] transition-colors cursor-pointer"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={submitTest}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#D46238] hover:bg-[#BC4E26] text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Scoring Assessment...' : 'Submit Assessment'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
