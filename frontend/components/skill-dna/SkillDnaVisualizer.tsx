'use client';

import React, { useState } from 'react';
import { SkillDNAResponse, SkillDNAItem } from '@/types';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EvidenceInspectorModal } from './EvidenceInspectorModal';
import { 
  ShieldCheck, 
  Dna, 
  ExternalLink, 
  Zap, 
  TrendingUp, 
  HelpCircle,
  FileText
} from 'lucide-react';

interface SkillDnaVisualizerProps {
  dna: SkillDNAResponse | null;
  onTakeAssessment?: () => void;
}

export function SkillDnaVisualizer({ dna, onTakeAssessment }: SkillDnaVisualizerProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillDNAItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'technical' | 'problem_solving' | 'soft_skills'>('all');

  if (!dna) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-gray-800 text-center">
        <Dna className="w-8 h-8 text-indigo-400 mx-auto animate-spin mb-3" />
        <p className="text-sm text-gray-300">Loading Skill DNA Profile...</p>
      </div>
    );
  }

  const categoryGroups = [
    { id: 'technical', label: 'Technical Skills', count: dna.technical_skills.length, items: dna.technical_skills },
    { id: 'problem_solving', label: 'Problem Solving', count: dna.problem_solving_skills.length, items: dna.problem_solving_skills },
    { id: 'soft_skills', label: 'Soft Skills', count: dna.soft_skills.length, items: dna.soft_skills }
  ];

  const displayedGroups =
    activeCategory === 'all'
      ? categoryGroups
      : categoryGroups.filter(g => g.id === activeCategory);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Living Skill DNA Profile
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {dna.student_name}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              FR-9, FR-10, FR-11: Evidence-backed proficiencies across Technical, Problem Solving, and Soft Skills.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <span className="text-xs text-gray-400 block font-medium">Verified (🟢)</span>
              <span className="text-base font-bold text-emerald-400">{dna.verified_count}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
              <span className="text-xs text-gray-400 block font-medium">Self-Declared (🟡)</span>
              <span className="text-base font-bold text-amber-400">{dna.self_declared_count}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center">
              <span className="text-xs text-gray-400 block font-medium">Gaps (🔴)</span>
              <span className="text-base font-bold text-rose-400">{dna.gap_count}</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800/80 text-gray-400 hover:text-white'
            }`}
          >
            All Categories ({dna.skills.length})
          </button>
          {categoryGroups.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveCategory(g.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === g.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/80 text-gray-400 hover:text-white'
              }`}
            >
              {g.label} ({g.count})
            </button>
          ))}
        </div>
      </div>

      {/* Categorized DNA Grids */}
      <div className="space-y-6">
        {displayedGroups.map(group => (
          <div key={group.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-2">
                <span>{group.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                  {group.items.length} skills
                </span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map(item => (
                <div
                  key={item.skill_id}
                  onClick={() => setSelectedSkill(item)}
                  className="glass-panel glass-panel-hover p-4 rounded-xl border border-gray-800/90 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <h5 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {item.skill_name}
                        </h5>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {item.proficiency_level} Proficiency
                        </span>
                      </div>
                      <StatusBadge status={item.verification_status} />
                    </div>

                    {/* Progress Bar */}
                    <div className="my-2">
                      <ProgressBar value={item.score} showLabel={false} height="md" />
                    </div>

                    {/* Score Matrix (Claim vs Assessment vs Verified) - FR-10 */}
                    <div className="grid grid-cols-3 gap-1 py-2 px-2.5 rounded-lg bg-gray-900/80 border border-gray-800/80 text-center my-2">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Claimed</span>
                        <span className="text-xs font-bold text-amber-400">{item.claimed_score}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Assessed</span>
                        <span className="text-xs font-bold text-cyan-400">
                          {item.assessment_score !== null && item.assessment_score !== undefined
                            ? `${item.assessment_score}%`
                            : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Verified</span>
                        <span className="text-xs font-bold text-emerald-400">{item.score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer link to evidence */}
                  <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-400">
                      {item.evidence_count} evidence source{item.evidence_count !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedSkill(item);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      Audit Proof <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Evidence Inspector Modal (FR-12) */}
      <EvidenceInspectorModal
        isOpen={!!selectedSkill}
        onClose={() => setSelectedSkill(null)}
        skill={selectedSkill}
      />
    </div>
  );
}
