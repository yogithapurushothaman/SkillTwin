'use client';

import React from 'react';
import { User, UserRole } from '@/types';
import { 
  Dna, 
  Sparkles, 
  UserCircle, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  ChevronDown 
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  personas: User[];
  onSwitchPersona: (userId: number) => void;
  onOpenTour: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Navbar({
  currentUser,
  personas,
  onSwitchPersona,
  onOpenTour,
  activeTab,
  onTabChange
}: NavbarProps) {
  const role = currentUser?.role || 'student';

  const studentTabs = [
    { id: 'dna', label: '🧬 Skill DNA & Evidence' },
    { id: 'resume', label: '📄 Resume & Claim' },
    { id: 'blueprint', label: '🎯 Role Blueprints' },
    { id: 'gaps', label: '🔍 Gap Engine' },
    { id: 'assessment', label: '📝 Adaptive Assessment' },
    { id: 'tech_interview', label: '💻 Technical Interview' },
    { id: 'hr_interview', label: '🤝 HR & Soft Skills' },
    { id: 'readiness', label: '🏆 Placement Readiness' },
    { id: 'history', label: '📈 Improvement Loop' },
  ];

  const academicianTabs = [
    { id: 'institution', label: '🏛️ Batch Readiness & Analytics' },
    { id: 'common_gaps', label: '📊 Common Skill Gaps' },
    { id: 'interventions', label: '💡 Curriculum Interventions' },
    { id: 'dna', label: '👤 Student DNA Inspector' },
  ];

  const industryTabs = [
    { id: 'industry', label: '💼 Recruiter Talent Discovery' },
    { id: 'blueprints_manage', label: '🎯 Role Blueprints' },
    { id: 'dna', label: '🔍 Candidate Evidence Deep Dive' },
  ];

  const currentTabs = 
    role === 'student' 
      ? studentTabs 
      : (role === 'academician' || role === 'admin') 
      ? academicianTabs 
      : industryTabs;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-800/80 backdrop-blur-md">
      {/* Top Banner & Persona Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
                <Dna className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">SkillTwin</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  MVP 1.0
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Evidence-Backed Skill Intelligence</p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Guided Tour Trigger */}
            <button
              onClick={onOpenTour}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md border border-indigo-400/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Demo Tour (8 Steps)</span>
            </button>

            {/* Persona Switcher Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900/90 border border-gray-700/80 hover:border-indigo-500/50 transition-all cursor-pointer">
                <UserCircle className="w-4 h-4 text-indigo-400" />
                <div className="text-left text-xs">
                  <div className="font-semibold text-white truncate max-w-[130px]">
                    {currentUser?.name || 'Select Persona'}
                  </div>
                  <div className="text-[10px] text-gray-400 capitalize">
                    {currentUser?.role || 'Guest'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl p-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Switch Active Persona (FR-2)
                </div>
                <div className="space-y-1 mt-1">
                  {personas.map(p => (
                    <button
                      key={p.id}
                      onClick={() => onSwitchPersona(p.id)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start gap-2.5 ${
                        currentUser?.id === p.id
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <div className="mt-0.5">
                        {p.role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />}
                        {p.role === 'academician' && <Building2 className="w-3.5 h-3.5 text-purple-400" />}
                        {p.role === 'industry' && <Briefcase className="w-3.5 h-3.5 text-amber-400" />}
                        {p.role === 'admin' && <UserCircle className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div>
                        <div className="font-semibold leading-tight">{p.name}</div>
                        <div className="text-[10px] text-gray-400 capitalize">{p.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-t border-gray-800/40 pt-2">
          {currentTabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
