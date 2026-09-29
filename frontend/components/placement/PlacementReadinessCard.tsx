'use client';

import React from 'react';
import { PlacementReadinessResponse } from '@/types';
import { ReadinessBandBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface PlacementReadinessCardProps {
  readiness: PlacementReadinessResponse | null;
  onTakeAction?: (actionName: string) => void;
}

export function PlacementReadinessCard({
  readiness,
  onTakeAction
}: PlacementReadinessCardProps) {
  if (!readiness) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-gray-800 text-center">
        <Award className="w-8 h-8 text-indigo-400 mx-auto animate-pulse mb-3" />
        <p className="text-sm text-gray-400">Computing Placement Readiness Intelligence...</p>
      </div>
    );
  }

  const { overall_readiness_score, readiness_band, components, top_strengths, priority_gaps, recommended_actions } = readiness;

  return (
    <div className="space-y-6">
      {/* Top Readiness Scorecard */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Multi-Stage Placement Engine (FR-30)
              </span>
              <ReadinessBandBadge band={readiness_band} />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Placement Readiness Index
            </h3>
            <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
              Synthesized across 6 evidence stages: resume credentials, demonstrated technical proficiencies, online assessments, technical interviews, HR evaluation, and soft skills.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-gray-900/90 p-5 rounded-2xl border border-gray-700/80 shadow-lg">
            <div className="text-center">
              <div className="text-4xl font-black text-emerald-400">
                {overall_readiness_score}%
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mt-0.5">
                Readiness Score
              </span>
            </div>

            <div className="h-10 w-px bg-gray-800" />

            <div className="text-left text-xs space-y-1">
              <div className="text-white font-bold">{readiness_band}</div>
              <div className="text-[11px] text-gray-400">
                Threshold: ≥75% for Direct Placement Fast-Track
              </div>
            </div>
          </div>
        </div>

        {/* 6 Weighted Components Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-6">
          {components.map((comp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gray-900/70 border border-gray-800 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{comp.name}</span>
                  <span className="text-[11px] font-mono text-indigo-400">
                    {Math.round(comp.weight * 100)}% wt
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 leading-snug">{comp.description}</p>
              </div>

              <div className="space-y-1 pt-2 border-t border-gray-800/80">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[11px] text-gray-400">
                    Status: <strong className="text-gray-300">{comp.status}</strong>
                  </span>
                  <span className="font-bold text-emerald-400">
                    {comp.raw_score}% ({comp.weighted_score} pts)
                  </span>
                </div>
                <ProgressBar value={comp.raw_score} showLabel={false} height="sm" color="auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Priority Gaps (FR-31) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Strengths */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Top Verified Strengths</span>
          </div>
          <div className="space-y-2.5">
            {top_strengths.map((str, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-gray-900/80 border border-emerald-500/20 text-xs text-gray-200 flex items-center justify-between"
              >
                <span className="font-semibold text-white">{str}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  Strong
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Gaps */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Priority Improvement Gaps</span>
          </div>
          <div className="space-y-2.5">
            {priority_gaps.map((gap, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-gray-900/80 border border-rose-500/20 text-xs text-gray-200 flex items-center justify-between"
              >
                <span className="font-semibold text-white">{gap}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                  Deficit
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Action Plan (FR-31) */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
          <Lightbulb className="w-5 h-5 flex-shrink-0" />
          <span>Recommended Next Actions for Placement Readiness Fast-Track</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recommended_actions.map((act, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {act.urgency} Urgency
                </span>
                <h5 className="text-xs font-bold text-white mt-2 leading-snug">{act.action}</h5>
                <p className="text-[11px] text-cyan-400 font-medium mt-1">Impact: {act.impact}</p>
              </div>

              {onTakeAction && (
                <button
                  onClick={() => onTakeAction(act.action)}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Execute Step</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Formula details */}
        <div className="pt-3 border-t border-gray-800 text-[11px] text-gray-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
          <span>{readiness.formula_explanation}</span>
        </div>
      </div>
    </div>
  );
}
