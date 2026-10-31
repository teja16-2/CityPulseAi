import React from 'react';
import { DepartmentInfo } from '../types';
import {
  Building2,
  Users,
  Truck,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface DepartmentsPageProps {
  departments: DepartmentInfo[];
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({ departments }) => {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">Greater Noida Municipal Departments</h2>
          <p className="text-xs text-slate-400">
            Field readiness, personnel strength, fleet allocation, and active ticket queues across administrative divisions
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#131F33] px-3 py-1 rounded-lg border border-[#1E2D4A]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Overall Fleet Readiness: 93.2%</span>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-all shadow-md group"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[#F8FAFC] leading-snug group-hover:text-blue-300 transition-colors">
                    {dept.name}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                    {dept.shortName} · ID: {dept.id}
                  </span>
                </div>
              </div>

              {/* Head Officer & Contact */}
              <div className="mt-4 p-3 bg-[#0D1728] rounded-lg border border-[#1E2D4A]/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Nodal Officer:</span>
                  <span className="font-semibold text-white">{dept.headOfficer}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Control Desk:</span>
                  <span className="font-mono text-blue-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {dept.contactNumber}
                  </span>
                </div>
              </div>

              {/* Operational Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="p-2.5 bg-[#0D1728] rounded-lg border border-[#1E2D4A]/50">
                  <span className="text-[10px] text-slate-400 block">Active Personnel</span>
                  <span className="text-base font-bold font-mono text-slate-100 tabular-nums flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" /> {dept.activePersonnel}
                  </span>
                </div>

                <div className="p-2.5 bg-[#0D1728] rounded-lg border border-[#1E2D4A]/50">
                  <span className="text-[10px] text-slate-400 block">Fleet & Machinery</span>
                  <span className="text-base font-bold font-mono text-slate-100 tabular-nums flex items-center gap-1 mt-0.5">
                    <Truck className="w-3.5 h-3.5 text-amber-400" /> {dept.activeVehicles} units
                  </span>
                </div>

                <div className="p-2.5 bg-[#0D1728] rounded-lg border border-[#1E2D4A]/50">
                  <span className="text-[10px] text-slate-400 block">Open Incidents</span>
                  <span className="text-base font-bold font-mono text-red-400 tabular-nums mt-0.5 block">
                    {dept.openIncidents} queue
                  </span>
                </div>

                <div className="p-2.5 bg-[#0D1728] rounded-lg border border-[#1E2D4A]/50">
                  <span className="text-[10px] text-slate-400 block">Avg Response Time</span>
                  <span className="text-base font-bold font-mono text-emerald-400 tabular-nums mt-0.5 block">
                    {dept.avgResponseTimeMin} mins
                  </span>
                </div>
              </div>
            </div>

            {/* Readiness Bar */}
            <div className="pt-2 border-t border-[#1E2D4A]/60">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Deployment Readiness</span>
                <span className="text-emerald-400 font-mono font-semibold">{dept.operationalReadiness}%</span>
              </div>
              <div className="w-full bg-[#0D1728] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${dept.operationalReadiness}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
