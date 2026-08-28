import React from 'react';
import { Sparkles, Clock, CheckCircle, Flame } from 'lucide-react';

interface FreshnessBadgeProps {
  freshness: string;
  className?: string;
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({ freshness, className = '' }) => {
  const isToday = freshness.toLowerCase().includes('today') || freshness.toLowerCase().includes('4h');
  const isOrganic = freshness.toLowerCase().includes('organic') || freshness.toLowerCase().includes('grade a');

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
        isToday
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : isOrganic
          ? 'bg-amber-50 text-amber-900 border-amber-200'
          : 'bg-stone-100 text-stone-700 border-stone-200'
      } ${className}`}
    >
      {isToday ? (
        <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
      ) : isOrganic ? (
        <Flame className="w-3 h-3 text-amber-600" />
      ) : (
        <Clock className="w-3 h-3 text-stone-500" />
      )}
      <span>{freshness}</span>
    </span>
  );
};
