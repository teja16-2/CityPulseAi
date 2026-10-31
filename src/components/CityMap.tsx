import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  Droplets,
  Car,
  Trash2,
  Wind,
  Lightbulb,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Incident, IncidentCategory, IncidentSeverity } from '../types';

interface CityMapProps {
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
  onOpenAIAssistant?: (incident: Incident) => void;
  heightClass?: string;
  selectedIncidentId?: string | null;
}

export const CityMap: React.FC<CityMapProps> = ({
  incidents,
  onSelectIncident,
  onOpenAIAssistant,
  heightClass = 'h-[500px]',
  selectedIncidentId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Greater Noida Center Coordinates
  const GREATER_NOIDA_CENTER: [number, number] = [28.4744, 77.504];

  // Sector quick jump points
  const SECTOR_PRESETS: { name: string; coords: [number, number]; zoom: number }[] = [
    { name: 'Pari Chowk', coords: [28.4682, 77.511], zoom: 15 },
    { name: 'Knowledge Park', coords: [28.4625, 77.492], zoom: 15 },
    { name: 'Alpha 1', coords: [28.4789, 77.5105], zoom: 15 },
    { name: 'Ecotech III', coords: [28.52, 77.475], zoom: 14 },
    { name: 'Reset View', coords: GREATER_NOIDA_CENTER, zoom: 13 },
  ];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: GREATER_NOIDA_CENTER,
        zoom: 13,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false,
      });

      // CartoDB Dark Matter tile layer for an enterprise command center aesthetic
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      // Add Zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup if unmounted
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when incidents or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Filter incidents
    const filtered = incidents.filter((incident) => {
      if (selectedCategory !== 'all' && incident.category !== selectedCategory) {
        return false;
      }
      if (selectedSeverity !== 'all' && incident.severity !== selectedSeverity) {
        return false;
      }
      return true;
    });

    filtered.forEach((incident) => {
      const color =
        incident.severity === 'Critical'
          ? '#EF4444'
          : incident.severity === 'High'
          ? '#F59E0B'
          : incident.severity === 'Medium'
          ? '#3B82F6'
          : '#22C55E';

      const isCritical = incident.severity === 'Critical';
      const isSelected = selectedIncidentId === incident.id;

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
            ${
              isCritical
                ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="
              width: ${isSelected ? '32px' : '26px'};
              height: ${isSelected ? '32px' : '26px'};
              border-radius: 50%;
              background-color: #131F33;
              border: 2.5px solid ${color};
              box-shadow: 0 0 ${isSelected ? '16px' : '10px'} ${color}80;
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${color};
              transition: all 0.2s ease;
            ">
              <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color};"></div>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([incident.location.lat, incident.location.lng], {
        icon: customIcon,
      });

      // Custom Popup HTML
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-100 max-w-[280px] font-sans';
      popupContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 10px; font-family: monospace; color: #94A3B8;">${incident.id}</span>
          <span style="
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            background: ${color}20;
            color: ${color};
            border: 1px solid ${color}40;
          ">${incident.severity}</span>
        </div>
        <h4 style="font-size: 12px; font-weight: 700; color: #F8FAFC; margin: 0 0 4px 0; line-height: 1.3;">
          ${incident.title}
        </h4>
        <div style="font-size: 11px; color: #94A3B8; margin-bottom: 6px;">
          📍 ${incident.location.address}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; color: #CBD5E1; background: #0D1728; padding: 6px; border-radius: 6px; margin-bottom: 8px;">
          <div><strong style="color: #64748B;">Category:</strong><br/>${incident.category}</div>
          <div><strong style="color: #64748B;">Status:</strong><br/><span style="color: ${incident.status === 'Resolved' ? '#22C55E' : '#3B82F6'}; font-weight: 600;">${incident.status}</span></div>
          <div style="grid-column: span 2; margin-top: 2px;"><strong style="color: #64748B;">Department:</strong><br/>${incident.department}</div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="popup-btn-assistant-${incident.id}" style="
            flex: 1;
            padding: 5px 8px;
            font-size: 10px;
            font-weight: 600;
            background: #2563EB;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          ">🤖 AI Triage</button>
          <button id="popup-btn-details-${incident.id}" style="
            flex: 1;
            padding: 5px 8px;
            font-size: 10px;
            font-weight: 600;
            background: #1E2D4A;
            color: #E2E8F0;
            border: 1px solid #334155;
            border-radius: 6px;
            cursor: pointer;
          ">Details</button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'citypulse-popup',
      });

      marker.on('popupopen', () => {
        const btnAssistant = document.getElementById(`popup-btn-assistant-${incident.id}`);
        const btnDetails = document.getElementById(`popup-btn-details-${incident.id}`);
        if (btnAssistant && onOpenAIAssistant) {
          btnAssistant.onclick = () => {
            onOpenAIAssistant(incident);
          };
        }
        if (btnDetails && onSelectIncident) {
          btnDetails.onclick = () => {
            onSelectIncident(incident);
          };
        }
      });

      marker.addTo(markersGroup);

      if (selectedIncidentId === incident.id) {
        map.setView([incident.location.lat, incident.location.lng], 16, {
          animate: true,
        });
        marker.openPopup();
      }
    });
  }, [incidents, selectedCategory, selectedSeverity, selectedIncidentId]);

  const handlePresetClick = (preset: { coords: [number, number]; zoom: number }) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(preset.coords, preset.zoom, {
        animate: true,
      });
    }
  };

  const categories = [
    { id: 'all', label: 'All Incidents' },
    { id: 'Water Leakage', label: 'Water' },
    { id: 'Traffic Congestion', label: 'Traffic' },
    { id: 'Garbage Overflow', label: 'Sanitation' },
    { id: 'Air Pollution', label: 'Air Quality' },
    { id: 'Streetlight Failure', label: 'Lighting' },
  ];

  return (
    <div
      className={`bg-[#131F33] border border-[#1E2D4A] rounded-xl overflow-hidden flex flex-col relative ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : heightClass
      }`}
    >
      {/* Map Control Header Bar */}
      <div className="px-4 py-2.5 bg-[#0D1728] border-b border-[#1E2D4A] flex flex-wrap items-center justify-between gap-2 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-[#F8FAFC]">Greater Noida GIS Incident Grid</span>
          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-[#131F33] border border-[#1E2D4A]">
            Lat: 28.4744° N · Lng: 77.5040° E
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[#131F33] text-slate-300 hover:text-white border border-[#1E2D4A]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Sector Quick-jumps & Fullscreen */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">Sectors:</span>
          {SECTOR_PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetClick(preset)}
              className="text-[10px] px-2 py-0.8 rounded bg-[#1A2A44] hover:bg-[#253A5E] text-slate-300 font-mono transition-colors"
            >
              {preset.name}
            </button>
          ))}
          <button
            onClick={() => handlePresetClick(SECTOR_PRESETS[4])}
            title="Reset Map View"
            className="p-1 rounded bg-[#1A2A44] hover:bg-[#253A5E] text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded bg-[#1A2A44] hover:bg-[#253A5E] text-slate-300 transition-colors ml-1"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative flex-1 w-full min-h-[300px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Severity Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[400] bg-[#0D1728]/90 backdrop-blur-md border border-[#1E2D4A] rounded-lg p-2.5 shadow-xl text-xs space-y-1.5 select-none pointer-events-auto">
          <div className="font-bold text-[11px] text-[#F8FAFC] flex items-center justify-between border-b border-[#1E2D4A] pb-1">
            <span>Incident Severity</span>
            <span className="text-[9px] font-mono text-slate-400">Pari Chowk Grid</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500/50" />
            <span>Critical Priority (Immediate)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>High Priority (&lt; 2h SLA)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Medium Priority (&lt; 6h SLA)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Low Priority / Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};
