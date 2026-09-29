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
      <div className="glass-panel p-8 rounded-2xl border border-gray-800 text-center">
        <Search className="w-8 h-8 text-indigo-400 mx-auto animate-pulse mb-3" />
        <p className="text-sm text-gray-400">Evaluating Skill Gaps against Role Blueprint...</p>
      </div>
    );
  }

  const { overall_match_score, critical_gaps, strong_areas, all_gaps, calculation_breakdown } = matchResult;

  return (
    <div className="space-y-6">
      {/* Top Match Gauge Card */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Deterministic Gap Engine (FR-17, FR-18)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                Target: {matchResult.role_title} ({matchResult.company})
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              Role Match Score & Deficiency Matrix
            </h3>
            <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
              Every score is evaluated deterministically against required blueprint thresholds. Surplus scores in one skill cannot artificially mask a critical gap in another.
            </p>
          </div>

          {/* Radial / Big Match Badge */}
          <div className="flex items-center gap-4 bg-gray-900/90 p-4 rounded-2xl border border-gray-700/80 shadow-inner">
            <div className="text-center">
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                {overall_match_score}%
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Overall Match
              </span>
            </div>

            <div className="h-10 w-px bg-gray-800" />

            <div className="text-left text-xs space-y-1">
              <div className="text-emerald-400 font-semibold">
                ✓ {matchResult.skills_met_count} of {matchResult.total_skills_count} Skills Met
              </div>
              <div className="text-rose-400 font-semibold">
                ⚠ {critical_gaps.length} Critical Gaps
              </div>
            </div>
          </div>
        </div>

        {/* Action strip */}
        <div className="mt-5 pt-4 border-t border-gray-800 flex flex-wrap justify-between items-center gap-3">
          <button
            onClick={() => setShowFormulaModal(true)}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Show Transparent Calculation Breakdown (FR-19)</span>
          </button>

          {onTakeGapAssessment && critical_gaps.length > 0 && (
            <button
              onClick={onTakeGapAssessment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Launch Gap-Prioritized Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Critical Gaps Banner (FR-18) */}
      {critical_gaps.length > 0 ? (
        <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 text-sm font-bold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Critical Placement Gaps Identified ({critical_gaps.length})</span>
            </div>
            <span className="text-[11px] text-rose-300/80 font-medium">Deficit ≥ 15 points</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {critical_gaps.map(cg => (
              <div
                key={cg.skill_id}
                className="p-3.5 rounded-xl bg-gray-900/90 border border-rose-500/40 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-sm font-bold text-white">{cg.skill_name}</h5>
                    <span className="text-[10px] text-gray-400">{cg.category}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    -{cg.deficit} deficit
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-300">
                    <span>Actual: <strong className="text-rose-400">{cg.actual_score}%</strong></span>
                    <span>Required: <strong className="text-indigo-400">{cg.required_score}%</strong></span>
                  </div>
                  <ProgressBar value={cg.actual_score} benchmark={cg.required_score} showLabel={false} height="sm" color="rose" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>All required role blueprint proficiencies are currently satisfied!</span>
        </div>
      )}

      {/* Full Skill Gap Comparison Matrix */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Complete Role Skill Gap Matrix ({all_gaps.length} Skills)
        </h4>

        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-800/60 text-gray-400 border-b border-gray-800 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Skill</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Actual Score</th>
                <th className="py-2.5 px-4">Required Score</th>
                <th className="py-2.5 px-4">Deficit</th>
                <th className="py-2.5 px-4">Requirement Status</th>
                <th className="py-2.5 px-4">Evidence Sources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {all_gaps.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-800/30">
                  <td className="py-2.5 px-4 font-bold text-white">{item.skill_name}</td>
                  <td className="py-2.5 px-4 text-gray-400">{item.category}</td>
                  <td className="py-2.5 px-4 font-semibold">
                    <span className={item.actual_score >= item.required_score ? 'text-emerald-400' : 'text-rose-400'}>
                      {item.actual_score}%
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-indigo-400">{item.required_score}%</td>
                  <td className="py-2.5 px-4">
                    {item.deficit > 0 ? (
                      <span className="text-rose-400 font-bold">-{item.deficit} pts</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">Met (0)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    {item.is_met ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Met
                      </span>
                    ) : item.is_critical_gap ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5" /> Critical Gap
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-medium text-[11px]">
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
                            className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300 border border-gray-700"
                          >
                            {src}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-[10px]">None</span>
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
        subtitle="Transparent per-skill clamped ratio and weighted contribution (FR-19)"
        maxWidth="4xl"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
            <span className="font-bold block">Calculation Formula:</span>
            <p className="text-[11px] text-gray-300 font-mono">
              Match Score = [ ∑ min(Actual / Required, 1.0) × Weight ] / Total_Weights × 100
            </p>
            <p className="text-[11px] text-gray-400">
              Notice: The ratio is clamped at 1.0. Even if a candidate has 95% in Java against a 70% requirement, the contribution clamps to 1.0 × weight, ensuring deficiencies in DSA or SQL are not masked.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950/70">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-800/80 text-gray-400 border-b border-gray-800 font-semibold">
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
              <tbody className="divide-y divide-gray-800 font-mono text-gray-300">
                {calculation_breakdown.map((step, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/40">
                    <td className="py-2 px-3 font-sans font-bold text-white">{step.skill_name}</td>
                    <td className="py-2 px-3">{step.actual}%</td>
                    <td className="py-2 px-3">{step.required}%</td>
                    <td className="py-2 px-3 text-gray-400">{step.ratio}</td>
                    <td className="py-2 px-3 font-bold text-cyan-400">{step.clamped_ratio}</td>
                    <td className="py-2 px-3 text-indigo-400">{step.weight}x</td>
                    <td className="py-2 px-3 font-bold text-emerald-400">{step.weighted_contribution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 flex justify-between items-center">
            <span className="text-xs text-gray-400">Sum of Contributions / Total Weight × 100 =</span>
            <span className="text-xl font-bold text-emerald-400">{overall_match_score}%</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
