'use client';

import React, { useState } from 'react';
import { useIndustryMatching } from '@/hooks/useIndustryMatching';
import { CandidateMatchItem } from '@/types';
import { ReadinessBandBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { 
  Briefcase, 
  Search, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Filter, 
  Building,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

interface IndustryRecruiterDashboardProps {
  onInspectStudentDna?: (studentId: number) => void;
}

export function IndustryRecruiterDashboard({
  onInspectStudentDna
}: IndustryRecruiterDashboardProps) {
  const {
    blueprints,
    selectedRoleId,
    setSelectedRoleId,
    candidates,
    minMatch,
    setMinMatch,
    minReadiness,
    setMinReadiness,
    department,
    setDepartment,
    selectedCandidate,
    setSelectedCandidate,
    loading,
    error,
    toggleShortlist
  } = useIndustryMatching();

  const [activeTab, setActiveTab] = useState<'all' | 'shortlisted'>('all');

  const displayedCandidates =
    activeTab === 'all'
      ? candidates
      : candidates.filter(c => c.is_shortlisted);

  const selectedRole = blueprints.find(b => b.id === selectedRoleId);

  return (
    <div className="space-y-6">
      {/* Top Banner & Filters */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-[#E7E2D9]">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#D46238]" />
              <h3 className="text-xl font-bold text-[#18181B]">Recruiter Talent Discovery & Matching</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#FAF8F5] text-[#18181B] font-mono border border-[#E7E2D9]">
                Verifiable
              </span>
            </div>
            <p className="text-xs text-[#78716C] mt-1">
              Evidence-based candidate matching. Candidates ranked strictly by blueprint verification, not unverified resume claims.
            </p>
          </div>

          {/* Role Blueprint Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716C] font-mono">Target Role:</span>
            <select
              value={selectedRoleId || ''}
              onChange={e => setSelectedRoleId(parseInt(e.target.value, 10))}
              className="bg-[#FAF8F5] border border-[#DDD6CA] rounded-lg px-3 py-1.5 text-xs text-[#18181B] font-semibold focus:outline-none focus:border-[#18181B] cursor-pointer"
            >
              {blueprints.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.company})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Sliders & Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#78716C] font-medium font-mono">Min Role Match Score</span>
              <span className="font-bold font-mono text-[#D46238]">{minMatch}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minMatch}
              onChange={e => setMinMatch(parseInt(e.target.value, 10))}
              className="w-full accent-[#D46238] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#78716C] font-medium font-mono">Min Placement Readiness</span>
              <span className="font-bold font-mono text-[#24482B]">{minReadiness}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minReadiness}
              onChange={e => setMinReadiness(parseInt(e.target.value, 10))}
              className="w-full accent-[#24482B] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] flex items-center justify-between">
            <div className="text-xs">
              <span className="text-[#78716C] block font-medium font-mono">Department</span>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="bg-transparent text-[#18181B] font-bold focus:outline-none cursor-pointer mt-1"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Information Technology">IT</option>
                <option value="AI & Data Science">AI & DS</option>
                <option value="Electronics & Communication">ECE</option>
              </select>
            </div>

            <div className="flex bg-white p-1 rounded-lg border border-[#DDD6CA]">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                  activeTab === 'all' ? 'bg-[#18181B] text-white shadow-xs' : 'text-[#78716C]'
                }`}
              >
                All ({candidates.length})
              </button>
              <button
                onClick={() => setActiveTab('shortlisted')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                  activeTab === 'shortlisted' ? 'bg-[#18181B] text-white shadow-xs' : 'text-[#78716C]'
                }`}
              >
                Starred
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate List (FR-39) */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E7E2D9] text-center shadow-xs">
            <Search className="w-8 h-8 text-[#D46238] mx-auto animate-pulse mb-3" />
            <p className="text-xs text-[#78716C]">Filtering candidates against role blueprint...</p>
          </div>
        ) : displayedCandidates.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E7E2D9] text-center text-xs text-[#78716C] shadow-xs">
            No candidates meet the active threshold filters. Try reducing the minimum match or readiness score.
          </div>
        ) : (
          displayedCandidates.map(c => (
            <div
              key={c.student_id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E7E2D9] hover:border-[#DDD6CA] hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs"
            >
              {/* Left Profile Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-[#18181B]">{c.student_name}</h4>
                  <ReadinessBandBadge band={c.readiness_band} />
                  <span className="text-xs text-[#78716C] font-mono">CGPA: {c.cgpa}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#78716C]">
                  <span className="flex items-center gap-1 font-mono">
                    <GraduationCap className="w-3.5 h-3.5 text-[#D46238]" />
                    {c.department} ({c.year} Batch)
                  </span>
                  <span>·</span>
                  <span className="text-[#24482B] font-medium font-mono">
                    {c.verified_skills_count} verified skills
                  </span>
                </div>

                {/* Top verified skills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.top_verified_skills.map((ts, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#FAF8F5] border border-[#E7E2D9] text-[#18181B]"
                    >
                      <strong className="font-semibold">{ts.name}:</strong>{' '}
                      <span className="text-[#24482B] font-bold font-mono">{ts.score}%</span>
                    </span>
                  ))}
                  {c.critical_gaps.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#FDF1EE] border border-[#F4CDC4] text-[#B0432E] font-mono">
                      Gaps: {c.critical_gaps.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Scores & Shortlist Button */}
              <div className="flex items-center gap-4 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-[#78716C] block uppercase font-mono tracking-wider">
                    Role Match
                  </span>
                  <span className="text-3xl font-black text-[#24482B] tracking-tight">{c.match_score}%</span>
                  <span className="block text-[11px] text-[#78716C] font-mono">
                    Readiness: {c.readiness_score}%
                  </span>
                </div>

                {/* Shortlist Toggle */}
                <button
                  onClick={() => toggleShortlist(c.student_id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    c.is_shortlisted
                      ? 'bg-[#FBF6EC] border-[#E9DFCE] text-[#8A5C1E] shadow-xs'
                      : 'bg-[#FAF8F5] border-[#DDD6CA] text-[#78716C] hover:text-[#18181B] hover:bg-white'
                  }`}
                  title={c.is_shortlisted ? 'Candidate Shortlisted' : 'Shortlist Candidate'}
                >
                  <Star className={`w-4 h-4 ${c.is_shortlisted ? 'fill-[#B47D1C] text-[#B47D1C]' : ''}`} />
                </button>

                {/* Inspect candidate detail */}
                <button
                  onClick={() => setSelectedCandidate(c)}
                  className="px-4 py-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFEA] text-xs font-semibold text-[#18181B] border border-[#DDD6CA] transition-colors cursor-pointer shadow-xs"
                >
                  View Evidence
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Candidate Detail Modal (FR-40) */}
      {selectedCandidate && (
        <Modal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title={`Candidate Profile: ${selectedCandidate.student_name}`}
          subtitle={`Verified Skills, Evidence Chain & Gap Breakdown for ${selectedRole?.title || 'Selected Role'}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Quick stats */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] flex justify-between items-center">
              <div>
                <span className="text-sm font-bold text-[#18181B]">{selectedCandidate.student_name}</span>
                <p className="text-xs text-[#78716C] mt-0.5">
                  {selectedCandidate.department} · {selectedCandidate.year} Batch · CGPA: {selectedCandidate.cgpa}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#78716C] block font-mono uppercase">Role Match</span>
                <span className="text-2xl font-black text-[#24482B]">{selectedCandidate.match_score}%</span>
              </div>
            </div>

            {/* Top Verified Skills */}
            <div>
              <h5 className="text-xs font-mono font-bold text-[#78716C] uppercase tracking-wider mb-2">
                Demonstrated & Verified Proficiencies
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {selectedCandidate.top_verified_skills.map((ts, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E7E2D9] flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#18181B]">{ts.name}</span>
                    <span className="font-bold text-[#24482B] font-mono">{ts.score}% (🟢 Verified)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Gaps for this Role */}
            {selectedCandidate.critical_gaps.length > 0 && (
              <div className="p-4 rounded-xl bg-[#FDF1EE] border border-[#F4CDC4] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#B0432E]">
                  <AlertCircle className="w-4 h-4" />
                  <span>Identified Deficiencies for this Blueprint:</span>
                </div>
                <p className="text-[#57534E]">
                  {selectedCandidate.critical_gaps.join(', ')} fall below required benchmark thresholds.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-[#E7E2D9] flex justify-between items-center">
              <button
                onClick={() => {
                  toggleShortlist(selectedCandidate.student_id);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCandidate.is_shortlisted
                    ? 'bg-[#FBF6EC] text-[#8A5C1E] border border-[#E9DFCE]'
                    : 'bg-[#18181B] text-white hover:bg-[#2E2E33]'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${selectedCandidate.is_shortlisted ? 'fill-[#B47D1C]' : ''}`} />
                <span>{selectedCandidate.is_shortlisted ? 'Shortlisted Candidate ✓' : 'Shortlist Candidate'}</span>
              </button>

              {onInspectStudentDna && (
                <button
                  onClick={() => {
                    const sid = selectedCandidate.student_id;
                    setSelectedCandidate(null);
                    onInspectStudentDna(sid);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#D46238] hover:text-[#BC4E26] font-semibold cursor-pointer"
                >
                  <span>Open Full Skill DNA in Student View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
