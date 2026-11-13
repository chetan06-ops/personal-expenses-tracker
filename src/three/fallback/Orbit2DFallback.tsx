import React, { useState } from 'react';
import { CategoryBreakdownItem } from '../../types';
import { formatINR } from '../../utils/currency';

interface Orbit2DFallbackProps {
  netBalance: number;
  totalExpenses: number;
  categoryBreakdown: CategoryBreakdownItem[];
  className?: string;
}

export const Orbit2DFallback: React.FC<Orbit2DFallbackProps> = ({
  netBalance,
  totalExpenses,
  categoryBreakdown,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryBreakdownItem | null>(null);

  const topCategories = categoryBreakdown.slice(0, 6);
  const isHealthy = netBalance >= 0;

  // Orbit radius
  const radius = 100;
  const centerX = 160;
  const centerY = 160;

  return (
    <div className={`relative flex flex-col items-center justify-center p-2 sm:p-4 ${className}`}>
      <div className="relative w-full max-w-[290px] sm:max-w-[320px] aspect-square flex items-center justify-center">
        {/* SVG Orbit and Rings */}
        <svg className="w-full h-full" viewBox="0 0 320 320" role="img" aria-label="2D Financial Orbit Visualization">
          <defs>
            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isHealthy ? '#06B6D4' : '#F43F5E'} stopOpacity="0.8" />
              <stop offset="70%" stopColor={isHealthy ? '#0891B2' : '#E11D48'} stopOpacity="0.35" />
              <stop offset="100%" stopColor={isHealthy ? '#0E7490' : '#BE123C'} stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ambient Outer Rings */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius + 35}
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="rgba(6, 182, 212, 0.24)"
            strokeWidth="1.5"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={radius - 35}
            fill="none"
            stroke="rgba(139, 92, 246, 0.18)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          {/* Central Sphere Glow */}
          <circle
            cx={centerX}
            cy={centerY}
            r="44"
            fill="url(#centerGradient)"
            filter="url(#glow)"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="34"
            fill="#0D131F"
            stroke={isHealthy ? '#06B6D4' : '#F43F5E'}
            strokeWidth="2"
          />

          {/* Orbiting Category Nodes */}
          {topCategories.map((cat, i) => {
            const angle = (i * 2 * Math.PI) / topCategories.length - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const nodeRadius = Math.max(10, Math.min(20, 10 + (cat.percentage / 100) * 16));
            const isHovered = activeCategory?.category === cat.category;

            return (
              <g
                key={cat.category}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setActiveCategory(cat)}
                onMouseLeave={() => setActiveCategory(null)}
                onClick={() =>
                  setActiveCategory((prev) =>
                    prev?.category === cat.category ? null : cat
                  )
                }
              >
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={cat.color}
                  strokeWidth="1"
                  strokeOpacity={isHovered ? '0.65' : '0.18'}
                  strokeDasharray="2 2"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={nodeRadius + 4}
                  fill={cat.color}
                  opacity={isHovered ? '0.4' : '0.15'}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={nodeRadius}
                  fill={cat.color}
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? '2' : '1'}
                  opacity="0.95"
                />
              </g>
            );
          })}
        </svg>

        {/* Central HTML Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            {activeCategory ? activeCategory.category : 'Net Balance'}
          </span>
          <span className="text-xs sm:text-sm font-bold text-white font-mono tabular-nums mt-0.5">
            {activeCategory
              ? formatINR(activeCategory.amount)
              : formatINR(netBalance)}
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">
            {activeCategory
              ? `${activeCategory.percentage}% of spend`
              : totalExpenses === 0
              ? 'No outflows'
              : isHealthy
              ? 'Surplus'
              : 'Deficit'}
          </span>
        </div>
      </div>

      {/* Orbit Legend */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-2 max-w-md">
        {topCategories.length === 0 ? (
          <span className="text-xs text-slate-500">No category expenses in this period</span>
        ) : (
          topCategories.map((c) => (
            <button
              type="button"
              key={c.category}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs cursor-pointer transition-colors border ${
                activeCategory?.category === c.category
                  ? 'bg-slate-800 text-white border-cyan-500/60'
                  : 'bg-slate-900/60 border-white/[0.06] text-slate-300 hover:text-white'
              }`}
              onMouseEnter={() => setActiveCategory(c)}
              onMouseLeave={() => setActiveCategory(null)}
              onClick={() =>
                setActiveCategory((prev) => (prev?.category === c.category ? null : c))
              }
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="font-medium text-[11px]">{c.category}</span>
              <span className="text-[10px] text-slate-400 font-mono tabular-nums">({c.percentage}%)</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
