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
      <div className="bg-white p-12 rounded-2xl border border-[#E7E2D9] text-center shadow-xs">
        <Building2 className="w-8 h-8 text-[#D46238] mx-auto animate-pulse mb-3" />
        <p className="text-sm font-medium text-[#78716C]">Loading Institution & Batch Analytics...</p>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Controls (FR-37) */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-[#E7E2D9]">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#D46238]" />
              <h3 className="text-xl font-bold text-[#18181B]">Academia & Institution Analytics</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#FAF8F5] text-[#18181B] font-mono border border-[#E7E2D9]">
                Cohort View
              </span>
            </div>
            <p className="text-xs text-[#78716C] mt-1">
              Batch-level placement readiness intelligence, common curriculum skill gaps, and intervention impact tracking.
            </p>
          </div>

          {/* Department and Year Filters (FR-37) */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD6CA] text-xs">
              <Filter className="w-3.5 h-3.5 text-[#78716C]" />
              <span className="text-[#78716C] font-mono">Dept:</span>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="bg-transparent text-[#18181B] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                {analytics.departments.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD6CA] text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#78716C]" />
              <span className="text-[#78716C] font-mono">Batch:</span>
              <select
                value={year}
                onChange={e => setYear(parseInt(e.target.value, 10))}
                className="bg-transparent text-[#18181B] font-semibold focus:outline-none cursor-pointer"
              >
                <option value={0}>All Years</option>
                <option value={2026}>2026 Batch</option>
                <option value={2025}>2025 Batch</option>
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
            icon={<Users className="w-5 h-5 text-[#D46238]" />}
          />

          {analytics.readiness_distribution.map((dist, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-[#E7E2D9] flex flex-col justify-between shadow-xs"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-mono font-medium text-[#78716C] uppercase tracking-wider">
                  {dist.band}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: dist.color }}
                />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#18181B] tracking-tight">{dist.count}</span>
                  <span className="text-xs font-mono font-semibold text-[#78716C]">({dist.percentage}%)</span>
                </div>
                <div className="mt-2.5">
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
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#E7E2D9]">
          <div>
            <h4 className="text-base font-bold text-[#18181B] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D46238]" />
              Common Skill-Gap Ranking Across Batch
            </h4>
            <p className="text-xs text-[#78716C] mt-0.5">
              Ranked by % of students falling below industry threshold. Guides targeted training interventions.
            </p>
          </div>
          <span className="text-xs text-[#78716C] font-mono">
            Total Skills Tracked: <strong className="text-[#18181B]">{analytics.common_skill_gaps.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E7E2D9]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#78716C] border-b border-[#E7E2D9] font-semibold font-mono">
              <tr>
                <th className="py-2.5 px-4">Rank</th>
                <th className="py-2.5 px-4">Skill</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Cohort Deficit %</th>
                <th className="py-2.5 px-4">Students Below Benchmark</th>
                <th className="py-2.5 px-4">Batch Average</th>
                <th className="py-2.5 px-4">Industry Demand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D9] text-[#18181B]">
              {analytics.common_skill_gaps.map((gap, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F5]/60">
                  <td className="py-2.5 px-4 font-mono font-bold text-[#78716C]">#{idx + 1}</td>
                  <td className="py-2.5 px-4 font-bold text-[#18181B]">{gap.skill_name}</td>
                  <td className="py-2.5 px-4 text-[#78716C]">{gap.category}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold font-mono ${gap.gap_percentage >= 50 ? 'text-[#B0432E]' : 'text-[#8A5C1E]'}`}>
                        {gap.gap_percentage}%
                      </span>
                      <div className="w-16">
                        <ProgressBar value={gap.gap_percentage} showLabel={false} height="sm" color={gap.gap_percentage >= 50 ? 'rose' : 'amber'} />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-[#57534E]">
                    {gap.students_below_threshold_count} / {gap.total_students} students
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-[#18181B]">
                    {gap.average_score}%
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-[#D46238]">
                    {gap.industry_demand_score}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassessment Trend After Intervention (FR-38) */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-[#24482B]">
          <TrendingUp className="w-5 h-5 flex-shrink-0" />
          <span>Intervention Effectiveness & Reassessment Trends</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] space-y-1">
            <span className="text-xs text-[#78716C]">Avg Skill-Score Gain Post-Training</span>
            <span className="text-2xl font-black text-[#24482B] block">
              +{analytics.reassessment_improvement.average_improvement}%
            </span>
            <p className="text-[11px] text-[#78716C] mt-1">Measured across student re-assessments</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] space-y-1">
            <span className="text-xs text-[#78716C]">Critical Gap Reduction Share</span>
            <span className="text-2xl font-black text-[#18181B] block">
              {analytics.reassessment_improvement.gap_reduction_rate}
            </span>
            <p className="text-[11px] text-[#78716C] mt-1">Students moving from Critical to Ready band</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] space-y-1">
            <span className="text-xs text-[#78716C]">Students Completing Re-Test</span>
            <span className="text-2xl font-black text-[#D46238] block font-mono">
              {analytics.reassessment_improvement.students_reassessed} / {analytics.total_students}
            </span>
            <p className="text-[11px] text-[#78716C] mt-1">Active participation in improvement loop</p>
          </div>
        </div>

        {/* Milestone Progression Table */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] mt-2">
          <h5 className="text-xs font-mono font-bold text-[#78716C] uppercase tracking-wider mb-2">
            Intervention Milestone Benchmarks
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[#78716C] border-b border-[#E7E2D9]">
                <tr>
                  <th className="py-2 px-3 font-sans">Milestone Phase</th>
                  <th className="py-2 px-3">DSA Avg</th>
                  <th className="py-2 px-3">Java Avg</th>
                  <th className="py-2 px-3">SQL Avg</th>
                  <th className="py-2 px-3">Role Match Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2D9] text-[#18181B]">
                {analytics.reassessment_improvement.sample_trend?.map((tr, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-sans font-bold text-[#18181B]">{tr.milestone}</td>
                    <td className="py-2 px-3">{tr.DSA}%</td>
                    <td className="py-2 px-3">{tr.Java}%</td>
                    <td className="py-2 px-3">{tr.SQL}%</td>
                    <td className="py-2 px-3 font-bold text-[#24482B]">{tr.Match}%</td>
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
