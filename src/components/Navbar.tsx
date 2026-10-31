import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Check,
  User,
  X,
  ExternalLink,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NavbarProps {
  currentTab: string;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllRead: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  emergencyActive: boolean;
  onSelectIncident?: (incidentId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  notifications,
  onMarkNotificationRead,
  onMarkAllRead,
  onSearchChange,
  searchQuery,
  emergencyActive,
  onSelectIncident,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Indian Standard Time format
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const pageTitles: Record<string, string> = {
    dashboard: 'Command Center Overview',
    map: 'Interactive GIS City Map',
    incidents: 'Municipal Incident Management',
    assistant: 'AI City Assistant & Dispatch Intelligence',
    analytics: 'Urban Analytics & SLA Performance',
    departments: 'Municipal Department Directory',
    settings: 'Command System Settings & API Gateway',
  };

  return (
    <header className="h-16 bg-[#0D1728] border-b border-[#1E2D4A] px-6 flex items-center justify-between shrink-0 relative z-30">
      {/* Left: Section Title & Status Indicator */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-bold text-[#F8FAFC] tracking-tight">
            {pageTitles[currentTab] || 'Command Center'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Greater Noida Authority</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-slate-300">Uttar Pradesh, IN</span>
          </div>
        </div>

        {/* City Status Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold border ${
            emergencyActive
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}
        >
          {emergencyActive ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              <span>EMERGENCY ALERT ACTIVE</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Systems Operational</span>
            </>
          )}
        </div>
      </div>

      {/* Center/Right: Clock, Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Real-time IST Digital Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131F33] border border-[#1E2D4A] text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{currentTime || '14:28:10 IST'}</span>
        </div>

        {/* Quick Search */}
        <div className="relative w-64 md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search incident, sector, ID..."
            className="w-full bg-[#131F33] border border-[#1E2D4A] rounded-lg pl-9 pr-8 py-1.5 text-xs text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-lg bg-[#131F33] border border-[#1E2D4A] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1A2A44] transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-88 bg-[#131F33] border border-[#1E2D4A] rounded-xl shadow-2xl p-4 text-slate-200 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2D4A]">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-[#F8FAFC]">Telemetry Alerts</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                    {unreadCount} new
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#1E2D4A]/50 mt-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onMarkNotificationRead(item.id);
                        if (item.incidentId && onSelectIncident) {
                          onSelectIncident(item.incidentId);
                          setShowNotifications(false);
                        }
                      }}
                      className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                        item.read ? 'opacity-65 hover:bg-[#18263E]' : 'bg-[#18263E]/80 hover:bg-[#1E3050]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            item.type === 'critical'
                              ? 'text-red-400'
                              : item.type === 'warning'
                              ? 'text-amber-400'
                              : item.type === 'success'
                              ? 'text-emerald-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                      {item.incidentId && (
                        <div className="flex items-center gap-1 text-[11px] text-blue-400 mt-1.5">
                          <span>View incident</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-[#1E2D4A]">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-[#F8FAFC]">Officer R. Verma</div>
            <div className="text-[10px] text-slate-400 leading-none">Chief Dispatcher</div>
          </div>
        </div>
      </div>
    </header>
  );
};
