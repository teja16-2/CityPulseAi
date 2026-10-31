import React, { useState } from 'react';
import { CityMap } from '../components/CityMap';
import { Incident } from '../types';
import { MapPin, Navigation, Eye, Bot, Filter, Layers } from 'lucide-react';

interface CityMapPageProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOpenAIAssistant: (incident: Incident) => void;
  selectedIncident: Incident | null;
}

export const CityMapPage: React.FC<CityMapPageProps> = ({
  incidents,
  onSelectIncident,
  onOpenAIAssistant,
  selectedIncident,
}) => {
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(
    selectedIncident?.id || incidents[0]?.id || null
  );

  return (
    <div className="p-6 space-y-4 max-w-[1700px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">Greater Noida GIS Incident Intelligence</h2>
          <p className="text-xs text-slate-400">
            Spatial monitoring & geographic dispatch across Pari Chowk, Knowledge Park, Alpha/Beta sectors, and Ecotech
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#131F33] px-3 py-1 rounded-lg border border-[#1E2D4A]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>OpenStreetMap & CartoDB Dark Mesh Connected</span>
        </div>
      </div>

      {/* Main Grid: Full Map + Side Incident Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Map Viewport (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <CityMap
            incidents={incidents}
            onSelectIncident={onSelectIncident}
            onOpenAIAssistant={onOpenAIAssistant}
            heightClass="h-[680px]"
            selectedIncidentId={activeIncidentId}
          />
        </div>

        {/* Incident Geographic Feed (4 Cols) */}
        <div className="lg:col-span-4 bg-[#131F33] border border-[#1E2D4A] rounded-xl flex flex-col overflow-hidden h-[680px]">
          <div className="p-3.5 bg-[#0D1728] border-b border-[#1E2D4A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-[#F8FAFC]">Spatial Markers Feed</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {incidents.length} active geolocations
            </span>
          </div>

          <div className="p-3 overflow-y-auto space-y-2.5 flex-1 divide-y divide-[#1E2D4A]/50">
            {incidents.map((inc) => {
              const isSelected = activeIncidentId === inc.id;
              const severityColor =
                inc.severity === 'Critical'
                  ? 'border-red-500/40 text-red-400 bg-red-500/10'
                  : inc.severity === 'High'
                  ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                  : inc.severity === 'Medium'
                  ? 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                  : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10';

              return (
                <div
                  key={inc.id}
                  onClick={() => setActiveIncidentId(inc.id)}
                  className={`pt-2.5 first:pt-0 p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1A2A44] border-blue-500 shadow-md'
                      : 'bg-[#0D1728]/70 border-[#1E2D4A] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-blue-400">{inc.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityColor}`}>
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-1 leading-snug line-clamp-2">
                    {inc.title}
                  </h4>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-slate-500" />
                    <span className="truncate">{inc.location.sector}</span>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {inc.location.lat}° N, {inc.location.lng}° E · {inc.category}
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#1E2D4A]/50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAIAssistant(inc);
                      }}
                      className="flex-1 py-1 px-2 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-[10px] font-semibold border border-blue-500/30 transition-colors flex items-center justify-center gap-1"
                    >
                      <Bot className="w-3 h-3" />
                      <span>AI Triage</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc);
                      }}
                      className="py-1 px-2.5 rounded bg-[#131F33] text-slate-300 hover:text-white text-[10px] font-semibold border border-[#1E2D4A] transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
