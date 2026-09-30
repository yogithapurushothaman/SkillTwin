'use client';

import React, { useState } from 'react';
import { IndustryRole } from '@/types';
import { apiService } from '@/services/api';
import { Modal } from '@/components/ui/Modal';
import { 
  Target, 
  Copy, 
  Plus, 
  Building, 
  Briefcase, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';

interface BlueprintViewerProps {
  blueprints: IndustryRole[];
  selectedRoleId: number | null;
  onSelectRole: (roleId: number) => void;
  onRefreshBlueprints?: () => void;
}

export function BlueprintViewer({
  blueprints,
  selectedRoleId,
  onSelectRole,
  onRefreshBlueprints
}: BlueprintViewerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [roleSkillsInput, setRoleSkillsInput] = useState([
    { skill_name: 'Java', required_score: 70, weight: 1.2 },
    { skill_name: 'DSA', required_score: 65, weight: 1.4 },
    { skill_name: 'SQL', required_score: 60, weight: 1.0 },
    { skill_name: 'Git', required_score: 50, weight: 0.8 },
    { skill_name: 'Communication', required_score: 60, weight: 0.9 },
  ]);

  const activeRole = blueprints.find(b => b.id === selectedRoleId) || blueprints[0];

  const handleClone = async () => {
    if (!activeRole) return;
    try {
      setIsCloning(true);
      const cloned = await apiService.cloneBlueprint(activeRole.id);
      if (onRefreshBlueprints) onRefreshBlueprints();
      onSelectRole(cloned.id);
    } catch (err: any) {
      alert('Failed to clone role: ' + err.message);
    } finally {
      setIsCloning(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newCompany.trim()) {
      alert('Please enter role title and company name');
      return;
    }
    try {
      const created = await apiService.createBlueprint({
        title: newTitle,
        company: newCompany,
        description: newDescription,
        skills: roleSkillsInput
      });
      setIsCreateOpen(false);
      setNewTitle('');
      setNewCompany('');
      setNewDescription('');
      if (onRefreshBlueprints) onRefreshBlueprints();
      onSelectRole(created.id);
    } catch (err: any) {
      alert('Failed to create role blueprint: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Card */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-[#E7E2D9]">
          <div>
            <h3 className="text-xl font-bold text-[#18181B] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#D46238]" />
              Industry Skill Blueprints
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              Explicit target proficiency benchmarks defined by hiring companies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClone}
              disabled={isCloning || !activeRole}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDD6CA] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#18181B] transition-colors cursor-pointer shadow-xs"
            >
              <Copy className="w-3.5 h-3.5 text-[#78716C]" />
              <span>Clone Role</span>
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#2E2E33] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Define New Blueprint</span>
            </button>
          </div>
        </div>

        {/* Available Blueprint Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
          {blueprints.map(role => {
            const isSelected = selectedRoleId === role.id;
            return (
              <div
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#FAF8F5] border-[#18181B] ring-1 ring-[#18181B] shadow-sm'
                    : 'bg-white border-[#E7E2D9] hover:border-[#DDD6CA] hover:bg-[#FAF8F5]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-[#78716C] flex items-center gap-1">
                      <Building className="w-3 h-3 text-[#D46238]" />
                      {role.company}
                    </span>
                    {role.is_seed && (
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#24482B] border border-[#CFDEC2]">
                        Seed
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[#18181B] mb-2">{role.title}</h4>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#78716C] pt-2 border-t border-[#E7E2D9]">
                  <span className="font-mono">{role.skills.length} Required Skills</span>
                  {isSelected && <span className="text-[#D46238] font-bold">Active ✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Blueprint Detail Table */}
      {activeRole && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E2D9] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#E7E2D9] gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-[#18181B]">{activeRole.title}</h4>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E7E2D9] text-[#78716C] font-mono">
                  {activeRole.company}
                </span>
              </div>
              <p className="text-xs text-[#78716C] mt-1">{activeRole.description}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E7E2D9]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#78716C] border-b border-[#E7E2D9] font-semibold font-mono">
                <tr>
                  <th className="py-2.5 px-4">Skill Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Required Benchmark</th>
                  <th className="py-2.5 px-4">Importance Weight</th>
                  <th className="py-2.5 px-4">Target Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2D9] text-[#18181B]">
                {activeRole.skills.map((rs, i) => (
                  <tr key={i} className="hover:bg-[#FAF8F5]/60">
                    <td className="py-2.5 px-4 font-bold text-[#18181B]">{rs.skill_name}</td>
                    <td className="py-2.5 px-4 text-[#78716C]">{rs.category}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#D46238]">{rs.required_score}%</td>
                    <td className="py-2.5 px-4 font-mono text-[#57534E]">{rs.weight}x</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E7E2D9] text-[#57534E] text-[11px] font-medium font-mono">
                        {rs.required_score >= 75 ? 'Advanced (≥75)' : rs.required_score >= 50 ? 'Intermediate (50–74)' : 'Basic'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Blueprint Modal (FR-14) */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Define New Industry Skill Blueprint"
        subtitle="Specify required skills and score thresholds for candidate matching"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#18181B] block mb-1">Role Title</label>
            <input
              type="text"
              placeholder="e.g. Backend Platform Engineer"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D9] text-[#18181B] text-xs focus:outline-none focus:border-[#18181B] focus:bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#18181B] block mb-1">Company Name</label>
            <input
              type="text"
              placeholder="e.g. Stripe, Razorpay, Amazon"
              value={newCompany}
              onChange={e => setNewCompany(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D9] text-[#18181B] text-xs focus:outline-none focus:border-[#18181B] focus:bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#18181B] block mb-1">Role Description</label>
            <textarea
              rows={2}
              placeholder="Responsibilities, stack overview..."
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D9] text-[#18181B] text-xs focus:outline-none focus:border-[#18181B] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#18181B] block mb-2">Required Skills & Scores</label>
            <div className="space-y-2">
              {roleSkillsInput.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.skill_name}
                    onChange={e => {
                      const copy = [...roleSkillsInput];
                      copy[idx].skill_name = e.target.value;
                      setRoleSkillsInput(copy);
                    }}
                    className="flex-1 p-2 rounded-lg bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#18181B]"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#78716C] font-mono">Score:</span>
                    <input
                      type="number"
                      value={item.required_score}
                      onChange={e => {
                        const copy = [...roleSkillsInput];
                        copy[idx].required_score = parseFloat(e.target.value) || 0;
                        setRoleSkillsInput(copy);
                      }}
                      className="w-16 p-2 rounded-lg bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#18181B] text-center font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7E2D9] flex justify-end gap-2">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#78716C] hover:text-[#18181B] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-5 py-2 rounded-lg bg-[#18181B] hover:bg-[#2E2E33] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              Save Blueprint
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
