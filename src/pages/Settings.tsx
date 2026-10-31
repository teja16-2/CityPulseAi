import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  RefreshCw,
  Database,
  Radio,
  CheckCircle2,
  Code2,
} from 'lucide-react';

interface SettingsProps {
  onResetData: () => void;
  isEmergencyMode: boolean;
  onToggleEmergencyMode: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  onResetData,
  isEmergencyMode,
  onToggleEmergencyMode,
}) => {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: false,
    success: false,
    message: '',
  });

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus({ tested: false, success: false, message: '' });

    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setConnectionStatus({
          tested: true,
          success: true,
          message: `Control Server Active (${data.city} · ${data.aiEngine})`,
        });
      } else {
        throw new Error('Server returned non-200');
      }
    } catch {
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'Using Local Storage Demonstration Engine (FastAPI endpoint optional)',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#131F33] border border-[#1E2D4A] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">System Architecture & Backend Integration</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configuration for external FastAPI microservices, simulation parameters, and local data stores.
            </p>
          </div>
        </div>
      </div>

      {/* 1. FastAPI Integration Configuration */}
      <div className="bg-[#131F33] rounded-xl border border-[#1E2D4A] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">FastAPI Backend Connector</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
            REST API v1
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          CityPulse AI routes all state modifications through <code className="text-blue-300 bg-[#0D1728] px-1.5 py-0.5 rounded border border-[#1E2D4A]">src/services/api.ts</code>. You can attach a separate Python FastAPI server by specifying its host address below.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-8">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Backend Base URL (FastAPI / Express Endpoint)
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g. http://localhost:8000 or https://api.greater-noida.gov.in"
              className="w-full px-3 py-2 text-xs bg-[#0D1728] border border-[#1E2D4A] rounded-lg text-slate-200 font-mono focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-4 sm:pt-5">
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Probing...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {connectionStatus.tested && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              connectionStatus.success
                ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                : 'bg-blue-950/20 border-blue-900/40 text-blue-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{connectionStatus.message}</span>
          </div>
        )}

        {/* FastAPI Endpoint Contract reference for teammates */}
        <div className="mt-3 pt-3 border-t border-[#1E2D4A] space-y-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span>FastAPI Specification Schema</span>
          </span>
          <div className="bg-[#0D1728] rounded-lg p-3 border border-[#1E2D4A] font-mono text-[11px] text-slate-300 space-y-1">
            <p><span className="text-emerald-400">GET</span> /api/incidents <span className="text-slate-500">- Return all city incident records</span></p>
            <p><span className="text-blue-400">POST</span> /api/incidents <span className="text-slate-500">- Ingest new municipal incident</span></p>
            <p><span className="text-amber-400">PATCH</span> /api/incidents/{'{id}'} <span className="text-slate-500">- Update status or assign department</span></p>
            <p><span className="text-emerald-400">GET</span> /api/departments <span className="text-slate-500">- Department readiness & roster</span></p>
            <p><span className="text-purple-400">POST</span> /api/ai/recommend <span className="text-slate-500">- AI Triage recommendation</span></p>
          </div>
        </div>
      </div>

      {/* 2. Simulation & Data Controls */}
      <div className="bg-[#131F33] rounded-xl border border-[#1E2D4A] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Demonstration Engine & Storage State</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The app uses browser localStorage (<code className="text-slate-300 font-mono">citypulse_*</code>) for immediate, offline-ready demonstrations. You can reset to initial seed values at any time during presentations.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={onResetData}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/15 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data to Initial Seeds</span>
          </button>

          <button
            onClick={onToggleEmergencyMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              isEmergencyMode
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-500'
                : 'bg-[#0D1728] hover:bg-[#1a2b47] text-slate-300 border-[#1E2D4A]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isEmergencyMode ? 'Deactivate Emergency Mode' : 'Simulate Emergency Broadcast'}</span>
          </button>
        </div>
      </div>

      {/* 3. System Manifesto & Project Info */}
      <div className="p-4 rounded-xl bg-[#0D1728] border border-[#1E2D4A] text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300">
          <span className="font-semibold text-white">CityPulse AI Command Center v1.4.0</span>
          <span className="font-mono text-blue-400">Hackathon Edition</span>
        </div>
        <p className="leading-relaxed">
          Tagline: <strong className="text-slate-200">One City. One Dashboard. Smarter Decisions.</strong>
        </p>
        <p className="text-[11px] text-slate-500">
          Target Municipality: Greater Noida Industrial Development Authority (GNIDA), Uttar Pradesh, India.
        </p>
      </div>
    </div>
  );
};
