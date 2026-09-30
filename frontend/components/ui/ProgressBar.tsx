import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  benchmark?: number; // Optional benchmark line
  showLabel?: boolean;
  color?: 'emerald' | 'indigo' | 'amber' | 'rose' | 'auto';
  height?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  benchmark,
  showLabel = true,
  color = 'auto',
  height = 'md'
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  let colorClasses = 'bg-[#18181B]';
  if (color === 'emerald' || (color === 'auto' && clamped >= 75)) {
    colorClasses = 'bg-[#4E6554]';
  } else if (color === 'amber' || (color === 'auto' && clamped >= 50)) {
    colorClasses = 'bg-[#B47D1C]';
  } else if (color === 'rose' || (color === 'auto' && clamped < 50)) {
    colorClasses = 'bg-[#D46238]';
  } else if (color === 'indigo') {
    colorClasses = 'bg-[#18181B]';
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  }[height];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="font-semibold text-[#18181B]">{clamped}%</span>
          {benchmark !== undefined && (
            <span className="text-[#78716C] text-[11px] font-mono">
              Target: <strong className="text-[#D46238]">{benchmark}%</strong>
            </span>
          )}
        </div>
      )}
      <div className={`relative w-full bg-[#EAE4D9] rounded-full overflow-hidden border border-[#DDD6CA]/60 ${heightClasses}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses}`}
          style={{ width: `${clamped}%` }}
        />
        {benchmark !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#D46238] z-10"
            style={{ left: `${Math.max(0, Math.min(100, benchmark))}%` }}
            title={`Required: ${benchmark}%`}
          />
        )}
      </div>
    </div>
  );
}
