import React from 'react';
import {
  AlertTriangle,
  Radio,
  Flame,
  ShieldAlert,
  Droplet,
  Car,
  BellRing,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { Incident } from '../types';

interface AlertPanelProps {
  emergencyActive: boolean;
  onSilenceEmergency: () => void;
  recentIncidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  emergencyActive,
  onSilenceEmergency,
  recentIncidents,
  onSelectIncident,
}) => {
  return (
    <div className="space-y-4">
      {/* Citywide Emergency Alert Banner */}
      {emergencyActive && (
        <div className="bg-gradient-to-r from-red-950/80 via-red-900/60 to-red-950/80 border-2 border-red-500 rounded-xl p-4 shadow-xl shadow-red-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-red-200 bg-red-800/80 px-2 py-0.5 rounded font-mono">
                  CRITICAL BROADCAST ACTIVE
                </span>
                <span className="text-xs font-mono text-red-300">Greater Noida North Grid</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                Emergency Protocol Activated: High Multi-Agency Incident Load
              </h3>
              <p className="text-xs text-red-200 mt-0.5">
                All departmental emergency response fleets (Jal Board, Traffic Interceptors, UPPCB) are prioritized on primary arterial zones.
              </p>
            </div>
          </div>
          <button
            onClick={onSilenceEmergency}
            className="px-3.5 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-md"
          >
            Acknowledge & Silence
          </button>
        </div>
      )}

      {/* Live Telemetry Ticker Strip */}
      <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-3.5 flex items-center justify-between gap-4 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0 border-r border-[#1E2D4A] pr-3">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold font-mono text-slate-200 whitespace-nowrap">
            LIVE DISPATCH STREAM
          </span>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto py-1 no-scrollbar text-xs">
          {recentIncidents.slice(0, 4).map((inc) => (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className="flex items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors shrink-0 group"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  inc.severity === 'Critical'
                    ? 'bg-red-500 animate-ping'
                    : inc.severity === 'High'
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
              />
              <span className="font-mono text-[11px] text-slate-400 group-hover:text-blue-300">
                {inc.id}:
              </span>
              <span className="font-medium text-slate-200 group-hover:text-white max-w-[200px] truncate">
                {inc.title}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">({inc.location.sector})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
