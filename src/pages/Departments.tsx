import React from 'react';
import { Department } from '../types';
import {
  Building2,
  Phone,
  ArrowRight,
} from 'lucide-react';

interface DepartmentsProps {
  departments: Department[];
  onSelectDepartmentFilter?: (departmentName: string) => void;
}

export const Departments: React.FC<DepartmentsProps> = ({
  departments,
  onSelectDepartmentFilter,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#131F33] border border-[#1E2D4A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white">Municipal Operational Authorities</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Greater Noida Industrial Development Authority (GNIDA)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Overview of municipal departments, command personnel, emergency dispatch hotlines, and operational readiness levels.
          </p>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
          6 Active Authorities Synchronized
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-[#131F33] rounded-xl border border-[#1E2D4A] p-5 flex flex-col justify-between hover:border-blue-500/40 transition-colors shadow-sm space-y-4"
          >
            <div>
              {/* Top Row: Code & Readiness */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0D1728] text-blue-400 border border-[#1E2D4A]">
                  {dept.code}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-emerald-400 font-bold">{dept.readiness}% Readiness</span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-semibold text-white mt-2 leading-snug">
                {dept.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {dept.description}
              </p>
            </div>

            {/* Department Head & Contact */}
            <div className="p-3 rounded-lg bg-[#0D1728] border border-[#1E2D4A] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Command Head:</span>
                <span className="font-semibold text-slate-200">{dept.head}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Dispatch Hotline:</span>
                <span className="font-mono text-blue-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{dept.phone}</span>
                </span>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#1E2D4A]">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Personnel</span>
                <span className="font-mono font-bold text-sm text-white">{dept.activePersonnel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Active Cases</span>
                <span className="font-mono font-bold text-sm text-amber-400">{dept.activeIncidents}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Avg Latency</span>
                <span className="font-mono font-bold text-sm text-blue-400">{dept.avgResponseTimeMin}m</span>
              </div>
            </div>

            {/* Action */}
            {onSelectDepartmentFilter && (
              <button
                onClick={() => onSelectDepartmentFilter(dept.name)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#0D1728] hover:bg-blue-600 hover:text-white text-slate-300 border border-[#1E2D4A] text-xs font-medium transition-colors"
              >
                <span>Filter Incidents for {dept.code}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
