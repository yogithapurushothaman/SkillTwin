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
      <div className="glass-panel p-8 rounded-2xl border border-gray-800 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 p-3 mx-auto flex items-center justify-center">
          <Code className="w-8 h-8 text-indigo-400" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl font-bold text-white">Gap-Prioritized Online Assessment</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            FR-21 & FR-22: System dynamically selects questions targeting your identified skill gaps for <strong className="text-white">{roleTitle}</strong>.
          </p>
        </div>

        <div className="max-w-lg mx-auto p-4 rounded-xl bg-gray-900/80 border border-gray-800 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Assessment Specifications (FR-24):</span>
          </div>
          <ul className="list-disc pl-5 text-gray-300 space-y-1">
            <li>10 adaptive questions targeting DSA, Java, SQL, Git & OOP</li>
            <li>Prioritizes questions from your highest deficit skills</li>
            <li>Detailed topic-level score reporting (e.g. Arrays, Trees, Indexing)</li>
            <li>Scores update SkillTwin to 🟢 Verified with verifiable evidence</li>
          </ul>
        </div>

        {error && <div className="text-xs text-rose-400 font-medium">{error}</div>}

        <button
          onClick={() => startTest(targetRoleId)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
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
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 space-y-6 animate-in fade-in duration-300">
        {/* Results Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-gray-800 gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              Assessment Completed & Verified (FR-23)
            </span>
            <h3 className="text-2xl font-black text-white">Performance Scorecard</h3>
            <p className="text-xs text-gray-400 mt-1">{result.feedback}</p>
          </div>

          <div className="px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center">
            <span className="text-xs text-gray-400 block font-medium">Overall Score</span>
            <span className="text-3xl font-black text-emerald-400">{result.percentage}%</span>
          </div>
        </div>

        {/* Topic-Level Breakdown (FR-23) */}
        <div>
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
            Topic-Level Granular Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.topic_scores.map((ts, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{ts.topic}</span>
                  <span className="text-[10px] text-gray-400">{ts.skill_name}</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-gray-400 text-[11px]">
                    {ts.correct_questions}/{ts.total_questions} correct
                  </span>
                  <span className="font-bold text-emerald-400">{ts.score}%</span>
                </div>
                <ProgressBar value={ts.score} showLabel={false} height="sm" color="auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Skill Improvements Delta */}
        <div>
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            SkillTwin DNA Updates & Verifiable Score Improvements (FR-32)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.skill_updates.map((su, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-gray-900/90 border border-emerald-500/30 flex justify-between items-center">
                <div>
                  <h5 className="text-sm font-bold text-white">{su.skill_name}</h5>
                  <span className="text-xs text-gray-400">
                    Baseline: {su.old_score}% → Assessed: {su.assessed_score}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-400">{su.new_score}%</span>
                  <span className="block text-[11px] font-bold text-cyan-400">
                    +{su.improvement} improvement
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
          <button
            onClick={resetTest}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-700 hover:bg-gray-800 text-xs font-semibold text-gray-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Assessment (FR-33)</span>
          </button>

          {onViewSkillDna && (
            <button
              onClick={onViewSkillDna}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors"
            >
              <span>View Updated Skill DNA & Readiness</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Active Test Taking State
  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
      {/* Header bar: Question indicator & timer */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-800">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400">
            Adaptive Assessment in Progress
          </span>
          <h4 className="text-base font-bold text-white">
            Question {currentIndex + 1} of {questions.length}
          </h4>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-xs font-mono text-cyan-400">
          <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
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
                ? 'bg-emerald-500'
                : idx === currentIndex
                ? 'bg-indigo-500'
                : 'bg-gray-800'
            }`}
          />
        ))}
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[11px] font-semibold">
              {currentQuestion.skill_name}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[11px]">
              Topic: {currentQuestion.topic}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold text-gray-400">
              {currentQuestion.difficulty} · {currentQuestion.marks} marks
            </span>
          </div>

          <p className="text-sm font-semibold text-white leading-relaxed">
            {currentQuestion.question_text}
          </p>

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {currentQuestion.options.map(opt => {
              const isSelected = answers[currentQuestion.id] === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => selectAnswer(currentQuestion.id, opt.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 text-gray-300 hover:bg-gray-800/40'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{opt.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-800 disabled:opacity-40 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Previous
        </button>

        <div className="flex items-center gap-2">
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={nextQuestion}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition-colors"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={submitTest}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
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
