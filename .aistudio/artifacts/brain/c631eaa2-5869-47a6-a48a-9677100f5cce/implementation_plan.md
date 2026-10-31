# CityPulse AI — Smart City Control Command Center

CityPulse AI is a centralized, high-density municipal operations and incident intelligence platform built for urban governance in Greater Noida, Uttar Pradesh. It unites real-time incident tracking, emergency broadcasts, GIS mapping, AI-guided dispatch recommendations, and cross-department analytics into a single command console.

> [!IMPORTANT]
> **User Review & Critical Decisions**
> - **Live Telemetry & Emergency Broadcasts**: Confirmed in Phase 1. A simulated real-time stream of incoming telemetry incidents with an emergency broadcast banner toggle will be integrated to showcase dynamic command center responsiveness for hackathon judges.
> - **AI City Assistant Intelligence**: Confirmed in Phase 1. Operates on a high-speed, domain-specific rule-based municipal expert system providing instant triage, root cause reasoning, department assignment, and prioritized action sequences, with an optional server-side Gemini 3.8 Flash live analysis bridge when `GEMINI_API_KEY` is present.
> - **Map Technology**: Leaflet with OpenStreetMap tiles styled for dark mode centering on Greater Noida (Pari Chowk, Knowledge Park, Alpha/Beta sectors, Ecotech) with severity-coded pulsating incident markers and interactive popups.
> - **Backend Readiness**: Full separation of data access into `src/services/api.ts` with TypeScript data contracts mirroring standard REST/FastAPI endpoints, backed by browser localStorage for seamless offline demoing.

---

## 1. Overview & Core Concept

- **What It Does**: Provides municipal commissioners, incident response teams, and city department heads (Water, Traffic, Sanitation, Pollution Control, Power & Lighting) a unified control room interface to detect, triage, dispatch, and analyze urban incidents across Greater Noida.
- **Target Audience & Persona**: Municipal administrators, smart city emergency dispatchers, and hackathon evaluators seeking a cohesive enterprise-grade operations console.
- **Key Value**: Replaces fragmented departmental silos with "One City. One Dashboard. Smarter Decisions." — accelerating emergency resolution times, improving spatial awareness via interactive GIS, and assisting operators with AI-suggested protocol checklists.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
- **Color Discipline**: Strict 60-30-10 distribution utilizing the required command center palette:
  - Canvas / Void (60%): Deep night navy (`#080F1D`)
  - Structural Surfaces (30%): Sidebar (`#0D1728`), Cards and Panels (`#131F33`), subtle hairline borders (`#1E2D4A` / `rgba(255,255,255,0.08)`)
  - Semantic Accents (10%): Primary Blue (`#3B82F6`), Critical Red (`#EF4444`), Warning Amber (`#F59E0B`), Operational Green (`#22C55E`), Crisp Header Text (`#F8FAFC`), Muted Secondary Text (`#94A3B8`)
- **Typography**: `Plus Jakarta Sans` for clean command typography, paired with monospace tabular figures (`font-mono tabular-nums`) for coordinates, incident IDs, response times, and telemetry.
- **Zero-Pill & Clean Metadata**: Incident priority, category, and department tags rendered with clean typography, dot indicators, and high-contrast color badges without over-rounded pill pills or visual clutter.

### Primary User Flows
1. **Command Center Hub**:
   - Top Bar with city health status (`All Systems Operational` / `Emergency Alert Active`), search, notification center, and active operator profile.
   - 4 Critical KPI cards with trend indicators: Total Active Incidents (248), Critical Incidents (12), Resolved Today (86), Average Response Time (18 min).
   - High-priority split view: Live interactive GIS Leaflet map on the left with incident clusters; Live Incident Activity feed and emergency broadcast controls on the right.
2. **Interactive City Map**:
   - Full-featured Leaflet GIS view focused on Greater Noida (latitude `28.4744`, longitude `77.5040`).
   - Category filtering (Water Leakage, Traffic Congestion, Garbage Overflow, Air Quality / Pollution, Streetlight Failure).
   - Custom SVG marker pins color-coded by severity (Critical `#EF4444`, High `#F59E0B`, Medium `#3B82F6`, Low `#22C55E`).
   - Rich popup card on marker click with quick triage button opening the AI Assistant or Incident Details.
3. **Incident Management Workspace**:
   - High-density data grid with search, multi-filter dropdowns (Category, Severity, Department, Status), sorting, and batch actions.
   - "New Incident" modal form allowing operators to log incidents with title, category, description, sector location, severity, and department.
   - Status update workflow (Reported -> In Progress -> Resolved) with instant local persistence.
4. **AI City Assistant & Dispatch**:
   - Interactive triage inspector: select any incident to view AI-generated incident summary, severity justification, recommended municipal department, protocol checklists, and next actionable steps.
   - Emergency advisory generation for citizen alert dissemination.
