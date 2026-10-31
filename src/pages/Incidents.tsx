import React from 'react';
import { IncidentTable } from '../components/IncidentTable';
import {
  Incident,
  IncidentStatus,
} from '../types';
import { Download, Plus, AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export interface IncidentsPageProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOpenAIAssistant?: (incident: Incident) => void;
  onTriageIncident?: (incident: Incident) => void;
  onAddNewIncident?: () => void;
  onOpenNewIncident?: () => void;
  onStatusChange?: (id: string, status: IncidentStatus) => void;
  onUpdateStatus?: (id: string, status: IncidentStatus) => void;
  searchFilter?: string;
  onSearchChange?: (val: string) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  onSelectIncident,
  onOpenAIAssistant,
  onTriageIncident,
  onAddNewIncident,
  onOpenNewIncident,
  onStatusChange,
  onUpdateStatus,
}) => {
  const handleAIAssistant = onOpenAIAssistant || onTriageIncident || (() => {});
  const handleNewIncident = onAddNewIncident || onOpenNewIncident || (() => {});
  const handleStatus = onStatusChange || onUpdateStatus || (() => {});

  const criticalCount = incidents.filter((i) => i.severity === 'Critical').length;
  const highCount = incidents.filter((i) => i.severity === 'High').length;
  const inProgressCount = incidents.filter((i) => i.status === 'In Progress').length;
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved').length;

  const handleExportCSV = () => {
    const headers = ['ID,Title,Category,Severity,Status,Sector,Address,Department,ReportedAt'];
    const rows = incidents.map(
      (i) =>
        `"${i.id}","${i.title.replace(/"/g, '""')}","${i.category}","${i.severity}","${i.status}","${i.location.sector}","${i.location.address.replace(/"/g, '""')}","${i.department}","${i.reportedAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `citypulse_incidents_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">Municipal Incident Management</h2>
          <p className="text-xs text-slate-400">
            Real-time urban operations queue across Greater Noida Authority administrative zones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131F33] hover:bg-[#1C2C48] text-slate-300 hover:text-white border border-[#1E2D4A] rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleNewIncident}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Incident</span>
          </button>
        </div>
      </div>

      {/* Incident Status Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Critical Active</span>
            <span className="text-xl font-bold font-mono text-red-400 tabular-nums">
              {criticalCount}
            </span>
          </div>
        </div>

        <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">High Priority</span>
            <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              {highCount}
            </span>
          </div>
        </div>

        <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">In Field Progress</span>
            <span className="text-xl font-bold font-mono text-blue-400 tabular-nums">
              {inProgressCount}
            </span>
          </div>
        </div>

        <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Resolved Today</span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {resolvedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Incident Table */}
      <IncidentTable
        incidents={incidents}
        onSelectIncident={onSelectIncident}
        onOpenAIAssistant={handleAIAssistant}
        onAddNewIncident={handleNewIncident}
        onStatusChange={handleStatus}
      />
    </div>
  );
};

export const Incidents = IncidentsPage;
