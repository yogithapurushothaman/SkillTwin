'use client';

import React from 'react';
import { User, UserRole } from '@/types';
import { 
  Sparkles, 
  UserCircle, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  ChevronDown,
  ArrowRight
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
    { id: 'dna', label: 'Skill DNA & Evidence' },
    { id: 'resume', label: 'Resume & Claim' },
    { id: 'blueprint', label: 'Role Blueprints' },
    { id: 'gaps', label: 'Gap Engine' },
    { id: 'assessment', label: 'Adaptive Assessment' },
    { id: 'tech_interview', label: 'Technical Interview' },
    { id: 'hr_interview', label: 'HR & Soft Skills' },
    { id: 'readiness', label: 'Placement Readiness' },
    { id: 'history', label: 'Improvement Loop' },
  ];

  const academicianTabs = [
    { id: 'institution', label: 'Batch Readiness & Analytics' },
    { id: 'common_gaps', label: 'Common Skill Gaps' },
    { id: 'interventions', label: 'Curriculum Interventions' },
    { id: 'dna', label: 'Student DNA Inspector' },
  ];

  const industryTabs = [
    { id: 'industry', label: 'Recruiter Talent Discovery' },
    { id: 'blueprints_manage', label: 'Role Blueprints' },
    { id: 'dna', label: 'Candidate Evidence Deep Dive' },
  ];

  const currentTabs = 
    role === 'student' 
      ? studentTabs 
      : (role === 'academician' || role === 'admin') 
      ? academicianTabs 
      : industryTabs;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 border-b border-[#E7E2D9] backdrop-blur-md">
      {/* Top Banner & Persona Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand - Styled after reference: two dots mark + tracked uppercase title */}
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D46238]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#4E6554]"></span>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-sm font-extrabold tracking-[0.18em] uppercase text-[#18181B]">
                SKILLTWIN
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-[#DDD6CA] text-[#78716C] bg-white hidden sm:inline-block">
                Verifiable DNA
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Persona Switcher Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#DDD6CA] hover:border-[#18181B] transition-all cursor-pointer shadow-xs">
                <UserCircle className="w-4 h-4 text-[#78716C]" />
                <div className="text-left text-xs">
                  <div className="font-semibold text-[#18181B] truncate max-w-[130px]">
                    {currentUser?.name || 'Select Persona'}
                  </div>
                  <div className="text-[10px] text-[#78716C] capitalize font-mono">
                    {currentUser?.role || 'Guest'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C] group-hover:text-[#18181B] transition-transform" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl bg-white border border-[#E7E2D9] shadow-xl p-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[#78716C]">
                  Switch Active Persona
                </div>
                <div className="space-y-1 mt-1">
                  {personas.map(p => (
                    <button
                      key={p.id}
                      onClick={() => onSwitchPersona(p.id)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                        currentUser?.id === p.id
                          ? 'bg-[#FAF6F0] text-[#18181B] font-semibold border border-[#E7E2D9]'
                          : 'text-[#57534E] hover:bg-[#FAF8F5] hover:text-[#18181B]'
                      }`}
                    >
                      <div className="mt-0.5">
                        {p.role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-[#4E6554]" />}
                        {p.role === 'academician' && <Building2 className="w-3.5 h-3.5 text-[#8A5C1E]" />}
                        {p.role === 'industry' && <Briefcase className="w-3.5 h-3.5 text-[#D46238]" />}
                        {p.role === 'admin' && <UserCircle className="w-3.5 h-3.5 text-[#18181B]" />}
                      </div>
                      <div>
                        <div className="leading-tight">{p.name}</div>
                        <div className="text-[10px] text-[#78716C] capitalize font-mono">{p.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Guided Tour Trigger - Styled as terracotta action button like "Request Access" in reference */}
            <button
              onClick={onOpenTour}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#D46238] hover:bg-[#BC4E26] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Tour</span>
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2.5 scrollbar-none border-t border-[#E7E2D9] pt-2">
          {currentTabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#18181B] text-white shadow-xs font-semibold'
                    : 'text-[#68645E] hover:text-[#18181B] hover:bg-[#EAE4D9]/60'
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
