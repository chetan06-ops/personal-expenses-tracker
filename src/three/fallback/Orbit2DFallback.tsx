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
    <div className={`relative flex flex-col items-center justify-center p-4 ${className}`}>
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* SVG Orbit and Rings */}
        <svg className="w-full h-full" viewBox="0 0 320 320">
          <defs>
            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isHealthy ? '#06B6D4' : '#F43F5E'} stopOpacity="0.8" />
              <stop offset="70%" stopColor={isHealthy ? '#0891B2' : '#E11D48'} stopOpacity="0.4" />
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
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="rgba(6, 182, 212, 0.2)"
            strokeWidth="1.5"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={radius - 35}
            fill="none"
            stroke="rgba(139, 92, 246, 0.15)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          {/* Central Sphere Glow */}
          <circle
            cx={centerX}
            cy={centerY}
            r="42"
            fill="url(#centerGradient)"
            filter="url(#glow)"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="26"
            fill={isHealthy ? '#06B6D4' : '#F43F5E'}
            opacity="0.9"
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
              >
                {/* Connecting subtle line */}
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={cat.color}
                  strokeWidth="1"
                  strokeOpacity={isHovered ? '0.6' : '0.15'}
                  strokeDasharray="2 2"
                />
                {/* Node outer pulse */}
                <circle
                  cx={x}
                  cy={y}
                  r={nodeRadius + 4}
                  fill={cat.color}
                  opacity={isHovered ? '0.4' : '0.15'}
                />
                {/* Main Node */}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            {activeCategory ? activeCategory.category : 'Net Balance'}
          </span>
          <span className="text-sm font-bold text-white font-mono mt-0.5">
            {activeCategory
              ? formatINR(activeCategory.amount)
              : formatINR(netBalance)}
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">
            {activeCategory ? `${activeCategory.percentage}% of spend` : isHealthy ? 'Surplus' : 'Deficit'}
          </span>
        </div>
      </div>

      {/* Orbit Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2 max-w-sm">
        {topCategories.length === 0 ? (
          <span className="text-xs text-slate-500">No category transactions yet</span>
        ) : (
          topCategories.map((c) => (
            <div
              key={c.category}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs cursor-pointer transition-colors ${
                activeCategory?.category === c.category
                  ? 'bg-slate-800 text-white ring-1 ring-cyan-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onMouseEnter={() => setActiveCategory(c)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="font-medium text-[11px]">{c.category}</span>
              <span className="text-[10px] text-slate-500">({c.percentage}%)</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
