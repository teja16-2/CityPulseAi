import React from 'react';
import { AlertCircle, CheckCircle, Clock, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CityStats } from '../types';

interface StatCardProps {
  stats: CityStats;
  onFilterSeverity?: (severity: string) => void;
}

export const StatCard: React.FC<StatCardProps> = ({ stats, onFilterSeverity }) => {
  const cards = [
    {
      id: 'active',
      title: 'Total Active Incidents',
      value: stats.totalActiveIncidents.toString(),
      trend: '+4.2% vs yesterday',
      trendUp: true,
      color: 'blue',
      icon: <Activity className="w-5 h-5 text-blue-400" />,
      accentBorder: 'border-blue-500/30',
      badgeBg: 'bg-blue-500/10 text-blue-400',
    },
    {
      id: 'critical',
      title: 'Critical Incidents',
      value: stats.criticalIncidents.toString(),
      trend: '-2 since 08:00',
      trendUp: false,
      color: 'red',
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      accentBorder: 'border-red-500/30',
      badgeBg: 'bg-red-500/10 text-red-400',
      clickable: true,
      onClick: () => onFilterSeverity && onFilterSeverity('Critical'),
    },
    {
      id: 'resolved',
      title: 'Resolved Today',
      value: stats.resolvedToday.toString(),
      trend: '+18% vs target',
      trendUp: true,
      color: 'emerald',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      accentBorder: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      id: 'response',
      title: 'Avg Response Time',
      value: `${stats.avgResponseTimeMin} mins`,
      trend: '-3m faster today',
      trendUp: false,
      color: 'amber',
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      accentBorder: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/10 text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={card.onClick}
          className={`bg-[#131F33] border ${card.accentBorder} rounded-xl p-4.5 transition-all duration-200 relative overflow-hidden group ${
            card.clickable ? 'cursor-pointer hover:border-red-500 hover:shadow-lg hover:shadow-red-950/20' : ''
          }`}
        >
          {/* Subtle glow highlight */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{card.title}</span>
            <div className="w-8 h-8 rounded-lg bg-[#0D1728] border border-[#1E2D4A] flex items-center justify-center">
              {card.icon}
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-[#F8FAFC] tabular-nums">
              {card.value}
            </span>
            <div className="flex items-center text-[11px] text-slate-400 font-mono gap-0.5">
              {card.trendUp ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{card.trend}</span>
            </div>
          </div>

          {/* Demonstration Notice */}
          <div className="mt-3 pt-2.5 border-t border-[#1E2D4A]/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Greater Noida Ward Grid</span>
            <span className="text-slate-500 bg-[#0A1220] px-1.5 py-0.5 rounded border border-[#1E2D4A]/50">
              Simulated Data
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
