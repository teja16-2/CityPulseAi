import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  Bot,
  BarChart3,
  Building2,
  Settings,
  ShieldAlert,
  Radio,
  Activity,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'map'
  | 'incidents'
  | 'assistant'
  | 'analytics'
  | 'departments'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  criticalCount: number;
  emergencyActive: boolean;
  onToggleEmergency: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  criticalCount,
  emergencyActive,
  onToggleEmergency,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Command Center',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'map',
      label: 'City Map (GIS)',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: 'incidents',
      label: 'Incident Management',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: criticalCount > 0 ? criticalCount : undefined,
    },
    {
      id: 'assistant',
      label: 'AI City Assistant',
      icon: <Bot className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Analytics & Trends',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'departments',
      label: 'Municipal Depts',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#0D1728] border-r border-[#1E2D4A] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Lockup */}
        <div className="p-5 border-b border-[#1E2D4A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-[#F8FAFC]">
                  CityPulse AI
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 text-blue-400 bg-blue-950/60 border border-blue-800/40 rounded">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-1">
                Greater Noida Command
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            One City. One Dashboard. Smarter Decisions.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131F33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      isActive
                        ? 'bg-white text-blue-700'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Emergency Controls & Simulation Indicator */}
      <div className="p-4 border-t border-[#1E2D4A] space-y-3 bg-[#0A1220]/60">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Radio
              className={`w-3.5 h-3.5 ${
                emergencyActive ? 'text-red-400 animate-pulse' : 'text-emerald-400'
              }`}
            />
            <span className="font-mono text-[11px]">
              {emergencyActive ? 'EMERGENCY PROTOCOL' : 'TELEMETRY LIVE'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
            Simulated
          </span>
        </div>

        {/* Emergency Broadcast Toggle */}
        <button
          onClick={onToggleEmergency}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
            emergencyActive
              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
              : 'bg-[#131F33] text-red-400 border-red-900/50 hover:bg-red-950/40 hover:border-red-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>{emergencyActive ? 'Silence Emergency Alert' : 'Trigger Citywide Alert'}</span>
        </button>

        <div className="text-[10px] text-slate-500 text-center font-mono">
          Municipal Operations Division · UP India
        </div>
      </div>
    </aside>
  );
};
