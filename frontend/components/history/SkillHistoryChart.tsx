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
      <div className="bg-white p-12 rounded-2xl border border-[#E7E2D9] text-center shadow-xs">
        <History className="w-8 h-8 text-[#D46238] mx-auto animate-pulse mb-3" />
        <p className="text-sm font-medium text-[#78716C]">Loading Skill History & Reassessment Loop...</p>
      </div>
    );
  }

  const { history: items, progress_summary } = history;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-[#E7E2D9] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#4E6554]" />
              <h3 className="text-xl font-bold text-[#18181B]">SkillTwin Improvement Loop & History</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#FAF8F5] text-[#18181B] font-mono border border-[#E7E2D9]">
                Continuous
              </span>
            </div>
            <p className="text-xs text-[#78716C] mt-1">
              Traceable record of skill score evolution before and after interventions, retakes, and interviews.
            </p>
          </div>

          {onRetakeAssessment && (
            <button
              onClick={onRetakeAssessment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#18181B] hover:bg-[#2E2E33] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#D46238]" />
              <span>Retake Gap Assessment</span>
            </button>
          )}
        </div>

        {/* Before vs After Progression Comparison Grid */}
        <div className="mt-6">
          <h4 className="text-xs font-mono font-bold text-[#78716C] uppercase tracking-[0.16em] mb-3">
            Before vs. After Verified Skill Progression
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {progress_summary.map((ps, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] space-y-3"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#18181B] text-sm">{ps.skill}</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                      ps.improvement > 0
                        ? 'bg-[#EDF3EE] text-[#24482B] border border-[#CFDEC2]'
                        : 'bg-white text-[#78716C] border border-[#DDD6CA]'
                    }`}
                  >
                    {ps.improvement > 0 ? `+${ps.improvement}%` : 'Baseline'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#78716C] font-mono">
                    <span>Baseline: <strong className="text-[#57534E]">{ps.initial_score}%</strong></span>
                    <span>Current: <strong className="text-[#24482B]">{ps.current_score}%</strong></span>
                  </div>
                  <ProgressBar value={ps.current_score} benchmark={ps.initial_score} showLabel={false} height="sm" color="auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chronological Audit Log */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] space-y-4 shadow-xs">
        <h4 className="text-xs font-mono font-bold text-[#78716C] uppercase tracking-[0.16em] flex items-center gap-2">
          <History className="w-4 h-4 text-[#D46238]" />
          <span>Chronological Score Audit Log ({items.length} Events)</span>
        </h4>

        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:border-[#DDD6CA] transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#18181B]">{item.skill_name}</span>
                  <span className="text-[11px] text-[#78716C]">· {item.change_reason}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#78716C] font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono self-end sm:self-center">
                <span className="text-[#78716C]">{item.old_score}%</span>
                <span className="text-[#DDD6CA]">→</span>
                <span className="font-bold text-[#24482B]">{item.new_score}%</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.delta >= 0 ? 'bg-[#EDF3EE] text-[#24482B] border border-[#CFDEC2]' : 'bg-[#FDF1EE] text-[#B0432E] border border-[#F4CDC4]'
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
