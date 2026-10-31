import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { NewIncidentModal } from './components/NewIncidentModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { Dashboard } from './pages/Dashboard';
import { IncidentsPage } from './pages/Incidents';
import { CityMapPage } from './pages/CityMapPage';
import { AIAssistantPage } from './pages/AIAssistant';
import { AnalyticsPage } from './pages/Analytics';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';
import {
  Incident,
  CityStats,
  DepartmentInfo,
  NotificationItem,
  IncidentStatus,
  IncidentCategory,
  IncidentSeverity,
  DepartmentName,
} from './types';
import { INITIAL_CITY_STATS } from './data/mockData';
import { Check, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<CityStats>(INITIAL_CITY_STATS);
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' } | null>(null);

  const showToast = (text: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load initial data
  const loadData = useCallback(async () => {
    const [incList, statsData, depts, notifs] = await Promise.all([
      api.getIncidents(),
      api.getCityStats(),
      api.getDepartments(),
      api.getNotifications(),
    ]);
    setIncidents(incList);
    setStats(statsData);
    setDepartments(depts);
    setNotifications(notifs);
    setEmergencyActive(api.getEmergencyBroadcastStatus());
    if (incList.length > 0 && !selectedIncident) {
      setSelectedIncident(incList[0]);
    }
  }, [selectedIncident]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Log New Incident
  const handleCreateIncident = async (data: {
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
  }) => {
    const created = await api.createIncident(data);
    await loadData();
    setSelectedIncident(created);
    showToast(`Incident ${created.id} logged and dispatched to ${created.department}`);
  };

  // Handle Incident Status Change
  const handleStatusChange = async (id: string, newStatus: IncidentStatus) => {
    const updated = await api.updateIncidentStatus(id, newStatus);
    if (updated) {
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
      if (selectedIncident?.id === id) {
        setSelectedIncident(updated);
      }
      const updatedStats = await api.getCityStats();
      setStats(updatedStats);
      showToast(`Incident ${id} status updated to ${newStatus}`);
    }
  };

  // Handle Emergency Protocol Toggle
  const handleToggleEmergency = () => {
    const nextState = !emergencyActive;
    setEmergencyActive(nextState);
    api.setEmergencyBroadcastStatus(nextState);

    if (nextState) {
      api.addNotification({
        title: 'Emergency Protocol Activated',
        message: 'Citywide priority alert dispatched to all Greater Noida response units.',
        type: 'critical',
      }).then(() => loadData());
      showToast('Emergency Protocol Activated across Greater Noida Grid!', 'alert');
    } else {
      showToast('Emergency alert acknowledged and silenced');
    }
  };

  // Switch to AI Assistant with preselected incident
  const handleOpenAIAssistant = (incident: Incident) => {
    setSelectedIncident(incident);
    setCurrentTab('assistant');
  };

  // Open Full Detail Modal
  const handleOpenDetailModal = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailModalOpen(true);
  };

  // Mark single notification read
  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    const updated = await api.getNotifications();
    setNotifications(updated);
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    const updated = await api.getNotifications();
    setNotifications(updated);
  };

  // Reset database back to seed data
  const handleResetData = async () => {
    api.resetToSampleData();
    await loadData();
    showToast('Database reset to clean Greater Noida sample state');
  };

  // Filter incidents for global search if user searched from Navbar
  const displayIncidents = searchQuery.trim()
    ? incidents.filter(
        (i) =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.location.sector.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : incidents;

  const criticalCount = incidents.filter((i) => i.severity === 'Critical').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080F1D] text-[#F8FAFC]">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        criticalCount={criticalCount}
        emergencyActive={emergencyActive}
        onToggleEmergency={handleToggleEmergency}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          emergencyActive={emergencyActive}
          onSelectIncident={(incidentId) => {
            const found = incidents.find((i) => i.id === incidentId);
            if (found) {
              handleOpenDetailModal(found);
            }
          }}
        />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#080F1D] relative">
          {currentTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              incidents={displayIncidents}
              onSelectIncident={handleOpenDetailModal}
              onOpenAIAssistant={handleOpenAIAssistant}
              onAddNewIncident={() => setIsNewModalOpen(true)}
              onStatusChange={handleStatusChange}
              emergencyActive={emergencyActive}
              onSilenceEmergency={handleToggleEmergency}
              selectedIncident={selectedIncident}
              onDispatchAction={(msg) => {
                showToast(msg);
                loadData();
              }}
            />
          )}

          {currentTab === 'map' && (
            <CityMapPage
              incidents={displayIncidents}
              onSelectIncident={handleOpenDetailModal}
              onOpenAIAssistant={handleOpenAIAssistant}
              selectedIncident={selectedIncident}
            />
          )}

          {currentTab === 'incidents' && (
            <IncidentsPage
              incidents={displayIncidents}
              onSelectIncident={handleOpenDetailModal}
              onOpenAIAssistant={handleOpenAIAssistant}
              onAddNewIncident={() => setIsNewModalOpen(true)}
              onStatusChange={handleStatusChange}
            />
          )}

          {currentTab === 'assistant' && (
            <AIAssistantPage
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              onDispatchAction={(msg) => {
                showToast(msg);
                loadData();
              }}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsPage />}

          {currentTab === 'departments' && (
            <DepartmentsPage departments={departments} />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              onResetData={handleResetData}
              emergencyActive={emergencyActive}
              onToggleEmergency={handleToggleEmergency}
            />
          )}
        </main>
      </div>

      {/* New Incident Modal */}
      <NewIncidentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateIncident}
      />

      {/* Incident Detail Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenAIAssistant={handleOpenAIAssistant}
        onStatusChange={handleStatusChange}
      />

      {/* Global Interactive Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-300 pointer-events-auto">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-semibold ${
              toastMessage.type === 'alert'
                ? 'bg-red-950 border-red-500 text-red-200'
                : 'bg-[#131F33] border-blue-500/50 text-[#F8FAFC]'
            }`}
          >
            {toastMessage.type === 'alert' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