5. **Municipal Analytics Suite**:
   - Interactive Recharts components: Incidents by Category (Donut), Incidents by Severity (Bar), 7-Day Trend (Area Line), Department Response Performance (Horizontal Bar), and SLA Resolution metrics.
6. **Departments & System Settings**:
   - Department directory with active personnel, open ticket count, and operational readiness.
   - Simulated telemetry speed slider, sample data reset button, and backend API endpoint configuration preview.

---

## 3. Key Product Decisions & Trade-Offs

- **Leaflet Integration Strategy**:
  - *Decision*: Direct Leaflet instance lifecycle managed inside a dedicated React component (`CityMap.tsx`) with dark-themed CartoDB / OpenStreetMap tile layers.
  - *Why*: Direct Leaflet avoids React 19 dependency peer resolution issues with third-party wrappers while providing smooth custom pin rendering and map bounds auto-fit.
- **Data Architecture & FastAPI Separation**:
  - *Decision*: A dedicated `src/services/api.ts` abstraction layer implementing asynchronous methods (`getIncidents`, `createIncident`, `updateIncidentStatus`, `getAnalytics`, `getAIRecommendations`).
  - *Why*: Enables seamless transition between the local simulated storage engine (localStorage seeded from `src/data/mockData.ts`) and a real FastAPI backend URL via `VITE_API_URL` without changing UI code.
- **Dual-Engine AI City Assistant**:
  - *Decision*: Hybrid architecture. Default instant deterministic expert engine providing zero-latency tactical protocols tailored to municipal infrastructure, with an automatic fallback/switch to Gemini 3.8 Flash via a server endpoint `/api/ai/recommend` when a key is available.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CityPulse AI Top Navbar                         │
│  [Logo / Brand] ── [City Status: Operational] ── [Search] ── [Alerts]  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    │                                                               │
┌───▼─────────────────────┐  ┌──────────────────────────────────────▼───┐
│     Sidebar Nav         │  │              Active View Canvas          │
│ • Command Center (Home) │  │  ┌─────────────────────────────────────┐ │
│ • City Map (GIS)        │  │  │ 4 KPI Cards (Total, Critical, etc.) │ │
│ • Incidents (Table)     │  │  └─────────────────────────────────────┘ │
│ • AI Assistant (Triage) │  │  ┌──────────────────┬──────────────────┐ │
│ • Analytics (Charts)    │  │  │ Interactive Map  │ Live Telemetry   │ │
│ • Departments           │  │  │ Greater Noida    │ & AI Assistant   │ │
│ • Settings              │  │  └──────────────────┴──────────────────┘ │
└───┬─────────────────────┘  └──────────────────────────────────────┬───┘
    │                                                               │
    └───────────────────────────────┬───────────────────────────────┘
                                    │
            ┌───────────────────────▼───────────────────────┐
            │       Services Abstraction (src/services/api.ts)       │
            └───────┬───────────────────────────────┬───────┘
                    │                               │
        ┌───────────▼───────────┐       ┌───────────▼───────────┐
        │  Local Simulated DB   │       │ Optional Server Route │
        │  localStorage + Mock  │       │ Express + Gemini SDK  │
        └───────────────────────┘       └───────────────────────┘
```

### Data Model Definitions (`src/types/index.ts`)
- `Incident`: `{ id, title, description, category, severity, status, location: { address, sector, lat, lng }, department, reportedAt, resolvedAt?, reporterName, priorityScore }`
- `Department`: `{ id, name, head, contact, activePersonnel, activeIncidents, resolvedToday, avgResponseTimeMin }`
- `CityStats`: `{ totalActive, criticalCount, resolvedToday, avgResponseTimeMin, systemHealth }`
- `AIRecommendation`: `{ summary, priorityAnalysis, recommendedDepartment, primaryActions, secondaryActions, estimatedResolutionHours }`

---

## 5. Verification Plan

1. **Compilation & Type Safety**:
   - Execute `compile_applet` to verify zero TypeScript errors across React components, Leaflet types, and Recharts interfaces.
2. **Interactive Flow Testing**:
   - Verify map renders Greater Noida coordinates correctly with custom colored pins and working popups.
   - Verify filtering and searching in the Incident Table operates dynamically.
   - Verify "Add New Incident" form validates, logs an incident, updates the map, and recalculates KPIs.
   - Verify status transitions (e.g., Mark as Resolved) update state and store to localStorage.
   - Verify AI City Assistant displays comprehensive triage recommendations upon selecting any incident.
   - Verify charts in Analytics render with responsive dimensions.
   - Test Emergency Alert broadcast toggle across the dashboard.
