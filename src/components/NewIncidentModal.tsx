import React, { useState } from 'react';
import { X, AlertCircle, MapPin, Send, Check } from 'lucide-react';
import {
  IncidentCategory,
  IncidentSeverity,
  DepartmentName,
} from '../types';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
    location: {
      address: string;
      sector: string;
      lat: number;
      lng: number;
    };
    department: DepartmentName;
    reporterName?: string;
  }) => void;
}

// Greater Noida Sector presets with realistic coordinates
const SECTORS_LIST = [
  { sector: 'Pari Chowk Junction', lat: 28.4682, lng: 77.5110 },
  { sector: 'Knowledge Park III', lat: 28.4601, lng: 77.4942 },
  { sector: 'Alpha 1 Commercial', lat: 28.4789, lng: 77.5105 },
  { sector: 'Beta 2 Residential', lat: 28.4820, lng: 77.5020 },
  { sector: 'Gamma 1 Market', lat: 28.4905, lng: 77.5180 },
  { sector: 'Delta 1 Extension', lat: 28.4850, lng: 77.5300 },
  { sector: 'Ecotech III Industrial', lat: 28.5200, lng: 77.4750 },
  { sector: 'Surajpur Eco Zone', lat: 28.5350, lng: 77.4980 },
  { sector: 'Chi 4 Expressway Approach', lat: 28.4550, lng: 77.5250 },
  { sector: 'Omega 1 Green Belt', lat: 28.4590, lng: 77.5180 },
];

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('Water Leakage');
  const [severity, setSeverity] = useState<IncidentSeverity>('Medium');
  const [sectorIndex, setSectorIndex] = useState(0);
  const [specificAddress, setSpecificAddress] = useState('');
  const [department, setDepartment] = useState<DepartmentName>('Greater Noida Jal Board');
  const [reporterName, setReporterName] = useState('Central Ward Desk');
  const [errors, setErrors] = useState<{ title?: string; address?: string; desc?: string }>({});

  if (!isOpen) return null;

  // Auto-suggest department based on category
  const handleCategoryChange = (cat: IncidentCategory) => {
    setCategory(cat);
    switch (cat) {
      case 'Water Leakage':
      case 'Drainage Backup':
        setDepartment('Greater Noida Jal Board');
        break;
      case 'Traffic Congestion':
        setDepartment('Traffic & Mobility Wing');
        break;
      case 'Garbage Overflow':
        setDepartment('Waste & Sanitation Dept');
        break;
      case 'Air Pollution':
        setDepartment('UPPCB Air Quality Monitoring');
        break;
      case 'Streetlight Failure':
      case 'Power Outage':
      case 'Road Damage':
        setDepartment('Power & Urban Infrastructure');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; address?: string; desc?: string } = {};

    if (!title.trim()) newErrors.title = 'Incident title is required';
    if (!description.trim()) newErrors.desc = 'Incident description is required';
    if (!specificAddress.trim()) newErrors.address = 'Specific street address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedSector = SECTORS_LIST[sectorIndex];
    // Slightly jitter coordinates so new markers don't overlap exactly
    const jitterLat = selectedSector.lat + (Math.random() - 0.5) * 0.003;
    const jitterLng = selectedSector.lng + (Math.random() - 0.5) * 0.003;

    onSubmit({
      title,
      description,
      category,
      severity,
      location: {
        address: `${specificAddress}, ${selectedSector.sector}`,
        sector: selectedSector.sector,
        lat: Number(jitterLat.toFixed(5)),
        lng: Number(jitterLng.toFixed(5)),
      },
      department,
      reporterName,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1E2D4A] bg-[#0D1728] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F8FAFC]">Log New City Incident</h2>
              <p className="text-xs text-slate-400">Dispatch ticket to Greater Noida municipal emergency system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2D4A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Incident Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Incident Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder="e.g. Major Water Pipe Rupture near Delta 1 roundabout"
              className={`w-full bg-[#0D1728] border ${
                errors.title ? 'border-red-500' : 'border-[#1E2D4A]'
              } rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500`}
            />
            {errors.title && <p className="text-[11px] text-red-400 mt-1">{errors.title}</p>}
          </div>

          {/* Category & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as IncidentCategory)}
                className="w-full bg-[#0D1728] border border-[#1E2D4A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Water Leakage">Water Leakage</option>
                <option value="Traffic Congestion">Traffic Congestion</option>
                <option value="Garbage Overflow">Garbage Overflow</option>
                <option value="Air Pollution">Air Pollution</option>
                <option value="Streetlight Failure">Streetlight Failure</option>
                <option value="Drainage Backup">Drainage Backup</option>
                <option value="Power Outage">Power Outage</option>
                <option value="Road Damage">Road Damage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Priority</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full bg-[#0D1728] border border-[#1E2D4A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Critical">Critical Priority (Immediate)</option>
                <option value="High">High Priority (&lt; 2h)</option>
                <option value="Medium">Medium Priority (&lt; 6h)</option>
                <option value="Low">Low Priority (Routine)</option>
              </select>
            </div>
          </div>

          {/* Sector & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Greater Noida Sector</label>
              <select
                value={sectorIndex}
                onChange={(e) => setSectorIndex(Number(e.target.value))}
                className="w-full bg-[#0D1728] border border-[#1E2D4A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {SECTORS_LIST.map((s, idx) => (
                  <option key={s.sector} value={idx}>
                    {s.sector}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Specific Landmark / Street <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={specificAddress}
                onChange={(e) => {
                  setSpecificAddress(e.target.value);
                  if (errors.address) setErrors({ ...errors, address: undefined });
                }}
                placeholder="e.g. Near Gate 2, Commercial Complex"
                className={`w-full bg-[#0D1728] border ${
                  errors.address ? 'border-red-500' : 'border-[#1E2D4A]'
                } rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500`}
              />
              {errors.address && <p className="text-[11px] text-red-400 mt-1">{errors.address}</p>}
            </div>
          </div>

          {/* Department & Reporter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Responsible Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as DepartmentName)}
                className="w-full bg-[#0D1728] border border-[#1E2D4A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Greater Noida Jal Board">Greater Noida Jal Board</option>
                <option value="Traffic & Mobility Wing">Traffic & Mobility Wing</option>
                <option value="Waste & Sanitation Dept">Waste & Sanitation Dept</option>
                <option value="UPPCB Air Quality Monitoring">UPPCB Air Quality Monitoring</option>
                <option value="Power & Urban Infrastructure">Power & Urban Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reported By</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Operator Name or Source"
                className="w-full bg-[#0D1728] border border-[#1E2D4A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Incident Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detailed Description <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.desc) setErrors({ ...errors, desc: undefined });
              }}
              placeholder="Describe physical conditions, safety hazards, or affected infrastructure..."
              className={`w-full bg-[#0D1728] border ${
                errors.desc ? 'border-red-500' : 'border-[#1E2D4A]'
              } rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none`}
            />
            {errors.desc && <p className="text-[11px] text-red-400 mt-1">{errors.desc}</p>}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#1E2D4A] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-[#0D1728] border border-[#1E2D4A] hover:bg-[#1A2A44] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch & Log Incident</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
