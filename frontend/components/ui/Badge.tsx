import React from 'react';
import { VerificationStatus, ProficiencyBand } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'verified' | 'self_declared' | 'gap' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  
  const variantClasses = {
    verified: 'bg-[#EDF3EE] text-[#24482B] border border-[#CFDEC2]',
    self_declared: 'bg-[#FBF6EC] text-[#8A5C1E] border border-[#E9DFCE]',
    gap: 'bg-[#FDF1EE] text-[#B0432E] border border-[#F4CDC4]',
    success: 'bg-[#EDF3EE] text-[#24482B] border border-[#CFDEC2]',
    warning: 'bg-[#FBF6EC] text-[#8A5C1E] border border-[#E9DFCE]',
    danger: 'bg-[#FDF1EE] text-[#B0432E] border border-[#F4CDC4]',
    info: 'bg-[#F2EFE9] text-[#44403C] border border-[#DDD6CA]',
    neutral: 'bg-[#FAF8F5] text-[#57534E] border border-[#E7E2D9]'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-tight ${sizeClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: VerificationStatus | string }) {
  if (status === 'verified') {
    return (
      <Badge variant="verified">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4E6554] inline-block"></span>
        Verified Evidence
      </Badge>
    );
  }
  if (status === 'self_declared') {
    return (
      <Badge variant="self_declared">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B47D1C] inline-block"></span>
        Self-Declared
      </Badge>
    );
  }
  return (
    <Badge variant="gap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#D46238] inline-block"></span>
      Skill Gap
    </Badge>
  );
}

export function ReadinessBandBadge({ band }: { band: string }) {
  if (band.toLowerCase().includes('ready')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF3EE] text-[#24482B] border border-[#CFDEC2]">
        <span className="w-2 h-2 rounded-full bg-[#4E6554]"></span>
        Industry Ready (≥75%)
      </span>
    );
  }
  if (band.toLowerCase().includes('needs') || band.toLowerCase().includes('development')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FBF6EC] text-[#8A5C1E] border border-[#E9DFCE]">
        <span className="w-2 h-2 rounded-full bg-[#B47D1C]"></span>
        Needs Development (50-74%)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF1EE] text-[#B0432E] border border-[#F4CDC4]">
      <span className="w-2 h-2 rounded-full bg-[#D46238]"></span>
      Critical Gaps (&lt;50%)
    </span>
  );
}
