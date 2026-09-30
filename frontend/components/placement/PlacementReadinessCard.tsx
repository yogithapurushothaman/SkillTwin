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
      <div className="bg-white p-12 rounded-2xl border border-[#E7E2D9] text-center shadow-xs">
        <Award className="w-8 h-8 text-[#D46238] mx-auto animate-pulse mb-3" />
        <p className="text-sm font-medium text-[#78716C]">Computing Placement Readiness Intelligence...</p>
      </div>
    );
  }

  const { overall_readiness_score, readiness_band, components, top_strengths, priority_gaps, recommended_actions } = readiness;

  return (
    <div className="space-y-6">
      {/* Top Readiness Scorecard */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#E7E2D9]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#78716C]">
                Multi-Stage Placement Engine
              </span>
              <ReadinessBandBadge band={readiness_band} />
            </div>
            <h3 className="text-2xl font-black text-[#18181B] tracking-tight">
              Placement Readiness Index
            </h3>
            <p className="text-xs text-[#78716C] max-w-xl leading-relaxed">
              Synthesized across 6 evidence stages: resume credentials, demonstrated technical proficiencies, online assessments, technical interviews, HR evaluation, and soft skills.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E7E2D9]">
            <div className="text-center">
              <div className="text-4xl font-black text-[#24482B] tracking-tight">
                {overall_readiness_score}%
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#78716C] block mt-0.5">
                Readiness Score
              </span>
            </div>

            <div className="h-10 w-px bg-[#E7E2D9]" />

            <div className="text-left text-xs space-y-1 font-medium">
              <div className="text-[#18181B] font-bold">{readiness_band}</div>
              <div className="text-[11px] text-[#78716C]">
                Threshold: ≥75% for Direct Placement
              </div>
            </div>
          </div>
        </div>

        {/* 6 Weighted Components Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-6">
          {components.map((comp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#18181B]">{comp.name}</span>
                  <span className="text-[11px] font-mono text-[#D46238] font-bold">
                    {Math.round(comp.weight * 100)}% wt
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C] mt-1 leading-snug">{comp.description}</p>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#E7E2D9]">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[11px] text-[#78716C]">
                    Status: <strong className="text-[#18181B]">{comp.status}</strong>
                  </span>
                  <span className="font-bold font-mono text-[#24482B]">
                    {comp.raw_score}% ({comp.weighted_score} pts)
                  </span>
                </div>
                <ProgressBar value={comp.raw_score} showLabel={false} height="sm" color="auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Priority Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Strengths */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-[#24482B]">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Top Verified Strengths</span>
          </div>
          <div className="space-y-2.5">
            {top_strengths.map((str, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#EDF3EE] border border-[#CFDEC2] text-xs text-[#18181B] flex items-center justify-between"
              >
                <span className="font-bold text-[#18181B]">{str}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#24482B] font-bold border border-[#CFDEC2]">
                  Strong
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Gaps */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-[#B0432E]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Priority Improvement Gaps</span>
          </div>
          <div className="space-y-2.5">
            {priority_gaps.map((gap, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#FDF1EE] border border-[#F4CDC4] text-xs text-[#18181B] flex items-center justify-between"
              >
                <span className="font-bold text-[#18181B]">{gap}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#B0432E] font-bold border border-[#F4CDC4]">
                  Deficit
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Action Plan */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-[#18181B]">
          <Lightbulb className="w-5 h-5 text-[#D46238] flex-shrink-0" />
          <span>Recommended Next Actions for Placement Readiness</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {recommended_actions.map((act, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white text-[#78716C] border border-[#DDD6CA]">
                  {act.urgency} Urgency
                </span>
                <h5 className="text-xs font-bold text-[#18181B] mt-2.5 leading-snug">{act.action}</h5>
                <p className="text-[11px] text-[#57534E] font-medium mt-1">Impact: {act.impact}</p>
              </div>

              {onTakeAction && (
                <button
                  onClick={() => onTakeAction(act.action)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#D46238] hover:text-[#BC4E26] font-semibold cursor-pointer pt-2 border-t border-[#E7E2D9]"
                >
                  <span>Execute Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
