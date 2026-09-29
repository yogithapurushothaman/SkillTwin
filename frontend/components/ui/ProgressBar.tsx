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

  let colorClasses = 'bg-gradient-to-r from-indigo-500 to-cyan-400';
  if (color === 'emerald' || (color === 'auto' && clamped >= 75)) {
    colorClasses = 'bg-gradient-to-r from-emerald-500 to-teal-400';
  } else if (color === 'amber' || (color === 'auto' && clamped >= 50)) {
    colorClasses = 'bg-gradient-to-r from-amber-500 to-orange-400';
  } else if (color === 'rose' || (color === 'auto' && clamped < 50)) {
    colorClasses = 'bg-gradient-to-r from-rose-500 to-red-400';
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }[height];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="font-medium text-gray-300">{clamped}%</span>
          {benchmark !== undefined && (
            <span className="text-gray-400 text-[11px]">
              Benchmark: <strong className="text-indigo-400">{benchmark}%</strong>
            </span>
          )}
        </div>
      )}
      <div className={`relative w-full bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/50 ${heightClasses}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses}`}
          style={{ width: `${clamped}%` }}
        />
        {benchmark !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10 shadow-sm"
            style={{ left: `${Math.max(0, Math.min(100, benchmark))}%` }}
            title={`Required: ${benchmark}%`}
          />
        )}
      </div>
    </div>
  );
}
