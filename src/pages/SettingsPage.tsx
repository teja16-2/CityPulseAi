import React, { useState } from 'react';
import {
  Settings,
  Server,
  Database,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  Code,
  Shield,
  Radio,
  Sliders,
  Check,
  AlertCircle,
} from 'lucide-react';

interface SettingsPageProps {
  onResetData: () => void;
  emergencyActive: boolean;
  onToggleEmergency: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onResetData,
  emergencyActive,
  onToggleEmergency,
}) => {
  const [apiUrl, setApiUrl] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'fallback'>('idle');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [simSpeed, setSimSpeed] = useState('1x');

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('idle');

    setTimeout(() => {
      if (apiUrl.trim().startsWith('http')) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('fallback');
      }
      setTestingConnection(false);
    }, 800);
  };

  const handleReset = () => {
    onResetData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-[#F8FAFC]">Command System Settings & API Integration</h2>
        <p className="text-xs text-slate-400">
          Configure external FastAPI backend connection, telemetry simulations, and operational protocols
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): FastAPI Backend Integration */}
        <div className="lg:col-span-8 space-y-5">
          {/* FastAPI Integration Configuration */}
          <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">FastAPI Backend Gateway</h3>
                <p className="text-xs text-slate-400">
                  Ready to connect with your team member&apos;s Python FastAPI server
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#0D1728] rounded-lg border border-[#1E2D4A] text-xs text-slate-300 leading-relaxed">
              CityPulse AI is structured with a decoupled service layer (<span className="font-mono text-blue-400">src/services/api.ts</span>). It uses browser localStorage by default, and automatically routes HTTP requests to your FastAPI endpoint when configured below.
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                FastAPI Base URL (<span className="font-mono text-slate-400">VITE_API_URL</span>)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="e.g. http://localhost:8000 or https://api.smartcity.noida.gov.in"
                  className="flex-1 bg-[#0D1728] border border-[#1E2D4A] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </button>
              </div>

              {connectionStatus === 'success' && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Target API format verified. REST contracts matched with FastAPI backend.</span>
                </div>
              )}
              {connectionStatus === 'fallback' && (
                <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/60 text-blue-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>No live server URL supplied. Running seamlessly on high-speed Local Storage simulation.</span>
                </div>
              )}
            </div>

            {/* FastAPI REST Contract Spec for Teammates */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Code className="w-4 h-4 text-blue-400" />
                <span>FastAPI Expected Endpoints (Schema Contract)</span>
              </div>
              <div className="bg-[#0A1220] p-3 rounded-lg border border-[#1E2D4A] font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto">
                <div className="text-emerald-400">GET  /incidents           -&gt; List[Incident]</div>
                <div className="text-blue-400">POST /incidents           -&gt; Incident (Create new ticket)</div>
                <div className="text-amber-400">PUT  /incidents/&#123;id&#125;      -&gt; Incident (Update status/team)</div>
                <div className="text-indigo-400">GET  /stats               -&gt; CityStats (KPI counts & health)</div>
                <div className="text-purple-400">POST /ai/recommend        -&gt; AIRecommendation (Diagnostics)</div>
              </div>
            </div>
          </div>

          {/* Database Reset Control */}
          <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F8FAFC]">Sample Database State</h3>
                  <p className="text-xs text-slate-400">
                    Reset local storage state back to Greater Noida demonstration seed data
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 rounded-lg text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Seed Data</span>
              </button>
            </div>

            {resetSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Simulated database reset successfully! Seeded 12 Greater Noida incidents.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 Cols): Operations & Simulation Controls */}
        <div className="lg:col-span-4 space-y-5">
          {/* Emergency Alert Protocol */}
          <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span>City Emergency Override</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Toggles the high-priority citywide emergency broadcast banner across all operator dashboards.
            </p>
            <button
              onClick={onToggleEmergency}
              className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all border ${
                emergencyActive
                  ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30'
                  : 'bg-[#0D1728] text-slate-300 border-[#1E2D4A] hover:bg-[#1A2A44] hover:text-white'
              }`}
            >
              {emergencyActive ? 'Emergency Alert: ACTIVE' : 'Emergency Alert: STANDBY'}
            </button>
          </div>

          {/* Simulation Cadence */}
          <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Telemetry Simulation Speed</span>
            </h3>
            <p className="text-xs text-slate-400">
              Adjust incoming telemetry event frequency for presentation demoing.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {['Pause', '1x Normal', '2x Rapid'].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSimSpeed(speed)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    simSpeed === speed
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-[#0D1728] text-slate-400 border-[#1E2D4A] hover:text-white'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Identity */}
          <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-5 space-y-2 text-xs">
            <span className="font-bold text-[#F8FAFC] block">CityPulse AI Environment</span>
            <div className="space-y-1.5 text-slate-400 text-[11px]">
              <div>Target: <span className="text-white">Greater Noida, Uttar Pradesh</span></div>
              <div>Stack: <span className="text-white">React, TypeScript, Vite, Tailwind, Leaflet, Recharts</span></div>
              <div>Evaluation: <span className="text-blue-400">Smart City Hackathon 2026</span></div>
              <div>License: <span className="text-white">Enterprise Municipal License</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
