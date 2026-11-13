import React from 'react';
import {
  Utensils,
  Car,
  GraduationCap,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Film,
  MoreHorizontal,
  HandCoins,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  Tag,
  Sparkles,
  Home,
  LucideIcon,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Car,
  GraduationCap,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Film,
  MoreHorizontal,
  HandCoins,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  Tag,
  Sparkles,
  Home,
};

export const CategoryIconGlyph: React.FC<{
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ name = 'Tag', className = 'w-4 h-4', style }) => {
  const Icon = ICON_MAP[name] || Tag;
  return <Icon className={className} style={style} aria-hidden="true" />;
};

interface CategoryIconProps {
  name?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name = 'Tag',
  color = '#06B6D4',
  size = 'md',
  className,
}) => {
  const containerSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-10 h-10 rounded-xl',
  };

  const glyphSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0 border',
        containerSizes[size],
        className
      )}
      style={{
        backgroundColor: `${color}1A`,
        borderColor: `${color}38`,
        color,
      }}
      aria-hidden="true"
    >
      <CategoryIconGlyph name={name} className={glyphSizes[size]} />
    </div>
  );
};
