import React, { useState } from 'react';
import { StatCard } from '../components/StatCard';
import { CityMap } from '../components/CityMap';
import { IncidentTable } from '../components/IncidentTable';
import { AIResponsePanel } from '../components/AIResponsePanel';
import { AlertPanel } from '../components/AlertPanel';
import { MunicipalWeatherWidget } from '../components/MunicipalWeatherWidget';
import { CityStats, Incident, IncidentStatus } from '../types';

export interface DashboardProps {
  stats: CityStats;
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOpenAIAssistant: (incident: Incident) => void;
  onAddNewIncident: () => void;
  onStatusChange: (id: string, status: IncidentStatus) => void;
  emergencyActive: boolean;
  onSilenceEmergency: () => void;
  selectedIncident: Incident | null;
  onDispatchAction?: (msg: string) => void;
  onTriageIncident?: (incident: Incident) => void;
  onNavigateToIncidents?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToAI?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  incidents,
  onSelectIncident,
  onOpenAIAssistant,
  onAddNewIncident,
  onStatusChange,
  emergencyActive,
  onSilenceEmergency,
  selectedIncident,
  onDispatchAction,
  onTriageIncident,
}) => {
  const [severityFilter, setSeverityFilter] = useState('all');
  const handleAIAssistant = onOpenAIAssistant || onTriageIncident || (() => {});

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* 4 KPI Cards */}
      <StatCard
        stats={stats}
        onFilterSeverity={(sev) => setSeverityFilter(sev)}
      />

      {/* Emergency Broadcast Alert & Live Telemetry Feed */}
      <AlertPanel
        emergencyActive={emergencyActive}
        onSilenceEmergency={onSilenceEmergency}
        recentIncidents={incidents}
        onSelectIncident={onSelectIncident}
      />

      {/* Real-Time Weather & Environmental Telemetry for Greater Noida */}
      <MunicipalWeatherWidget onDispatchAction={onDispatchAction} />

      {/* High-Priority Split View: Interactive GIS Map & AI Assistant Quick Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Interactive GIS City Map (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <CityMap
            incidents={incidents}
            onSelectIncident={onSelectIncident}
            onOpenAIAssistant={handleAIAssistant}
            heightClass="h-[520px]"
            selectedIncidentId={selectedIncident?.id}
          />
        </div>

        {/* AI City Assistant Dispatch Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <AIResponsePanel
            selectedIncident={selectedIncident || incidents[0] || null}
            onDispatchAction={onDispatchAction}
          />
        </div>
      </div>

      {/* Main Incident Operations Table */}
      <div className="space-y-3">
        <IncidentTable
          incidents={incidents}
          onSelectIncident={onSelectIncident}
          onOpenAIAssistant={handleAIAssistant}
          onAddNewIncident={onAddNewIncident}
          onStatusChange={onStatusChange}
          initialSeverityFilter={severityFilter}
        />
      </div>
    </div>
  );
};
