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
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-bold text-white">Recruiter Talent Discovery & Matching</h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                FR-39 & FR-41
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Evidence-based candidate matching. Candidates ranked strictly by blueprint verification, not unverified resume claims.
            </p>
          </div>

          {/* Role Blueprint Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Target Role:</span>
            <select
              value={selectedRoleId || ''}
              onChange={e => setSelectedRoleId(parseInt(e.target.value, 10))}
              className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {blueprints.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.company})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Sliders & Controls (FR-41) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">Min Role Match Score</span>
              <span className="font-bold text-indigo-400">{minMatch}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minMatch}
              onChange={e => setMinMatch(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">Min Placement Readiness</span>
              <span className="font-bold text-emerald-400">{minReadiness}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minReadiness}
              onChange={e => setMinReadiness(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-gray-400 block font-medium">Filter by Department</span>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer mt-1"
              >
                <option value="All" className="bg-gray-900">All Departments</option>
                <option value="Computer Science & Engineering" className="bg-gray-900">CSE</option>
                <option value="Information Technology" className="bg-gray-900">IT</option>
                <option value="AI & Data Science" className="bg-gray-900">AI & DS</option>
                <option value="Electronics & Communication" className="bg-gray-900">ECE</option>
              </select>
            </div>

            <div className="flex bg-gray-800 p-0.5 rounded-lg border border-gray-700">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-400'
                }`}
              >
                All ({candidates.length})
              </button>
              <button
                onClick={() => setActiveTab('shortlisted')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  activeTab === 'shortlisted' ? 'bg-indigo-600 text-white' : 'text-gray-400'
                }`}
              >
                Starred
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate List (FR-39) */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-panel p-8 rounded-2xl border border-gray-800 text-center">
            <Search className="w-8 h-8 text-indigo-400 mx-auto animate-pulse mb-3" />
            <p className="text-xs text-gray-400">Filtering candidates...</p>
          </div>
        ) : displayedCandidates.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-gray-800 text-center text-xs text-gray-400">
            No candidates meet the active threshold filters. Try reducing the minimum match or readiness score.
          </div>
        ) : (
          displayedCandidates.map(c => (
            <div
              key={c.student_id}
              className="glass-panel glass-panel-hover p-5 rounded-2xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              {/* Left Profile Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{c.student_name}</h4>
                  <ReadinessBandBadge band={c.readiness_band} />
                  <span className="text-xs text-gray-400 font-mono">CGPA: {c.cgpa}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    {c.department} ({c.year} Batch)
                  </span>
                  <span>·</span>
                  <span className="text-emerald-400 font-medium">
                    {c.verified_skills_count} verified skills
                  </span>
                </div>

                {/* Top verified skills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.top_verified_skills.map((ts, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] bg-gray-900 border border-gray-700/80 text-gray-200"
                    >
                      <strong className="text-white">{ts.name}:</strong>{' '}
                      <span className="text-emerald-400">{ts.score}%</span>
                    </span>
                  ))}
                  {c.critical_gaps.length > 0 && (
                    <span className="px-2 py-0.5 rounded text-[11px] bg-rose-500/10 border border-rose-500/30 text-rose-400">
                      Gaps: {c.critical_gaps.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Scores & Shortlist Button */}
              <div className="flex items-center gap-4 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">
                    Role Match Score
                  </span>
                  <span className="text-2xl font-black text-emerald-400">{c.match_score}%</span>
                  <span className="block text-[10px] text-gray-400">
                    Readiness: {c.readiness_score}%
                  </span>
                </div>

                {/* Shortlist Toggle */}
                <button
                  onClick={() => toggleShortlist(c.student_id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    c.is_shortlisted
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title={c.is_shortlisted ? 'Candidate Shortlisted' : 'Shortlist Candidate'}
                >
                  <Star className={`w-4 h-4 ${c.is_shortlisted ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>

                {/* Inspect candidate detail */}
                <button
                  onClick={() => setSelectedCandidate(c)}
                  className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white border border-gray-700 transition-colors cursor-pointer"
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
          subtitle={`FR-40: Verified Skills, Evidence Chain & Gap Breakdown for ${selectedRole?.title || 'Selected Role'}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Quick stats */}
            <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700 flex justify-between items-center">
              <div>
                <span className="text-sm font-bold text-white">{selectedCandidate.student_name}</span>
                <p className="text-xs text-gray-400">
                  {selectedCandidate.department} · {selectedCandidate.year} Batch · CGPA: {selectedCandidate.cgpa}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Role Match</span>
                <span className="text-2xl font-black text-emerald-400">{selectedCandidate.match_score}%</span>
              </div>
            </div>

            {/* Top Verified Skills */}
            <div>
              <h5 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Demonstrated & Verified Proficiencies
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {selectedCandidate.top_verified_skills.map((ts, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-gray-900 border border-gray-800 flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{ts.name}</span>
                    <span className="font-bold text-emerald-400">{ts.score}% (🟢 Verified)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Gaps for this Role */}
            {selectedCandidate.critical_gaps.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Identified Deficiencies for this Blueprint:</span>
                </div>
                <p className="text-gray-300">
                  {selectedCandidate.critical_gaps.join(', ')} fall below required benchmark thresholds.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
              <button
                onClick={() => {
                  toggleShortlist(selectedCandidate.student_id);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCandidate.is_shortlisted
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${selectedCandidate.is_shortlisted ? 'fill-amber-400' : ''}`} />
                <span>{selectedCandidate.is_shortlisted ? 'Shortlisted Candidate ✓' : 'Shortlist Candidate'}</span>
              </button>

              {onInspectStudentDna && (
                <button
                  onClick={() => {
                    const sid = selectedCandidate.student_id;
                    setSelectedCandidate(null);
                    onInspectStudentDna(sid);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
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
