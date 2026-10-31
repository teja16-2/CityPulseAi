import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  MOCK_CATEGORY_DISTRIBUTION,
  MOCK_SEVERITY_DISTRIBUTION,
  MOCK_DAILY_TRENDS,
  MOCK_DEPARTMENT_PERFORMANCE,
  MOCK_HOURLY_TRENDS,
} from '../data/mockData';
import { BarChart3, TrendingUp, CheckCircle, Clock, PieChart as PieIcon, ShieldAlert } from 'lucide-react';
import { Incident, DepartmentInfo } from '../types';

export interface AnalyticsProps {
  incidents?: Incident[];
  departments?: DepartmentInfo[];
}

export const AnalyticsPage: React.FC<AnalyticsProps> = () => {
  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0D1728] border border-[#1E2D4A] rounded-lg p-2.5 shadow-xl text-xs">
          <p className="font-semibold text-white mb-1">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="font-mono text-[11px]" style={{ color: entry.color || entry.fill }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Analytics Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">Urban Operations Analytics & SLA Performance</h2>
          <p className="text-xs text-slate-400">
            Real-time and 7-day retrospective operational intelligence for Greater Noida Municipal Corporation
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#131F33] px-3 py-1 rounded-lg border border-[#1E2D4A]">
          <span>Data Cadence: Real-time Telemetry (Simulated)</span>
        </div>
      </div>

      {/* Top 4 Performance Highline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">SLA Resolution Rate</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">94.6%</span>
            <span className="text-[11px] text-emerald-400 font-mono">+1.8%</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Within standard 4-hour SLA</span>
        </div>

        <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Weekly Total Handled</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-blue-400 tabular-nums">1,497</span>
            <span className="text-[11px] text-blue-400 font-mono">Tickets</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Mon - Sun Cumulative</span>
        </div>

        <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Avg Critical Response</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-red-400 tabular-nums">14.2 min</span>
            <span className="text-[11px] text-emerald-400 font-mono">-2.4 min</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Target threshold: &lt; 20 min</span>
        </div>

        <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Citizen Satisfaction</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">4.6 / 5.0</span>
            <span className="text-[11px] text-amber-400 font-mono">8,920 reviews</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Mobile Citizen App Rating</span>
        </div>
      </div>

      {/* Row 1: Category Distribution (Pie) & Severity Distribution (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incidents by Category (Pie Chart) */}
        <div className="lg:col-span-6 bg-[#131F33] border border-[#1E2D4A] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-[#F8FAFC]">Incidents by Urban Category</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Total: 248 Active</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_CATEGORY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {MOCK_CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(val, entry: any) => (
                    <span className="text-xs text-slate-300 font-medium mr-2">
                      {val} ({entry.payload.count})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents by Severity (Bar Chart) */}
        <div className="lg:col-span-6 bg-[#131F33] border border-[#1E2D4A] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-[#F8FAFC]">Active Incidents by Severity Priority</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Severity Breakdown</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_SEVERITY_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" vertical={false} />
                <XAxis dataKey="severity" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Incidents" radius={[6, 6, 0, 0]}>
                  {MOCK_SEVERITY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-sev-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Daily Incident Trends (Area/Line Chart) */}
      <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-[#F8FAFC]">Daily Incident Intake vs. Resolution Trends</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Reported
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved
            </span>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_DAILY_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" vertical={false} />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="reported"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorReported)"
                name="Reported Incidents"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#22C55E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorResolved)"
                name="Resolved Incidents"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Department Performance & Hourly Incident Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Response Performance (Bar Chart) */}
        <div className="lg:col-span-6 bg-[#131F33] border border-[#1E2D4A] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#F8FAFC]">Department Average Response Time (Minutes)</h3>
            <span className="text-[11px] font-mono text-slate-400">Lower is better</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_DEPARTMENT_PERFORMANCE}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis dataKey="department" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgTimeMin" name="Avg Minutes" fill="#3B82F6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Incident Intensity Curve */}
        <div className="lg:col-span-6 bg-[#131F33] border border-[#1E2D4A] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#F8FAFC]">Diurnal Telemetry Heatmap (Peak Incident Hours)</h3>
            <span className="text-[11px] font-mono text-slate-400">24-Hour Cycle</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_HOURLY_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  name="Peak Inflow"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#F59E0B' }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Output Resolved"
                  stroke="#22C55E"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Analytics = AnalyticsPage;
