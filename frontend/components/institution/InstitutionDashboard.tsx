'use client';

import React from 'react';
import { useInstitutionAnalytics } from '@/hooks/useInstitutionAnalytics';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/ui/StatCard';
import { 
  Building2, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Filter, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

export function InstitutionDashboard() {
  const {
    analytics,
    department,
    setDepartment,
    year,
    setYear,
    loading,
    error,
    refreshAnalytics
  } = useInstitutionAnalytics();

  if (loading && !analytics) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-gray-800 text-center">
        <Building2 className="w-8 h-8 text-indigo-400 mx-auto animate-pulse mb-3" />
        <p className="text-sm text-gray-400">Loading Institution & Batch Analytics...</p>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Controls (FR-37) */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Academia & Institution Analytics</h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                FR-35 & FR-36
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Batch-level placement readiness intelligence, common curriculum skill gaps, and intervention impact tracking.
            </p>
          </div>

          {/* Department and Year Filters (FR-37) */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-400">Dept:</span>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-gray-900">All Departments</option>
                {analytics.departments.map((d, i) => (
                  <option key={i} value={d} className="bg-gray-900">{d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-xs">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-400">Batch:</span>
              <select
                value={year}
                onChange={e => setYear(parseInt(e.target.value, 10))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value={0} className="bg-gray-900">All Years</option>
                <option value={2026} className="bg-gray-900">2026 Batch</option>
                <option value={2025} className="bg-gray-900">2025 Batch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batch Overview Cards (FR-35) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <StatCard
            title="Total Students in Cohort"
            value={analytics.total_students}
            subtitle="Analyzed via verified Skill DNA"
            icon={<Users className="w-5 h-5 text-indigo-400" />}
          />

          {analytics.readiness_distribution.map((dist, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {dist.band}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: dist.color }}
                />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white tracking-tight">{dist.count}</span>
                  <span className="text-xs font-semibold text-gray-400">({dist.percentage}%)</span>
                </div>
                <div className="mt-2">
                  <ProgressBar
                    value={dist.percentage}
                    showLabel={false}
                    height="sm"
                    color={idx === 0 ? 'emerald' : idx === 1 ? 'amber' : 'rose'}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common Skill-Gap Ranking across the Batch (FR-36) */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-800">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Common Skill-Gap Ranking Across Batch
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Ranked by % of students falling below industry threshold. Guides targeted training interventions.
            </p>
          </div>
          <span className="text-xs text-gray-400">
            Total Skills Tracked: <strong className="text-white">{analytics.common_skill_gaps.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-800/60 text-gray-400 border-b border-gray-800 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Rank</th>
                <th className="py-2.5 px-4">Skill</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Cohort Deficit %</th>
                <th className="py-2.5 px-4">Students Below Benchmark</th>
                <th className="py-2.5 px-4">Batch Average Score</th>
                <th className="py-2.5 px-4">Target Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {analytics.common_skill_gaps.map((gap, idx) => (
                <tr key={idx} className="hover:bg-gray-800/30">
                  <td className="py-2.5 px-4 font-mono font-bold text-gray-400">#{idx + 1}</td>
                  <td className="py-2.5 px-4 font-bold text-white">{gap.skill_name}</td>
                  <td className="py-2.5 px-4 text-gray-400">{gap.category}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${gap.gap_percentage >= 50 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {gap.gap_percentage}%
                      </span>
                      <div className="w-16">
                        <ProgressBar value={gap.gap_percentage} showLabel={false} height="sm" color={gap.gap_percentage >= 50 ? 'rose' : 'amber'} />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    {gap.students_below_threshold_count} / {gap.total_students} students
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-white">
                    {gap.average_score}%
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-indigo-400">
                    {gap.industry_demand_score}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassessment Trend After Intervention (FR-38) */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
          <TrendingUp className="w-5 h-5 flex-shrink-0" />
          <span>Intervention Effectiveness & Reassessment Trends (FR-38)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400">Avg Skill-Score Gain Post-Training</span>
            <span className="text-2xl font-black text-emerald-400">
              +{analytics.reassessment_improvement.average_improvement}%
            </span>
            <p className="text-[11px] text-gray-400 mt-1">Measured across student re-assessments</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400">Critical Gap Reduction Share</span>
            <span className="text-2xl font-black text-cyan-400">
              {analytics.reassessment_improvement.gap_reduction_rate}
            </span>
            <p className="text-[11px] text-gray-400 mt-1">Students moving from Critical to Ready band</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400">Students Completing Re-Test</span>
            <span className="text-2xl font-black text-indigo-400">
              {analytics.reassessment_improvement.students_reassessed} / {analytics.total_students}
            </span>
            <p className="text-[11px] text-gray-400 mt-1">Active participation in improvement loop</p>
          </div>
        </div>

        {/* Milestone Progression Table */}
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 mt-2">
          <h5 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Intervention Milestone Benchmarks
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-2 px-3 font-sans">Milestone Phase</th>
                  <th className="py-2 px-3">DSA Avg</th>
                  <th className="py-2 px-3">Java Avg</th>
                  <th className="py-2 px-3">SQL Avg</th>
                  <th className="py-2 px-3">Role Match Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {analytics.reassessment_improvement.sample_trend?.map((tr, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-sans font-bold text-white">{tr.milestone}</td>
                    <td className="py-2 px-3">{tr.DSA}%</td>
                    <td className="py-2 px-3">{tr.Java}%</td>
                    <td className="py-2 px-3">{tr.SQL}%</td>
                    <td className="py-2 px-3 font-bold text-emerald-400">{tr.Match}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
