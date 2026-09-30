import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  trend,
  className = ''
}: StatCardProps) {
  return (
    <div className={`bg-white p-5 rounded-2xl border border-[#E7E2D9] shadow-sm flex flex-col justify-between transition-all hover:border-[#DDD6CA] hover:shadow-md ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[11px] font-mono font-medium uppercase tracking-[0.16em] text-[#78716C]">{title}</span>
        {icon && <div className="text-[#57534E] p-2 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9]">{icon}</div>}
      </div>
      <div>
        <div className="flex items-baseline gap-2.5">
          <span className="text-3xl font-extrabold text-[#18181B] tracking-tight">{value}</span>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-[#78716C] mt-1 leading-relaxed">{subtitle}</p>}
        {trend && (
          <div className="mt-2.5 flex items-center text-xs">
            <span className={trend.isPositive ? 'text-[#24482B] font-semibold bg-[#EDF3EE] px-1.5 py-0.5 rounded border border-[#CFDEC2]' : 'text-[#B0432E] font-semibold bg-[#FDF1EE] px-1.5 py-0.5 rounded border border-[#F4CDC4]'}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-[#78716C] ml-2 text-[11px]">vs cohort benchmark</span>
          </div>
        )}
      </div>
    </div>
  );
}
