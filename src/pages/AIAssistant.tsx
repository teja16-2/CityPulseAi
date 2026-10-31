import React, { useState } from 'react';
import { AIResponsePanel } from '../components/AIResponsePanel';
import { Incident } from '../types';
import {
  Bot,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Cpu,
} from 'lucide-react';

export interface AIAssistantPageProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onDispatchAction?: (msg: string) => void;
  onUpdateDepartment?: (incidentId: string, department: any) => void;
  onBroadcastAlert?: (title: string, message: string, sector: string) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onDispatchAction,
}) => {
  const [currentIncident, setCurrentIncident] = useState<Incident>(
    selectedIncident || incidents[0]
  );

  const activeInc = selectedIncident || currentIncident || incidents[0];

  const handleIncidentChange = (id: string) => {
    const found = incidents.find((i) => i.id === id);
    if (found) {
      setCurrentIncident(found);
      onSelectIncident(found);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#F8FAFC]">AI City Assistant & Dispatch Intelligence</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                Municipal Expert Model
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated root-cause diagnosis, SLA calculation, and tactical protocol sequencing for Greater Noida operations
            </p>
          </div>
        </div>

        {/* Incident Switcher Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Select Incident:</span>
          <select
            value={activeInc?.id}
            onChange={(e) => handleIncidentChange(e.target.value)}
            className="bg-[#0D1728] border border-[#1E2D4A] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 max-w-xs truncate cursor-pointer"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                [{inc.severity}] {inc.id} - {inc.title.slice(0, 36)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: AI Response Panel & Intelligence Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main AI Response Panel (8 Cols) */}
        <div className="lg:col-span-8">
          <AIResponsePanel
            selectedIncident={activeInc}
            onDispatchAction={onDispatchAction}
          />
        </div>

        {/* Intelligence Telemetry & Benchmarks (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* AI Engine Status Card */}
          <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-2.5">
              <span className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                Dispatch Engine Spec
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded">
                Operational
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Primary Core:</span>
                <span className="font-mono text-white">Deterministic Municipal Rules v4</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Optional Fallback:</span>
                <span className="font-mono text-blue-400">Gemini 3.8 Flash SDK</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Inference Latency:</span>
                <span className="font-mono text-emerald-400">&lt; 120ms</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Backend Ready:</span>
                <span className="font-mono text-slate-200">FastAPI JSON Schema Contract</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E2D4A] text-[11px] text-slate-500 font-mono">
              All recommendations generated in accordance with Uttar Pradesh Municipal Corporation Act regulations.
            </div>
          </div>

          {/* AI SLA Speed Benchmark */}
          <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-4.5 space-y-3">
            <span className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              SLA Acceleration Metrics
            </span>
            <div className="space-y-2.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Triage Speed</span>
                  <span className="text-emerald-400 font-mono font-semibold">-42% Dispatch Time</span>
                </div>
                <div className="w-full bg-[#0D1728] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Cross-Dept Routing Accuracy</span>
                  <span className="text-blue-400 font-mono font-semibold">97.8% Correct</span>
                </div>
                <div className="w-full bg-[#0D1728] h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Incident Category Fast Jump */}
          <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-4.5 space-y-2">
            <span className="text-xs font-bold text-[#F8FAFC] block">Quick Triage by Category</span>
            <div className="flex flex-wrap gap-1.5">
              {['Water Leakage', 'Traffic Congestion', 'Garbage Overflow', 'Air Pollution', 'Streetlight Failure'].map(
                (cat) => {
                  const match = incidents.find((i) => i.category === cat);
                  return (
                    <button
                      key={cat}
                      disabled={!match}
                      onClick={() => match && handleIncidentChange(match.id)}
                      className="text-[11px] px-2.5 py-1 rounded bg-[#0D1728] border border-[#1E2D4A] text-slate-300 hover:text-white hover:border-blue-500 transition-colors"
                    >
                      {cat}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AIAssistant = AIAssistantPage;
