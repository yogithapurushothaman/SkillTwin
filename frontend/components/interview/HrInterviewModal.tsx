'use client';

import React, { useState } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { 
  Users, 
  CheckCircle, 
  Bot, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight 
} from 'lucide-react';

interface HrInterviewModalProps {
  studentId: number;
  onInterviewComplete?: () => void;
}

export function HrInterviewModal({
  studentId,
  onInterviewComplete
}: HrInterviewModalProps) {
  const {
    questions,
    selectedQuestion,
    answerText,
    setAnswerText,
    evaluation,
    loading,
    submitting,
    error,
    selectQuestionById,
    submitAnswer,
    resetEvaluation
  } = useInterview(studentId, onInterviewComplete);

  const sampleHrAnswers: Record<number, string> = {
    5: `During a sprint for our capstone service, my teammate preferred using synchronous REST calls between three internal micro-components, whereas I advocated for an asynchronous event-driven queue to prevent cascading failure. 

Instead of arguing opinions, I set up a local benchmark simulating 500 concurrent requests with mock latency. The benchmark demonstrated that synchronous calls led to request timeouts and thread exhaustion. We sat down together, reviewed the telemetry data, and agreed to use the queue for order processing while keeping REST for simple metadata reads. By focusing on measurable metrics and shared user outcomes rather than personal pride, we reached consensus and shipped on schedule.`,
    6: `Two days before our university product exhibition, the client requested a major pivot: moving from a desktop dashboard to supporting instant mobile notifications. 

I immediately scheduled a 15-minute standup with the team to triage the scope. We identified the core user value—which was alerting users on time—and agreed to integrate a lightweight webhook alerting mechanism rather than building full mobile UI screens. I recalibrated the sprint backlog, took ownership of the notification dispatcher, and ensured unit tests remained green. We successfully demonstrated live alerts during the showcase without sacrificing code quality.`
  };

  const hrQuestions = questions.filter(q => q.type === 'hr');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-bold text-white">Scenario-Based HR & Soft Skills</h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                FR-28 & FR-29
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Structured evaluation across Professionalism (30%), Communication (25%), Teamwork (25%), and Adaptability (20%). Strict non-goal: No pseudo-scientific "personality detection".
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5" />
            <span>Structured Rubric Evaluation</span>
          </div>
        </div>

        {/* HR Scenario Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {hrQuestions.map(q => {
            const isSelected = selectedQuestion?.id === q.id;
            return (
              <button
                key={q.id}
                onClick={() => selectQuestionById(q.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white font-semibold shadow'
                    : 'bg-gray-800/80 text-gray-400 hover:text-white'
                }`}
              >
                {q.skill}: {q.topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Box */}
      {selectedQuestion && (
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-5">
          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <span>{selectedQuestion.skill}</span>
              <span>·</span>
              <span>{selectedQuestion.topic}</span>
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {selectedQuestion.question}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-gray-300">Your Situational Response</label>
              {sampleHrAnswers[selectedQuestion.id] && (
                <button
                  type="button"
                  onClick={() => setAnswerText(sampleHrAnswers[selectedQuestion.id])}
                  className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Insert Sample Response (Demo)</span>
                </button>
              )}
            </div>

            <textarea
              rows={7}
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder="Describe your actions, how you collaborated, listened, balanced priorities, and reached a positive outcome..."
              className="w-full p-4 rounded-xl bg-gray-900/90 border border-gray-700 text-gray-200 text-xs font-sans leading-relaxed focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {error && <div className="text-xs text-rose-400 font-medium">{error}</div>}

          <div className="flex justify-end">
            <button
              onClick={submitAnswer}
              disabled={submitting || !answerText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Evaluating Scenario Answer...' : 'Submit HR Scenario Answer'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* HR Evaluation Card */}
      {evaluation && (
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/40 space-y-5 animate-in fade-in duration-300 bg-amber-950/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-white">
                  Soft-Skill Scorecard: {evaluation.skill_name}
                </h4>
              </div>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">{evaluation.feedback}</p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center">
              <span className="text-[10px] text-gray-400 block font-medium">Clamped Score</span>
              <span className="text-2xl font-black text-emerald-400">{evaluation.total_score}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 block">Professionalism (Max 30)</span>
              <span className="text-lg font-bold text-amber-400">
                {evaluation.rubric_scores.correctness} / 30
              </span>
              <ProgressBar value={(evaluation.rubric_scores.correctness / 30) * 100} showLabel={false} height="sm" color="amber" />
            </div>

            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 block">Communication (Max 25)</span>
              <span className="text-lg font-bold text-cyan-400">
                {evaluation.rubric_scores.depth} / 25
              </span>
              <ProgressBar value={(evaluation.rubric_scores.depth / 25) * 100} showLabel={false} height="sm" color="emerald" />
            </div>

            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 block">Teamwork (Max 25)</span>
              <span className="text-lg font-bold text-indigo-400">
                {evaluation.rubric_scores.example} / 25
              </span>
              <ProgressBar value={(evaluation.rubric_scores.example / 25) * 100} showLabel={false} height="sm" color="indigo" />
            </div>

            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 block">Adaptability (Max 20)</span>
              <span className="text-lg font-bold text-emerald-400">
                {evaluation.rubric_scores.clarity} / 20
              </span>
              <ProgressBar value={(evaluation.rubric_scores.clarity / 20) * 100} showLabel={false} height="sm" color="auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
