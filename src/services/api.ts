import {
  Incident,
  DepartmentInfo,
  Department,
  CityStats,
  CityAlert,
  AIRecommendation,
  IncidentStatus,
  DepartmentName,
  IncidentCategory,
  IncidentSeverity,
  NotificationItem,
} from '../types';
import {
  INITIAL_INCIDENTS,
  INITIAL_DEPARTMENTS,
  INITIAL_CITY_STATS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ALERTS,
} from '../data/mockData';

const STORAGE_KEYS = {
  INCIDENTS: 'citypulse_incidents',
  DEPARTMENTS: 'citypulse_departments',
  STATS: 'citypulse_stats',
  NOTIFICATIONS: 'citypulse_notifications',
  ALERTS: 'citypulse_alerts',
  EMERGENCY_ACTIVE: 'citypulse_emergency_active',
};

const sleep = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export class CityPulseApiService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = (import.meta as any).env?.VITE_API_URL || '';
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.INCIDENTS)) {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(INITIAL_INCIDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STATS)) {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(INITIAL_CITY_STATS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
    }
  }

  public resetToSampleData(): void {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(INITIAL_INCIDENTS));
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(INITIAL_CITY_STATS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
    localStorage.removeItem(STORAGE_KEYS.EMERGENCY_ACTIVE);
  }

  public async getIncidents(): Promise<Incident[]> {
    await sleep(60);
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/incidents`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('FastAPI backend unreachable, using local store:', err);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
    return raw ? JSON.parse(raw) : INITIAL_INCIDENTS;
  }

  public async getIncidentById(id: string): Promise<Incident | null> {
    const list = await this.getIncidents();
    return list.find((i) => i.id === id) || null;
  }

  public async createIncident(data: {
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
  }): Promise<Incident> {
    await sleep(100);
    const incidents = await this.getIncidents();
    const newId = `INC-GN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const priorityScore =
      data.severity === 'Critical'
        ? 95
        : data.severity === 'High'
        ? 75
        : data.severity === 'Medium'
        ? 55
        : 30;

    const newIncident: Incident = {
      id: newId,
      title: data.title,
      description: data.description,
      category: data.category,
      severity: data.severity,
      status: 'Reported',
      location: data.location,
      department: data.department,
      reportedAt: 'Just now',
      reporterName: data.reporterName || 'Command Center Dispatcher',
      estimatedResolutionMinutes: data.severity === 'Critical' ? 60 : 120,
      priorityScore,
    };

    const updated = [newIncident, ...incidents];
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(updated));

    // Update stats
    const stats = await this.getCityStats();
    stats.totalActiveIncidents += 1;
    if (stats.totalActive !== undefined) stats.totalActive += 1;
    if (data.severity === 'Critical') {
      stats.criticalIncidents += 1;
      if (stats.criticalCount !== undefined) stats.criticalCount += 1;
    }
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

    // Add alert notification
    await this.addNotification({
      title: `New ${data.severity} Incident Logged`,
      message: `${data.title} reported at ${data.location.sector}.`,
      type: data.severity === 'Critical' ? 'critical' : 'warning',
      incidentId: newId,
    });

    return newIncident;
  }

  public async updateIncidentStatus(
    id: string,
    newStatus: IncidentStatus
  ): Promise<Incident | null> {
    await sleep(80);
    const incidents = await this.getIncidents();
    const index = incidents.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const prevStatus = incidents[index].status;
    incidents[index].status = newStatus;
    if (newStatus === 'Resolved') {
      incidents[index].resolvedAt = 'Just now';
    }

    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));

    // Update stats if resolved
    if (newStatus === 'Resolved' && prevStatus !== 'Resolved') {
      const stats = await this.getCityStats();
      stats.resolvedToday += 1;
      if (incidents[index].severity === 'Critical' && stats.criticalIncidents > 0) {
        stats.criticalIncidents -= 1;
        if (stats.criticalCount !== undefined && stats.criticalCount > 0) {
          stats.criticalCount -= 1;
        }
      }
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    }

    return incidents[index];
  }

  public async updateIncident(
    id: string,
    updates: Partial<Incident>
  ): Promise<Incident | null> {
    await sleep(80);
    const incidents = await this.getIncidents();
    const index = incidents.findIndex((i) => i.id === id);
    if (index === -1) return null;

    incidents[index] = { ...incidents[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
    return incidents[index];
  }

  public async updateIncidentDepartment(
    id: string,
    department: DepartmentName
  ): Promise<Incident | null> {
    return this.updateIncident(id, { department });
  }

  public resetToDefaultData(): void {
    this.resetToSampleData();
  }

  public async markAlertAsRead(id: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    const alerts: CityAlert[] = raw ? JSON.parse(raw) : INITIAL_ALERTS;
    const updated = alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
  }

  public async clearAllAlerts(): Promise<void> {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    const alerts: CityAlert[] = raw ? JSON.parse(raw) : INITIAL_ALERTS;
    const updated = alerts.map((a) => ({ ...a, read: true }));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
  }


  public async deleteIncident(id: string): Promise<boolean> {
    await sleep(80);
    const incidents = await this.getIncidents();
    const filtered = incidents.filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(filtered));
    return true;
  }

  public async getCityStats(): Promise<CityStats> {
    await sleep(40);
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    return raw ? JSON.parse(raw) : INITIAL_CITY_STATS;
  }

  public async getDepartments(): Promise<DepartmentInfo[]> {
    await sleep(40);
    const raw = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    return raw ? JSON.parse(raw) : INITIAL_DEPARTMENTS;
  }

  public async getNotifications(): Promise<NotificationItem[]> {
    await sleep(40);
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
  }

  public async addNotification(item: {
    title: string;
    message: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    incidentId?: string;
  }): Promise<NotificationItem> {
    const list = await this.getNotifications();
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: item.title,
      message: item.message,
      timestamp: 'Just now',
      type: item.type,
      incidentId: item.incidentId,
      read: false,
    };
    const updated = [newItem, ...list.slice(0, 19)];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    return newItem;
  }

  public async markNotificationRead(id: string): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  }

  public async markAllNotificationsRead(): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  }

  public getEmergencyBroadcastStatus(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.EMERGENCY_ACTIVE) === 'true';
  }

  public setEmergencyBroadcastStatus(active: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_ACTIVE, active ? 'true' : 'false');
  }

  public async getAlerts(): Promise<CityAlert[]> {
    await sleep(40);
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return raw ? JSON.parse(raw) : INITIAL_ALERTS;
  }

  /**
   * AI City Assistant - Expert Municipal Dispatch Engine
   */
  public async getAIRecommendation(incident: Incident): Promise<AIRecommendation> {
    await sleep(120);

    let summary = '';
    let priorityExplanation = '';
    let riskFactor: 'Severe' | 'Elevated' | 'Moderate' | 'Controlled' = 'Moderate';
    let recommendedDepartment: DepartmentName = incident.department;
    let suggestedActions: string[] = [];
    let recommendedNextSteps: string[] = [];
    let equipmentNeeded: string[] = [];
    let citizenAdvisoryNotice = '';

    switch (incident.category) {
      case 'Water Leakage':
        summary = `High-volume hydraulic event detected at ${incident.location.sector}. Potential subsurface erosion and low water pressure across contiguous residential grids.`;
        if (incident.severity === 'Critical') {
          riskFactor = 'Severe';
          priorityExplanation =
            'CRITICAL SEVERITY: Risk of road embankment collapse and contaminated supply back-siphonage. Rapid valve isolation required within 20 minutes.';
          suggestedActions = [
            'Trigger SCADA telemetry to remotely isolate sluice valves at Sector Gate 4.',
            'Dispatch 2x High-Capacity Dewatering Pumps and heavy backhoe to site.',
            'Activate emergency potable water tanker supply along primary grid corridor.',
          ];
          recommendedNextSteps = [
            'Alert Traffic Police for immediate lane divergence around underpass.',
            'Broadcast pipeline pressure reduction advisory to local residential associations.',
            'Inspect secondary potable water pipeline for cross-contamination.',
          ];
          equipmentNeeded = ['Excavator 320D', 'High-Pressure Dewatering Pump', 'Ultrasonic Pipe Flaw Detector'];
          citizenAdvisoryNotice =
            'Greater Noida Jal Board urges residents of surrounding sectors to store potable water; water pressure will normalize by 18:00 hrs.';
        } else {
          riskFactor = 'Moderate';
          priorityExplanation =
            'Moderate water loss detected. Soil saturation is localized with minimal traffic impairment.';
          suggestedActions = [
            'Schedule field plumbing technician squad for flange replacement.',
            'Monitor smart ultrasonic meter for pressure anomalies.',
          ];
          recommendedNextSteps = ['Replace deteriorating gasket', 'Log asset age into municipal GIS register'];
          equipmentNeeded = ['Flange Gasket Kit', 'Manual Pressure Gauge'];
        }
        recommendedDepartment = 'Greater Noida Jal Board';
        break;

      case 'Traffic Congestion':
        summary = `Vehicle saturation index exceeding threshold on ${incident.location.address}. Arterial delay estimate: +35 mins.`;
        if (incident.severity === 'Critical') {
          riskFactor = 'Severe';
          priorityExplanation =
            'Major arterial choke point. Heavy vehicles obstructing emergency vehicle transit corridors towards hospitals and expressway.';
          suggestedActions = [
            'Deploy 50-ton hydraulic towing crane from Surajpur Depot.',
            'Override adaptive traffic signals at Pari Chowk to 240s green clearance wave.',
            'Redirect heavy transit via Eastern Peripheral Expressway slip roads.',
          ];
          recommendedNextSteps = [
            'Coordinate with Noida Traffic Police to throttle inbound traffic at Sector 148.',
            'Issue live map re-routing advisory on Greater Noida Smart City VMS digital signboards.',
          ];
          equipmentNeeded = ['Heavy Recovery Crane', 'Variable Message Signs (VMS)', 'Traffic Drones'];
          citizenAdvisoryNotice =
            'Commuters heading toward Knowledge Park are advised to divert via Noida-Greater Noida Expressway Outer Ring.';
        } else {
          riskFactor = 'Elevated';
          priorityExplanation =
            'Signal phase mismatch causing minor bottleneck. Normalizes within 40 minutes once timing is adjusted.';
          suggestedActions = ['Adjust signal cycle to prioritize congested north-south arm', 'Deploy one traffic marshal'];
          recommendedNextSteps = ['Inspect induction loop sensor', 'Calibrate camera detector'];
          equipmentNeeded = ['Handheld Signal Controller'];
        }
        recommendedDepartment = 'Traffic & Mobility Wing';
        break;

      case 'Garbage Overflow':
        summary = `Uncollected solid municipal refuse accumulating in public space at ${incident.location.sector}.`;
        if (incident.severity === 'Critical') {
          riskFactor = 'Severe';
          priorityExplanation =
            'Severe public health vector hazard and eco-zone contamination risk adjacent to water body or community perimeter.';
          suggestedActions = [
            'Dispatch Hazmat certified sanitation compactors and chemical containment gear.',
            'Isolate site with safety cordon tape and deploy anti-pathogen spray.',
            'Initiate surveillance camera trace on offending transport vehicles.',
          ];
          recommendedNextSteps = [
            'File regulatory violation under Environment Protection Act 1986.',
            'Perform soil sample chemical toxicity testing.',
          ];
          equipmentNeeded = ['Hazmat Suction Tanker', 'Microbial Disinfectant Sprayers', 'GPS Compactor Trucks'];
          citizenAdvisoryNotice =
            'Pedestrians advised to avoid unpaved pathway near perimeter while remediation squad operates.';
        } else {
          riskFactor = 'Moderate';
          priorityExplanation =
            'Standard overflow due to high weekend commercial footfall. Needs routine compactor collection.';
          suggestedActions = ['Route nearest 8-ton hydraulic compactor', 'Sanitize bin collection point'];
          recommendedNextSteps = ['Increase bin frequency from daily to bi-daily in high season'];
          equipmentNeeded = ['8-ton Compactor Truck', 'Lime Powder Powdering'];
        }
        recommendedDepartment = 'Waste & Sanitation Dept';
        break;

      case 'Air Pollution':
        summary = `Air quality monitors report dangerous atmospheric particulate surge (PM2.5 / PM10) at ${incident.location.sector}.`;
        riskFactor = incident.severity === 'Critical' ? 'Severe' : 'Elevated';
        priorityExplanation =
          'Severe respiratory threat to citizens in dense zones. Unpermitted industrial emissions or biomass combustion confirmed.';
        suggestedActions = [
          'Deploy Anti-Smog Water Cannons and misting trucks to suppress dust within 1km radius.',
          'Issue immediate Stop-Work and inspection notice to offending industrial facility.',
          'Mobilize UPPCB field officers to impound illegal combustion apparatus.',
        ];
        recommendedNextSteps = [
          'Alert nearby educational institutions and schools to restrict outdoor sports.',
          'Review real-time air quality index hourly until PM2.5 drops below 120.',
        ];
        equipmentNeeded = ['Anti-Smog Mobile Cannon', 'Continuous Emission Monitor', 'Fine Mist Tanker'];
        citizenAdvisoryNotice =
          'Vulnerable individuals, seniors, and children in Ecotech/Delta sectors should wear N95 masks.';
        recommendedDepartment = 'UPPCB Air Quality Monitoring';
        break;

      case 'Streetlight Failure':
        summary = `Lighting grid segment dark at ${incident.location.address}. Affecting road safety and pedestrian transit.`;
        riskFactor = incident.severity === 'High' ? 'Elevated' : 'Moderate';
        priorityExplanation =
          'Dark arterial road sector increases night collision hazard and reduces street surveillance efficacy.';
        suggestedActions = [
          'Dispatch Power Substation Lineman van with insulated cherry picker.',
          'Inspect central feeder pillar box fuse and remote telemetry unit.',
          'Reset automatic astronomical photocell timer.',
        ];
        recommendedNextSteps = [
          'Audit all LED fixtures along central boulevard for LED driver degradation.',
          'Verify remote smart lighting mesh connectivity.',
        ];
        equipmentNeeded = ['Cherry Picker Boom Lift', 'Digital Multimeter', 'Surge Suppressor Spares'];
        recommendedDepartment = 'Power & Urban Infrastructure';
        break;

      default:
        summary = `Urban infrastructure incident at ${incident.location.sector} requiring coordinated multi-agency response.`;
        riskFactor = 'Moderate';
        priorityExplanation = 'Standard municipal maintenance event requiring departmental queueing.';
        suggestedActions = ['Assign local ward engineer for preliminary damage assessment', 'Log work order in municipal ERP'];
        recommendedNextSteps = ['Inspect post-repair stability', 'Close ticket with photographic verification'];
        equipmentNeeded = ['Standard Maintenance Van'];
        recommendedDepartment = incident.department;
        break;
    }

    return {
      incidentId: incident.id,
      summary,
      priorityExplanation,
      priorityAnalysis: priorityExplanation,
      riskFactor,
      recommendedDepartment,
      suggestedActions,
      primaryActions: suggestedActions,
      recommendedNextSteps,
      secondaryActions: recommendedNextSteps,
      equipmentNeeded,
      citizenAdvisoryNotice,
      citizenAdvisory: citizenAdvisoryNotice,
      isSimulated: true,
      source: 'simulated_expert_engine',
    };
  }
}

export const api = new CityPulseApiService();
