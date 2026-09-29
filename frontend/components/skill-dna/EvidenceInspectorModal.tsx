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
        return <Code className="w-4 h-4 text-emerald-400" />;
      case 'tech_interview':
      case 'hr_interview':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'internship':
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      case 'resume':
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Skill Verification Audit: ${skill.skill_name}`}
      subtitle={`FR-12 & FR-13: Verifiable Evidence Chain & Deterministic Aggregation Formula`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Summary Card */}
        <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">{skill.skill_name}</span>
              <StatusBadge status={skill.verification_status} />
              <Badge variant="info">{skill.category}</Badge>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Proficiency Level: <strong className="text-indigo-400">{skill.proficiency_level}</strong> · Claimed: {skill.claimed_score}%
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 block">Verified Deterministic Score</span>
            <span className="text-3xl font-extrabold text-emerald-400">{skill.score}%</span>
          </div>
        </div>

        {/* Evidence List */}
        <div>
          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verifiable Evidence Records ({skill.evidence_items.length})
          </h4>

          {skill.evidence_items.length === 0 ? (
            <div className="p-6 rounded-xl bg-gray-900/60 border border-gray-800 text-center text-xs text-gray-400">
              No evidence recorded yet. Complete an online assessment or technical interview to verify this skill.
            </div>
          ) : (
            <div className="space-y-3">
              {skill.evidence_items.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 transition-colors space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gray-800 border border-gray-700">
                        {getSourceIcon(ev.source)}
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {ev.source.replace('_', ' ')}
                      </span>
                      {ev.ai_assisted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <Bot className="w-3 h-3" /> AI-Assisted (AI-6)
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{ev.score}%</span>
                  </div>

                  {/* Metadata / Details */}
                  {ev.details_json && (
                    <div className="text-[11px] text-gray-300 bg-gray-950/60 p-2.5 rounded-lg border border-gray-800 font-mono">
                      {typeof ev.details_json === 'object' ? (
                        <pre className="whitespace-pre-wrap font-sans text-xs text-gray-300">
                          {JSON.stringify(ev.details_json, null, 2)}
                        </pre>
                      ) : (
                        ev.details_json
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Recorded on {new Date(ev.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aggregation Formula Explainer (FR-13) */}
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Deterministic Aggregation Rule (PRD Section 8)</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            Final Skill Score = ∑ (Evidence_Score × Normalized_Source_Weight). 
            Weights: Online Assessment (45%), Technical Interview (25%), Internship (20%), Resume Claim (10% provisional).
            If only an assessment exists, score equals 100% of assessment. Unverified claims remain provisional and marked 🟡 Self-Declared.
          </p>
        </div>
      </div>
    </Modal>
  );
}
