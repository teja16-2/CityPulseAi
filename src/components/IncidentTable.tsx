import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Bot,
  CheckCircle,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
  DepartmentName,
} from '../types';

interface IncidentTableProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOpenAIAssistant: (incident: Incident) => void;
  onAddNewIncident: () => void;
  onStatusChange: (id: string, status: IncidentStatus) => void;
  initialSeverityFilter?: string;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  onSelectIncident,
  onOpenAIAssistant,
  onAddNewIncident,
  onStatusChange,
  initialSeverityFilter = 'all',
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>(initialSeverityFilter);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'reportedAt' | 'priorityScore' | 'severity'>('priorityScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter & Sort
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        if (search) {
          const q = search.toLowerCase();
          const matchTitle = inc.title.toLowerCase().includes(q);
          const matchId = inc.id.toLowerCase().includes(q);
          const matchSector = inc.location.sector.toLowerCase().includes(q);
          const matchDept = inc.department.toLowerCase().includes(q);
          if (!matchTitle && !matchId && !matchSector && !matchDept) return false;
        }
        if (categoryFilter !== 'all' && inc.category !== categoryFilter) return false;
        if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
        if (departmentFilter !== 'all' && inc.department !== departmentFilter) return false;
        if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'priorityScore') {
          diff = a.priorityScore - b.priorityScore;
        } else if (sortField === 'severity') {
          const rank: Record<string, number> = {
            Critical: 4,
            critical: 4,
            High: 3,
            high: 3,
            Medium: 2,
            medium: 2,
            Low: 1,
            low: 1,
          };
          diff = (rank[a.severity] ?? 0) - (rank[b.severity] ?? 0);
        } else {
          diff = a.id.localeCompare(b.id);
        }
        return sortAsc ? diff : -diff;
      });
  }, [incidents, search, categoryFilter, severityFilter, departmentFilter, statusFilter, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredIncidents.length / pageSize));
  const paginated = filteredIncidents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: 'reportedAt' | 'priorityScore' | 'severity') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'Reported':
        return (
          <span className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Reported
          </span>
        );
      case 'Assigned':
        return (
          <span className="text-xs text-blue-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Assigned
          </span>
        );
      case 'In Progress':
        return (
          <span className="text-xs text-indigo-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl overflow-hidden flex flex-col shadow-lg">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-[#1E2D4A] bg-[#0D1728] space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">Active Incident Operations</h3>
            <p className="text-xs text-slate-400">
              Live municipal incidents triaged across Greater Noida ward sectors
            </p>
          </div>
          <button
            onClick={onAddNewIncident}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Incident</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search ID, title, sector..."
              className="w-full bg-[#131F33] border border-[#1E2D4A] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#131F33] border border-[#1E2D4A] rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Traffic Congestion">Traffic Congestion</option>
            <option value="Garbage Overflow">Garbage Overflow</option>
            <option value="Air Pollution">Air Pollution</option>
            <option value="Streetlight Failure">Streetlight Failure</option>
            <option value="Drainage Backup">Drainage Backup</option>
            <option value="Road Damage">Road Damage</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#131F33] border border-[#1E2D4A] rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#131F33] border border-[#1E2D4A] rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Departments</option>
            <option value="Greater Noida Jal Board">Jal Board</option>
            <option value="Traffic & Mobility Wing">Traffic Police</option>
            <option value="Waste & Sanitation Dept">Sanitation</option>
            <option value="UPPCB Air Quality Monitoring">Air Quality Wing</option>
            <option value="Power & Urban Infrastructure">Power & Infra</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#131F33] border border-[#1E2D4A] rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0A1220] border-b border-[#1E2D4A] text-slate-400 select-none">
            <tr>
              <th className="py-3 px-3.5 font-semibold">Incident ID</th>
              <th className="py-3 px-3.5 font-semibold">Incident Title</th>
              <th className="py-3 px-3.5 font-semibold">Category</th>
              <th className="py-3 px-3.5 font-semibold">Location</th>
              <th
                className="py-3 px-3.5 font-semibold cursor-pointer hover:text-white"
                onClick={() => handleSort('severity')}
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3.5 font-semibold">Department</th>
              <th className="py-3 px-3.5 font-semibold">Status</th>
              <th className="py-3 px-3.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2D4A]/50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-400">No matching incidents found</p>
                    <p className="text-xs text-slate-500">Try adjusting your filters or search query</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((inc) => (
                <tr
                  key={inc.id}
                  className="hover:bg-[#1A2A44]/50 transition-colors group"
                >
                  {/* ID */}
                  <td className="py-3 px-3.5 font-mono text-[11px] text-blue-400 whitespace-nowrap">
                    {inc.id}
                  </td>

                  {/* Title */}
                  <td className="py-3 px-3.5 font-medium text-[#F8FAFC] max-w-xs truncate">
                    <button
                      onClick={() => onSelectIncident(inc)}
                      className="hover:text-blue-400 transition-colors text-left"
                    >
                      {inc.title}
                    </button>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Reported {inc.reportedAt}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">
                    {inc.category}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-3.5 text-slate-300 max-w-[160px] truncate">
                    <span className="font-semibold text-slate-200">{inc.location.sector}</span>
                    <div className="text-[10px] text-slate-500 truncate">{inc.location.address}</div>
                  </td>

                  {/* Priority / Severity */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {getSeverityBadge(inc.severity)}
                  </td>

                  {/* Department */}
                  <td className="py-3 px-3.5 text-slate-300 max-w-[160px] truncate">
                    {inc.department}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <select
                      value={inc.status}
                      onChange={(e) => onStatusChange(inc.id, e.target.value as IncidentStatus)}
                      className="bg-[#0D1728] border border-[#1E2D4A] rounded px-2 py-1 text-[11px] font-medium text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Reported">Reported</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenAIAssistant(inc)}
                        title="AI Dispatch Intelligence"
                        className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition-colors flex items-center gap-1 text-[11px] font-medium"
                      >
                        <Bot className="w-3 h-3" />
                        <span>AI Triage</span>
                      </button>
                      <button
                        onClick={() => onSelectIncident(inc)}
                        title="View Full Details"
                        className="p-1 rounded bg-[#0D1728] text-slate-400 hover:text-white border border-[#1E2D4A] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-[#1E2D4A] bg-[#0D1728] flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing{' '}
          <span className="font-mono text-white">
            {filteredIncidents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>{' '}
          to{' '}
          <span className="font-mono text-white">
            {Math.min(currentPage * pageSize, filteredIncidents.length)}
          </span>{' '}
          of <span className="font-mono text-white">{filteredIncidents.length}</span> incidents
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded bg-[#131F33] border border-[#1E2D4A] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1C2C48]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-slate-300 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded bg-[#131F33] border border-[#1E2D4A] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1C2C48]"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
