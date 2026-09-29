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
    <div className={`glass-panel p-5 rounded-xl border border-gray-800 flex flex-col justify-between ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">{title}</span>
        {icon && <div className="text-gray-400 p-2 rounded-lg bg-gray-800/60 border border-gray-700/40">{icon}</div>}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            <span className={trend.isPositive ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-gray-400 ml-1.5">vs baseline</span>
          </div>
        )}
      </div>
    </div>
  );
}
