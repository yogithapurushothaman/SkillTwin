'use client';

import React from 'react';
import { SkillHistoryResponse } from '@/types';
import { 
  TrendingUp, 
  History, 
  ArrowUpRight, 
  Calendar, 
  Sparkles,
  Zap
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface SkillHistoryChartProps {
  history: SkillHistoryResponse | null;
  onRetakeAssessment?: () => void;
}

export function SkillHistoryChart({
  history,
  onRetakeAssessment
}: SkillHistoryChartProps) {
  if (!history) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-gray-800 text-center">
        <History className="w-8 h-8 text-indigo-400 mx-auto animate-pulse mb-3" />
        <p className="text-sm text-gray-400">Loading Skill History & Reassessment Loop...</p>
      </div>
    );
  }

  const { history: items, progress_summary } = history;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-gray-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xl font-bold text-white">SkillTwin Improvement Loop & History</h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                FR-32 & FR-34
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Traceable record of skill score evolution before and after interventions, retakes, and interviews.
            </p>
          </div>

          {onRetakeAssessment && (
            <button
              onClick={onRetakeAssessment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Retake Gap Assessment (FR-33)</span>
            </button>
          )}
        </div>

        {/* Before vs After Progression Comparison Grid (FR-34) */}
        <div className="mt-6">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
            Before vs. After Verified Skill Progression
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {progress_summary.map((ps, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-3"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white text-sm">{ps.skill}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      ps.improvement > 0
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {ps.improvement > 0 ? `+${ps.improvement}%` : 'Baseline'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Baseline: <strong className="text-gray-300">{ps.initial_score}%</strong></span>
                    <span>Current: <strong className="text-emerald-400">{ps.current_score}%</strong></span>
                  </div>
                  <ProgressBar value={ps.current_score} benchmark={ps.initial_score} showLabel={false} height="sm" color="auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chronological Audit Log (FR-32) */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <span>Chronological Score Audit Log ({items.length} Events)</span>
        </h4>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{item.skill_name}</span>
                  <span className="text-[11px] text-gray-400">· {item.change_reason}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono self-end sm:self-center">
                <span className="text-gray-400">{item.old_score}%</span>
                <span className="text-gray-500">→</span>
                <span className="font-bold text-emerald-400">{item.new_score}%</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  item.delta >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {item.delta >= 0 ? `+${item.delta}` : item.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
