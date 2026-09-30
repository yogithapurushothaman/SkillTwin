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
  FileText,
  ArrowRight
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
      <div className="bg-white p-12 rounded-2xl border border-[#E7E2D9] text-center shadow-xs">
        <Dna className="w-8 h-8 text-[#D46238] mx-auto animate-spin mb-3" />
        <p className="text-sm font-medium text-[#78716C]">Loading Verifiable Skill DNA...</p>
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
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#E7E2D9]">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-[#18181B] tracking-tight">
                Living Skill DNA Profile
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF8F5] text-[#18181B] border border-[#DDD6CA]">
                {dna.student_name}
              </span>
            </div>
            <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
              Evidence-backed skill proficiencies across Technical, Problem Solving, and Soft Skills.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2.5">
            <div className="px-4 py-2 rounded-xl bg-[#EDF3EE] border border-[#CFDEC2] text-center">
              <span className="text-[11px] text-[#24482B] block font-mono font-medium uppercase">Verified</span>
              <span className="text-lg font-black text-[#24482B]">{dna.verified_count}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#FBF6EC] border border-[#E9DFCE] text-center">
              <span className="text-[11px] text-[#8A5C1E] block font-mono font-medium uppercase">Self-Declared</span>
              <span className="text-lg font-black text-[#8A5C1E]">{dna.self_declared_count}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#FDF1EE] border border-[#F4CDC4] text-center">
              <span className="text-[11px] text-[#B0432E] block font-mono font-medium uppercase">Deficits</span>
              <span className="text-lg font-black text-[#B0432E]">{dna.gap_count}</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#68645E] hover:text-[#18181B] border border-[#E7E2D9]'
            }`}
          >
            All Categories ({dna.skills.length})
          </button>
          {categoryGroups.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveCategory(g.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeCategory === g.id
                  ? 'bg-[#18181B] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#68645E] hover:text-[#18181B] border border-[#E7E2D9]'
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
              <h4 className="text-xs uppercase tracking-[0.16em] font-mono font-bold text-[#78716C] flex items-center gap-2">
                <span>{group.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#E7E2D9] text-[#78716C]">
                  {group.items.length} skills
                </span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map(item => (
                <div
                  key={item.skill_id}
                  onClick={() => setSelectedSkill(item)}
                  className="bg-white p-5 rounded-2xl border border-[#E7E2D9] cursor-pointer flex flex-col justify-between transition-all hover:border-[#DDD6CA] hover:shadow-md group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <h5 className="text-sm font-bold text-[#18181B] group-hover:text-[#D46238] transition-colors">
                          {item.skill_name}
                        </h5>
                        <span className="text-[11px] text-[#78716C]">
                          {item.proficiency_level} Proficiency
                        </span>
                      </div>
                      <StatusBadge status={item.verification_status} />
                    </div>

                    {/* Progress Bar */}
                    <div className="my-2.5">
                      <ProgressBar value={item.score} showLabel={false} height="md" />
                    </div>

                    {/* Score Matrix (Claim vs Assessment vs Verified) - FR-10 */}
                    <div className="grid grid-cols-3 gap-1 py-2 px-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] text-center my-2.5">
                      <div>
                        <span className="text-[10px] text-[#78716C] block font-mono">Claimed</span>
                        <span className="text-xs font-bold text-[#8A5C1E]">{item.claimed_score}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#78716C] block font-mono">Assessed</span>
                        <span className="text-xs font-bold text-[#18181B]">
                          {item.assessment_score !== null && item.assessment_score !== undefined
                            ? `${item.assessment_score}%`
                            : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#78716C] block font-mono">Verified</span>
                        <span className="text-xs font-bold text-[#24482B]">{item.score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer link to evidence */}
                  <div className="pt-3 border-t border-[#E7E2D9] flex items-center justify-between text-xs mt-1">
                    <span className="text-[11px] text-[#78716C]">
                      {item.evidence_count} evidence source{item.evidence_count !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedSkill(item);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D46238] hover:text-[#BC4E26] cursor-pointer"
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
