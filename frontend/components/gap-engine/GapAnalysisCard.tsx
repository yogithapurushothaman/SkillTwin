'use client';

import React, { useState } from 'react';
import { RoleMatchResponse, SkillGapItem } from '@/types';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Calculator, 
  Sparkles, 
  ArrowRight,
  HelpCircle,
  TrendingDown,
  Flame
} from 'lucide-react';

interface GapAnalysisCardProps {
  matchResult: RoleMatchResponse | null;
  onTakeGapAssessment?: () => void;
}

export function GapAnalysisCard({
  matchResult,
  onTakeGapAssessment
}: GapAnalysisCardProps) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  if (!matchResult) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-[#E7E2D9] text-center shadow-xs">
        <Search className="w-8 h-8 text-[#D46238] mx-auto animate-pulse mb-3" />
        <p className="text-sm font-medium text-[#78716C]">Evaluating Skill Gaps against Role Blueprint...</p>
      </div>
    );
  }

  const { overall_match_score, critical_gaps, strong_areas, all_gaps, calculation_breakdown } = matchResult;

  return (
    <div className="space-y-6">
      {/* Top Match Gauge Card */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#78716C]">
                Deterministic Gap Engine
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E7E2D9] text-[#18181B] font-mono">
                {matchResult.role_title} ({matchResult.company})
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#18181B] tracking-tight">
              Role Match Score & Deficiency Matrix
            </h3>
            <p className="text-xs text-[#78716C] max-w-xl leading-relaxed">
              Every score is evaluated deterministically against required blueprint thresholds. Surplus scores in one skill cannot artificially mask a critical gap in another.
            </p>
          </div>

          {/* Big Match Badge */}
          <div className="flex items-center gap-4 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E7E2D9]">
            <div className="text-center">
              <div className="text-4xl font-black text-[#18181B] tracking-tight">
                {overall_match_score}%
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#78716C]">
                Role Match
              </span>
            </div>

            <div className="h-10 w-px bg-[#E7E2D9]" />

            <div className="text-left text-xs space-y-1 font-medium">
              <div className="text-[#24482B]">
                ✓ {matchResult.skills_met_count} of {matchResult.total_skills_count} Skills Met
              </div>
              <div className="text-[#B0432E]">
                ⚠ {critical_gaps.length} Critical Deficits
              </div>
            </div>
          </div>
        </div>

        {/* Action strip */}
        <div className="mt-6 pt-4 border-t border-[#E7E2D9] flex flex-wrap justify-between items-center gap-3">
          <button
            onClick={() => setShowFormulaModal(true)}
            className="inline-flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#18181B] font-medium cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Show Transparent Calculation Breakdown</span>
          </button>

          {onTakeGapAssessment && critical_gaps.length > 0 && (
            <button
              onClick={onTakeGapAssessment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D46238] hover:bg-[#BC4E26] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Launch Gap-Prioritized Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Critical Gaps Banner (FR-18) */}
      {critical_gaps.length > 0 ? (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FDF1EE] border border-[#F4CDC4] space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#B0432E] text-sm font-bold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Critical Placement Gaps Identified ({critical_gaps.length})</span>
            </div>
            <span className="text-[11px] text-[#B0432E] font-mono">Deficit ≥ 15 points</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {critical_gaps.map(cg => (
              <div
                key={cg.skill_id}
                className="p-4 rounded-xl bg-white border border-[#F4CDC4] space-y-2 shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-sm font-bold text-[#18181B]">{cg.skill_name}</h5>
                    <span className="text-[10px] text-[#78716C]">{cg.category}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-[#FDF1EE] text-[#B0432E] border border-[#F4CDC4]">
                    -{cg.deficit} pts
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#57534E]">
                    <span>Actual: <strong className="text-[#B0432E]">{cg.actual_score}%</strong></span>
                    <span>Required: <strong className="text-[#18181B]">{cg.required_score}%</strong></span>
                  </div>
                  <ProgressBar value={cg.actual_score} benchmark={cg.required_score} showLabel={false} height="sm" color="rose" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#EDF3EE] border border-[#CFDEC2] text-[#24482B] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>All required role blueprint proficiencies are currently satisfied!</span>
        </div>
      )}

      {/* Full Skill Gap Comparison Matrix */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] space-y-4 shadow-xs">
        <h4 className="text-xs font-mono font-bold text-[#78716C] uppercase tracking-[0.16em]">
          Complete Role Skill Gap Matrix ({all_gaps.length} Skills)
        </h4>

        <div className="overflow-x-auto rounded-xl border border-[#E7E2D9]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#78716C] border-b border-[#E7E2D9] font-semibold font-mono">
              <tr>
                <th className="py-2.5 px-4">Skill</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Actual</th>
                <th className="py-2.5 px-4">Required</th>
                <th className="py-2.5 px-4">Deficit</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D9] text-[#18181B]">
              {all_gaps.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F5]/60">
                  <td className="py-2.5 px-4 font-bold text-[#18181B]">{item.skill_name}</td>
                  <td className="py-2.5 px-4 text-[#78716C]">{item.category}</td>
                  <td className="py-2.5 px-4 font-bold font-mono">
                    <span className={item.actual_score >= item.required_score ? 'text-[#24482B]' : 'text-[#B0432E]'}>
                      {item.actual_score}%
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold font-mono text-[#18181B]">{item.required_score}%</td>
                  <td className="py-2.5 px-4 font-mono">
                    {item.deficit > 0 ? (
                      <span className="text-[#B0432E] font-bold">-{item.deficit} pts</span>
                    ) : (
                      <span className="text-[#24482B] font-medium">Met (0)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    {item.is_met ? (
                      <span className="inline-flex items-center gap-1 text-[#24482B] font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Met
                      </span>
                    ) : item.is_critical_gap ? (
                      <span className="inline-flex items-center gap-1 text-[#B0432E] font-bold text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5" /> Critical Gap
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#8A5C1E] font-medium text-[11px]">
                        Moderate Gap
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {item.evidence_sources.length > 0 ? (
                        item.evidence_sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-[#FAF8F5] text-[#57534E] border border-[#E7E2D9] font-mono"
                          >
                            {src}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#A8A29E] text-[10px]">None</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transparent Calculation Breakdown Modal (FR-19) */}
      <Modal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        title="Deterministic Gap & Match Calculation Breakdown"
        subtitle="Transparent per-skill clamped ratio and weighted contribution"
        maxWidth="4xl"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#57534E] space-y-1.5">
            <span className="font-bold text-[#18181B] block">Calculation Formula:</span>
            <p className="text-[11px] text-[#18181B] font-mono">
              Match Score = [ ∑ min(Actual / Required, 1.0) × Weight ] / Total_Weights × 100
            </p>
            <p className="text-[11px] text-[#78716C] leading-relaxed">
              Notice: The ratio is clamped at 1.0. Even if a candidate has 95% in Java against a 70% requirement, the contribution clamps to 1.0 × weight, ensuring deficiencies in DSA or SQL are not masked.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E7E2D9]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#78716C] border-b border-[#E7E2D9] font-semibold font-mono">
                <tr>
                  <th className="py-2.5 px-3">Skill</th>
                  <th className="py-2.5 px-3">Actual</th>
                  <th className="py-2.5 px-3">Required</th>
                  <th className="py-2.5 px-3">Raw Ratio</th>
                  <th className="py-2.5 px-3">Clamped Ratio</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2D9] font-mono text-[#18181B]">
                {calculation_breakdown.map((step, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5]/60">
                    <td className="py-2 px-3 font-sans font-bold text-[#18181B]">{step.skill_name}</td>
                    <td className="py-2 px-3">{step.actual}%</td>
                    <td className="py-2 px-3">{step.required}%</td>
                    <td className="py-2 px-3 text-[#78716C]">{step.ratio}</td>
                    <td className="py-2 px-3 font-bold text-[#D46238]">{step.clamped_ratio}</td>
                    <td className="py-2 px-3 text-[#57534E]">{step.weight}x</td>
                    <td className="py-2 px-3 font-bold text-[#24482B]">{step.weighted_contribution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] flex justify-between items-center">
            <span className="text-xs text-[#78716C] font-mono">Sum of Contributions / Total Weight × 100 =</span>
            <span className="text-2xl font-black text-[#24482B]">{overall_match_score}%</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
