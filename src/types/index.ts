export type IncidentSeverity =
  | 'Critical'
  | 'High'
  | 'Medium'
  | 'Low'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export type IncidentCategory =
  | 'Water Leakage'
  | 'Traffic Congestion'
  | 'Garbage Overflow'
  | 'Air Pollution'
  | 'Streetlight Failure'
  | 'Drainage Backup'
  | 'Power Outage'
  | 'Road Damage'
  | 'water_leakage'
  | 'traffic_congestion'
  | 'garbage_overflow'
  | 'air_pollution'
  | 'streetlight_failure'
  | 'road_hazard'
  | 'power_outage';


export type IncidentStatus =
  | 'Reported'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'reported'
  | 'assigned'
  | 'in_progress'
  | 'resolved';

export type DepartmentName =
  | 'Greater Noida Jal Board'
  | 'Traffic & Mobility Wing'
  | 'Waste & Sanitation Dept'
  | 'UPPCB Air Quality Monitoring'
  | 'Power & Urban Infrastructure'
  | 'Emergency Disaster Services'
  | 'Water Supply & Sewage'
  | 'Traffic & Transport Authority'
  | 'Waste Management & Sanitation'
  | 'Pollution Control Board'
  | 'Electricity & Street Lighting'
  | 'Disaster Management & Safety';

export interface IncidentLocation {
  address: string;
  sector: string;
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: IncidentLocation;
  department: DepartmentName;
  reportedAt: string;
  resolvedAt?: string;
  reporterName: string;
  reporterContact?: string;
  assignedTeam?: string;
  estimatedResolutionMinutes?: number;
  priorityScore: number;
  aiRecommendedAction?: string;
}

export interface DepartmentInfo {
  id: string;
  name: DepartmentName;
  shortName?: string;
  code?: string;
  headOfficer?: string;
  head?: string;
  contactNumber?: string;
  phone?: string;
  activePersonnel: number;
  activeVehicles?: number;
  openIncidents?: number;
  activeIncidents?: number;
  resolvedToday: number;
  avgResponseTimeMin: number;
  operationalReadiness?: number;
  readiness?: number;
  description?: string;
}

export type Department = DepartmentInfo;

export interface CityStats {
  totalActiveIncidents: number;
  totalActive?: number;
  criticalIncidents: number;
  criticalCount?: number;
  resolvedToday: number;
  avgResponseTimeMin: number;
  cityHealthScore?: number;
  systemHealth?: 'nominal' | 'alert' | 'critical' | string;
  systemStatus?: 'Optimal' | 'Elevated Alert' | 'Emergency Protocol Active' | string;
}

export interface AIRecommendation {
  incidentId: string;
  summary: string;
  priorityExplanation?: string;
  priorityAnalysis?: string;
  riskFactor?: 'Severe' | 'Elevated' | 'Moderate' | 'Controlled' | string;
  urgencyRating?: string;
  recommendedDepartment: DepartmentName;
  suggestedActions?: string[];
  primaryActions?: string[];
  secondaryActions?: string[];
  recommendedNextSteps?: string[];
  equipmentNeeded?: string[];
  citizenAdvisoryNotice?: string;
  citizenAdvisory?: string;
  estimatedResolutionHours?: number;
  isSimulated?: boolean;
  source?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  incidentId?: string;
  read: boolean;
}

export interface CityAlert {
  id: string;
  type?: 'critical' | 'warning' | 'info';
  severity?: IncidentSeverity;
  title: string;
  message: string;
  timestamp: string;
  sector?: string;
  read?: boolean;
  active?: boolean;
  incidentId?: string;
}
