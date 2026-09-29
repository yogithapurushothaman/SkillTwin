'use client';

import React, { useState } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { 
  Code, 
  CheckCircle, 
  Bot, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface TechnicalInterviewModalProps {
  studentId: number;
  onInterviewComplete?: () => void;
}

export function TechnicalInterviewModal({
  studentId,
  onInterviewComplete
}: TechnicalInterviewModalProps) {
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

  const sampleTechnicalAnswers: Record<number, string> = {
    1: `In Java 8+, HashMap uses an array of buckets, where each bucket is initially a LinkedList of Node objects. When a key is inserted, its hashCode() is spread using a high-bits XOR shift: (h = key.hashCode()) ^ (h >>> 16) to minimize collisions across power-of-two table sizes. 

If multiple keys hash to the same bucket index, Java checks .equals() to see if it is an update. If it's a new distinct key, a collision occurs and the node is appended to the bucket chain. 

Optimization in Java 8: When the collision chain length reaches TREEIFY_THRESHOLD (8 items) and the table capacity is at least 64, the linked list transforms into a Red-Black Tree (TreeNode). This drastically reduces worst-case lookup from O(N) down to O(log N). If the tree size shrinks below UNTREEIFY_THRESHOLD (6), it transforms back to a LinkedList.`,
    2: `A B-Tree index accelerates lookups by organizing sorted keys in a balanced tree structure where leaf nodes contain pointers to table records or clustered row data. Lookups proceed in O(log N) operations via binary search within nodes, dramatically avoiding full table scans.

However, indexes degrade performance during write operations (INSERT, UPDATE, DELETE) because every row insertion or deletion forces synchronous tree rebalancing and split operations on the index file. Additionally, on low-cardinality columns (like gender with only two values), the query optimizer may determine that random I/O index seeks are more expensive than sequential disk reads, rendering the index wasteful of storage memory.`
  };

  const handleUseSample = (qId: number) => {
    if (sampleTechnicalAnswers[qId]) {
      setAnswerText(sampleTechnicalAnswers[qId]);
    }
  };

  const techQuestions = questions.filter(q => q.type === 'technical');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl font-bold text-white">Structured Technical Interview</h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30">
                FR-25 & FR-26
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Evaluated strictly against fixed rubric bounds: Correctness (40%), Depth (30%), Example (20%), Clarity (10%).
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5" />
            <span>AI-Assisted Evaluation (AI-6)</span>
          </div>
        </div>

        {/* Question Selector Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {techQuestions.map(q => {
            const isSelected = selectedQuestion?.id === q.id;
            return (
              <button
                key={q.id}
                onClick={() => selectQuestionById(q.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow'
                    : 'bg-gray-800/80 text-gray-400 hover:text-white'
                }`}
              >
                {q.skill}: {q.topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question & Answer Box */}
      {selectedQuestion && (
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-5">
          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-wider">
              <span>{selectedQuestion.skill}</span>
              <span>·</span>
              <span>{selectedQuestion.topic}</span>
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {selectedQuestion.question}
            </p>
          </div>

          {/* Rubric Criteria Tags */}
          <div className="flex flex-wrap gap-2 text-[11px] text-gray-400">
            <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
              Correctness: <strong className="text-white">40%</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
              Technical Depth: <strong className="text-white">30%</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
              Code/Example: <strong className="text-white">20%</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
              Clarity: <strong className="text-white">10%</strong>
            </span>
          </div>

          {/* Free-Text Input Area */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-gray-300">Your Technical Response</label>
              {sampleTechnicalAnswers[selectedQuestion.id] && (
                <button
                  type="button"
                  onClick={() => handleUseSample(selectedQuestion.id)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Insert Sample Answer (Demo)</span>
                </button>
              )}
            </div>

            <textarea
              rows={8}
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder="Explain the architectural mechanism, complexity trade-offs, edge cases, and concrete code examples..."
              className="w-full p-4 rounded-xl bg-gray-900/90 border border-gray-700 text-gray-200 text-xs font-mono leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {error && <div className="text-xs text-rose-400 font-medium">{error}</div>}

          <div className="flex justify-end">
            <button
              onClick={submitAnswer}
              disabled={submitting || !answerText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Evaluating against Rubric...' : 'Submit Response for Rubric Scoring'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Evaluation Result Card (FR-27) */}
      {evaluation && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/40 space-y-5 animate-in fade-in duration-300 bg-indigo-950/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-white">
                  Rubric Evaluation Scorecard: {evaluation.skill_name}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  AI-Assisted (Flagged in Evidence)
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">{evaluation.feedback}</p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center">
              <span className="text-[10px] text-gray-400 block font-medium">Clamped Score</span>
              <span className="text-2xl font-black text-emerald-400">{evaluation.total_score}%</span>
            </div>
          </div>

          {/* Rubric Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 block">Correctness (Max 40)</span>
              <span className="text-lg font-bold text-indigo-400">
                {evaluation.rubric_scores.correctness} / 40
              </span>
              <ProgressBar value={(evaluation.rubric_scores.correctness / 40) * 100} showLabel={false} height="sm" color="indigo" />
            </div>

            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 block">Depth (Max 30)</span>
              <span className="text-lg font-bold text-cyan-400">
                {evaluation.rubric_scores.depth} / 30
              </span>
              <ProgressBar value={(evaluation.rubric_scores.depth / 30) * 100} showLabel={false} height="sm" color="emerald" />
            </div>

            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 block">Example (Max 20)</span>
              <span className="text-lg font-bold text-amber-400">
                {evaluation.rubric_scores.example} / 20
              </span>
              <ProgressBar value={(evaluation.rubric_scores.example / 20) * 100} showLabel={false} height="sm" color="amber" />
            </div>

            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 block">Clarity (Max 10)</span>
              <span className="text-lg font-bold text-purple-400">
                {evaluation.rubric_scores.clarity} / 10
              </span>
              <ProgressBar value={(evaluation.rubric_scores.clarity / 10) * 100} showLabel={false} height="sm" color="auto" />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-emerald-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified evidence record appended to SkillTwin with deterministic score update.
            </span>
            <button
              onClick={resetEvaluation}
              className="text-gray-400 hover:text-white underline cursor-pointer"
            >
              Evaluate Another Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
