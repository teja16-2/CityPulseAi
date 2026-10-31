import React from 'react';
import {
  Incident,
  IncidentStatus,
  DepartmentName,
} from '../types';
import {
  CATEGORY_INFO,
  SEVERITY_COLORS,
  STATUS_COLORS,
} from '../data/mockData';
import {
  X,
  MapPin,
  Bot,
  Calendar,
  Building2,
  User,
  ShieldAlert,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export interface IncidentDetailModalProps {
  incident: Incident | null;
  isOpen?: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: IncidentStatus) => void;
  onUpdateStatus?: (id: string, status: IncidentStatus) => void;
  onUpdateDepartment?: (id: string, department: DepartmentName) => void;
  onOpenAIAssistant?: (incident: Incident) => void;
  onLaunchAITriage?: (incident: Incident) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  isOpen = true,
  onClose,
  onStatusChange,
  onUpdateStatus,
  onUpdateDepartment,
  onOpenAIAssistant,
  onLaunchAITriage,
}) => {
  if (!isOpen || !incident) return null;

  const handleStatus = onStatusChange || onUpdateStatus || (() => {});
  const handleAITriage = onOpenAIAssistant || onLaunchAITriage || (() => {});

  const catInfo = CATEGORY_INFO[incident.category] || { label: incident.category, color: '#3B82F6' };
  const sevStyle = SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.Medium;
  const statStyle = STATUS_COLORS[incident.status] || STATUS_COLORS.Reported;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0D1728] border-b border-[#1E2D4A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-blue-400 font-semibold bg-blue-950/60 px-2.5 py-1 rounded border border-blue-800">
              {incident.id}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded border ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}
            >
              {incident.severity} Priority
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2D4A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Title & Description */}
          <div>
            <h2 className="text-base font-bold text-[#F8FAFC] leading-snug">
              {incident.title}
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-[#0A1220]/70 p-3.5 rounded-lg border border-[#1E2D4A]/60">
              {incident.description}
            </p>
          </div>

          {/* Key Incident Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0D1728] p-3 rounded-lg border border-[#1E2D4A]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Category</span>
              <span className="text-xs font-bold text-[#F8FAFC] mt-0.5 block">{catInfo.label}</span>
            </div>
            <div className="bg-[#0D1728] p-3 rounded-lg border border-[#1E2D4A]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Current Status</span>
              <span className={`text-xs font-bold mt-0.5 block ${statStyle.text}`}>{incident.status}</span>
            </div>
            <div className="bg-[#0D1728] p-3 rounded-lg border border-[#1E2D4A]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Priority Index</span>
              <span className="text-xs font-bold font-mono text-amber-400 mt-0.5 block">
                {incident.priorityScore} / 100
              </span>
            </div>
            <div className="bg-[#0D1728] p-3 rounded-lg border border-[#1E2D4A]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">SLA Target</span>
              <span className="text-xs font-bold font-mono text-slate-200 mt-0.5 block">
                {incident.estimatedResolutionMinutes} mins
              </span>
            </div>
          </div>

          {/* Location & GIS Details */}
          <div className="bg-[#0D1728] p-4 rounded-lg border border-[#1E2D4A] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F8FAFC]">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Location & Spatial Data</span>
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-white">{incident.location.sector}</span>
              <p className="text-slate-400 mt-0.5">{incident.location.address}</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1 border-t border-[#1E2D4A]/60">
              <span>Latitude: {incident.location.lat}° N</span>
              <span>Longitude: {incident.location.lng}° E</span>
            </div>
          </div>

          {/* Department & Response Team Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#0D1728] p-3.5 rounded-lg border border-[#1E2D4A]">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Assigned Department</span>
              </div>
              <p className="text-xs font-semibold text-[#F8FAFC]">{incident.department}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Field Team: <span className="text-slate-200">{incident.assignedTeam || 'Rapid Unit Alpha'}</span>
              </p>
            </div>

            <div className="bg-[#0D1728] p-3.5 rounded-lg border border-[#1E2D4A]">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Reporting Details</span>
              </div>
              <p className="text-xs font-semibold text-[#F8FAFC]">{incident.reporterName}</p>
              <p className="text-[11px] text-slate-400 mt-1">Logged {incident.reportedAt}</p>
            </div>
          </div>

          {/* Status Progression Workflow */}
          <div className="bg-[#0D1728] p-4 rounded-lg border border-[#1E2D4A] space-y-3">
            <span className="text-xs font-bold text-slate-200 block">Update Operational Status</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Reported', 'Assigned', 'In Progress', 'Resolved'] as IncidentStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatus(incident.id, st)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                    incident.status === st
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                      : 'bg-[#131F33] text-slate-400 border-[#1E2D4A] hover:text-white hover:bg-[#1A2A44]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#0D1728] border-t border-[#1E2D4A] flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Greater Noida Integrated Command and Control Centre (ICCC)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                handleAITriage(incident);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-lg text-xs font-semibold transition-colors"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Open AI Triage</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#131F33] hover:bg-[#1A2A44] text-slate-300 rounded-lg text-xs font-medium border border-[#1E2D4A] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
