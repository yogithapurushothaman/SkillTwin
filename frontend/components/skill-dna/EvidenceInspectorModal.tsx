'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { SkillDNAItem } from '@/types';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { 
  ShieldCheck, 
  FileText, 
  Code, 
  CheckCircle, 
  Briefcase, 
  Bot, 
  Calendar,
  HelpCircle
} from 'lucide-react';

interface EvidenceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillDNAItem | null;
}

export function EvidenceInspectorModal({
  isOpen,
  onClose,
  skill
}: EvidenceInspectorModalProps) {
  if (!skill) return null;

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'assessment':
        return <Code className="w-4 h-4 text-[#4E6554]" />;
      case 'tech_interview':
      case 'hr_interview':
        return <CheckCircle className="w-4 h-4 text-[#18181B]" />;
      case 'internship':
        return <Briefcase className="w-4 h-4 text-[#D46238]" />;
      case 'resume':
      default:
        return <FileText className="w-4 h-4 text-[#78716C]" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Skill Verification Audit: ${skill.skill_name}`}
      subtitle={`Verifiable Evidence Chain & Deterministic Aggregation Formula`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Summary Card */}
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#18181B]">{skill.skill_name}</span>
              <StatusBadge status={skill.verification_status} />
              <Badge variant="info">{skill.category}</Badge>
            </div>
            <p className="text-xs text-[#78716C] mt-1">
              Proficiency Level: <strong className="text-[#18181B]">{skill.proficiency_level}</strong> · Claimed: {skill.claimed_score}%
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-[#78716C] block font-mono uppercase">Verified Deterministic Score</span>
            <span className="text-3xl font-black text-[#24482B]">{skill.score}%</span>
          </div>
        </div>

        {/* Evidence List */}
        <div>
          <h4 className="text-xs font-mono font-bold text-[#78716C] uppercase tracking-[0.16em] mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#4E6554]" />
            Verifiable Evidence Records ({skill.evidence_items.length})
          </h4>

          {skill.evidence_items.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D9] text-center text-xs text-[#78716C]">
              No evidence recorded yet. Complete an online assessment or technical interview to verify this skill.
            </div>
          ) : (
            <div className="space-y-3">
              {skill.evidence_items.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white border border-[#E7E2D9] hover:border-[#DDD6CA] transition-colors space-y-2 shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D9]">
                        {getSourceIcon(ev.source)}
                      </div>
                      <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-mono">
                        {ev.source.replace('_', ' ')}
                      </span>
                      {ev.ai_assisted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-[#FAF8F5] text-[#78716C] border border-[#E7E2D9] font-mono">
                          <Bot className="w-3 h-3" /> AI-Assisted
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-black text-[#24482B]">{ev.score}%</span>
                  </div>

                  {/* Metadata / Details */}
                  {ev.details_json && (
                    <div className="text-[11px] text-[#57534E] bg-[#FAF8F5] p-3 rounded-lg border border-[#E7E2D9] font-mono">
                      {typeof ev.details_json === 'object' ? (
                        <pre className="whitespace-pre-wrap font-sans text-xs text-[#57534E]">
                          {JSON.stringify(ev.details_json, null, 2)}
                        </pre>
                      ) : (
                        ev.details_json
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[10px] text-[#78716C] font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>Recorded on {new Date(ev.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aggregation Formula Explainer */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#18181B]">
            <HelpCircle className="w-4 h-4 text-[#D46238]" />
            <span>Deterministic Aggregation Rule</span>
          </div>
          <p className="text-[11px] text-[#78716C] leading-relaxed">
            Final Skill Score = ∑ (Evidence_Score × Normalized_Source_Weight). 
            Weights: Online Assessment (45%), Technical Interview (25%), Internship (20%), Resume Claim (10% provisional).
            If only an assessment exists, score equals 100% of assessment. Unverified claims remain provisional and marked 🟡 Self-Declared.
          </p>
        </div>
      </div>
    </Modal>
  );
}
