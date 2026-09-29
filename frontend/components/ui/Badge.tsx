import React from 'react';
import { VerificationStatus, ProficiencyBand } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'verified' | 'self_declared' | 'gap' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  
  const variantClasses = {
    verified: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    self_declared: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    gap: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    info: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    neutral: 'bg-gray-800 text-gray-300 border border-gray-700'
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: VerificationStatus | string }) {
  if (status === 'verified') {
    return (
      <Badge variant="verified">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
        Verified Evidence
      </Badge>
    );
  }
  if (status === 'self_declared') {
    return (
      <Badge variant="self_declared">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
        Self-Declared
      </Badge>
    );
  }
  return (
    <Badge variant="gap">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block"></span>
      Skill Gap
    </Badge>
  );
}

export function ReadinessBandBadge({ band }: { band: string }) {
  if (band.toLowerCase().includes('ready')) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
        🟢 Industry Ready (≥75%)
      </span>
    );
  }
  if (band.toLowerCase().includes('development')) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">
        🟡 Needs Development (50–74%)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/40">
      🔴 Critical Gaps (&lt;50%)
    </span>
  );
}
