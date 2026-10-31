import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Snowflake,
  Wind,
  Droplets,
  Gauge,
  Compass,
  AlertTriangle,
  ShieldAlert,
  Waves,
  RefreshCw,
  MapPin,
  Flame,
  CheckCircle2,
  ChevronDown,
  Info,
  Radio,
  Send,
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  surfacePressure: number;
  isDay: number;
  uvIndex: number;
  tempMax: number;
  tempMin: number;
  hourly: Array<{
    time: string;
    temp: number;
    precipProb: number;
  }>;
}

interface AirQualityData {
  pm25: number;
  pm10: number;
  usAqi: number;
  europeanAqi: number;
}

interface MunicipalSector {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  keySensors: string;
}

const SECTORS: MunicipalSector[] = [
  {
    id: 'pari-chowk',
    name: 'Pari Chowk Central',
    description: 'GNIDA HQ & Primary Arterial Transit Hub',
    lat: 28.4744,
    lng: 77.5040,
    keySensors: 'Tower AQ-01, MetSens-Alpha',
  },
  {
    id: 'knowledge-park',
    name: 'Knowledge Park II & III',
    description: 'Institutional & IT Corridor, Underpass Catchment',
    lat: 28.4601,
    lng: 77.4988,
    keySensors: 'Submersible Flood-KP2, Air-Sens-14',
  },
  {
    id: 'ecotech',
    name: 'Ecotech Industrial Grid',
    description: 'Heavy Manufacturing & Freight Logistics Zone',
    lat: 28.4350,
    lng: 77.5312,
    keySensors: 'EmissionSens-Eco3, WindMast-East',
  },
  {
    id: 'surajpur',
    name: 'Surajpur Wetland & Techzone',
    description: 'Ecological Reserve & Bio-Diversity Catchment',
    lat: 28.5140,
    lng: 77.4870,
    keySensors: 'Hindon-DrainGauge-09, EcoWatch-North',
  },
  {
    id: 'alpha-commercial',
    name: 'Sector Alpha & Commercial Belt',
    description: 'High-Density Residential & Market Complex',
    lat: 28.4830,
    lng: 77.5140,
    keySensors: 'UrbanHeat-A1, Jal-Board-Telemetry',
  },
];

interface MunicipalWeatherWidgetProps {
  onDispatchAction?: (message: string) => void;
}

export const MunicipalWeatherWidget: React.FC<MunicipalWeatherWidgetProps> = ({
  onDispatchAction,
}) => {
  const [selectedSector, setSelectedSector] = useState<MunicipalSector>(SECTORS[0]);
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [directiveDispatched, setDirectiveDispatched] = useState<string | null>(null);

  // Weather & AQI states
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 31.4,
    apparentTemperature: 33.2,
    relativeHumidity: 54,
    precipitation: 0.0,
    weatherCode: 1,
    windSpeed: 11.8,
    windDirection: 110,
    surfacePressure: 1008,
    isDay: 1,
    uvIndex: 6.4,
    tempMax: 34.0,
    tempMin: 22.5,
    hourly: [
      { time: '12:00', temp: 31, precipProb: 5 },
      { time: '14:00', temp: 33, precipProb: 10 },
      { time: '16:00', temp: 32, precipProb: 15 },
      { time: '18:00', temp: 29, precipProb: 10 },
      { time: '20:00', temp: 26, precipProb: 5 },
      { time: '22:00', temp: 24, precipProb: 0 },
    ],
  });

  const [airQuality, setAirQuality] = useState<AirQualityData>({
    pm25: 78.4,
    pm10: 164.2,
    usAqi: 162,
    europeanAqi: 75,
  });

  // Fetch telemetry from Open-Meteo
  const fetchTelemetry = useCallback(
    async (sector: MunicipalSector, showSpin = true) => {
      if (showSpin) setIsRefreshing(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${sector.lat}&longitude=${sector.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,precipitation_probability,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=Asia%2FKolkata`;
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${sector.lat}&longitude=${sector.lng}&current=pm10,pm2_5,european_aqi,us_aqi&timezone=Asia%2FKolkata`;

        const [weatherRes, aqiRes] = await Promise.allSettled([
          fetch(weatherUrl, { signal: controller.signal }),
          fetch(aqiUrl, { signal: controller.signal }),
        ]);

        clearTimeout(timeoutId);

        if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
          const wData = await weatherRes.value.json();
          if (wData.current) {
            const current = wData.current;
            const daily = wData.daily || {};
            const hourly = wData.hourly || {};

            // Format next 6 hourly samples
            const nextHours: Array<{ time: string; temp: number; precipProb: number }> = [];
            const now = new Date();
            const currentHour = now.getHours();

            if (hourly.time && hourly.temperature_2m) {
              for (let i = currentHour; i < Math.min(currentHour + 6, hourly.time.length); i++) {
                const timeStr = hourly.time[i] ? hourly.time[i].substring(11, 16) : `${i}:00`;
                nextHours.push({
                  time: timeStr,
                  temp: Math.round(hourly.temperature_2m[i] ?? current.temperature_2m),
                  precipProb: Math.round(hourly.precipitation_probability ? hourly.precipitation_probability[i] || 0 : 0),
                });
              }
            }

            setWeather({
              temperature: Math.round(current.temperature_2m * 10) / 10,
              apparentTemperature: Math.round(current.apparent_temperature * 10) / 10,
              relativeHumidity: Math.round(current.relative_humidity_2m),
              precipitation: current.precipitation ?? 0,
              weatherCode: current.weather_code ?? 0,
              windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
              windDirection: current.wind_direction_10m ?? 0,
              surfacePressure: Math.round(current.surface_pressure ?? 1008),
              isDay: current.is_day ?? 1,
              uvIndex: daily.uv_index_max ? Math.round(daily.uv_index_max[0] * 10) / 10 : 5.8,
              tempMax: daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : 33,
              tempMin: daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : 22,
              hourly: nextHours.length > 0 ? nextHours : weather.hourly,
            });
          }
        }

        if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
          const aData = await aqiRes.value.json();
          if (aData.current) {
            setAirQuality({
              pm25: Math.round((aData.current.pm2_5 ?? 72) * 10) / 10,
              pm10: Math.round((aData.current.pm10 ?? 145) * 10) / 10,
              usAqi: Math.round(aData.current.us_aqi ?? 155),
              europeanAqi: Math.round(aData.current.european_aqi ?? 65),
            });
          }
        }

        setLastUpdated(new Date());
      } catch (err) {
        // Fallback gracefully maintains reliable contextual state for Greater Noida
        console.warn('Weather telemetry live fetch notice:', err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    fetchTelemetry(selectedSector, false);
    // Recurring telemetry update every 5 minutes
    const interval = setInterval(() => {
      fetchTelemetry(selectedSector, false);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedSector, fetchTelemetry]);

  // Decode WMO weather code to description and icon
  const getWeatherDescriptor = (code: number, isDay: number) => {
    switch (code) {
      case 0:
        return {
          label: isDay ? 'Clear Sky' : 'Clear Night',
          icon: <Sun className="w-8 h-8 text-amber-400" />,
          color: 'text-amber-400',
        };
      case 1:
      case 2:
        return {
          label: isDay ? 'Partly Cloudy' : 'Partly Cloudy',
          icon: <Cloud className="w-8 h-8 text-sky-400" />,
          color: 'text-sky-400',
        };
      case 3:
        return {
          label: 'Overcast',
          icon: <Cloud className="w-8 h-8 text-slate-400" />,
          color: 'text-slate-400',
        };
      case 45:
      case 48:
        return {
          label: 'Fog / Hazy Smog',
          icon: <CloudFog className="w-8 h-8 text-amber-300" />,
          color: 'text-amber-300',
        };
      case 51:
      case 53:
      case 55:
        return {
          label: 'Light Drizzle',
          icon: <CloudDrizzle className="w-8 h-8 text-blue-400" />,
          color: 'text-blue-400',
        };
      case 61:
      case 63:
      case 65:
        return {
          label: 'Rainfall',
          icon: <CloudRain className="w-8 h-8 text-blue-500" />,
          color: 'text-blue-400',
        };
      case 80:
      case 81:
      case 82:
        return {
          label: 'Localized Showers',
          icon: <CloudRain className="w-8 h-8 text-cyan-400" />,
          color: 'text-cyan-400',
        };
      case 95:
      case 96:
      case 99:
        return {
          label: 'Thunderstorm',
          icon: <CloudLightning className="w-8 h-8 text-purple-400" />,
          color: 'text-purple-400',
        };
      case 71:
      case 73:
      case 75:
        return {
          label: 'Hail / Sleet',
          icon: <Snowflake className="w-8 h-8 text-cyan-200" />,
          color: 'text-cyan-200',
        };
      default:
        return {
          label: 'Fair / Atmospheric Haze',
          icon: <Sun className="w-8 h-8 text-amber-400" />,
          color: 'text-amber-400',
        };
    }
  };

  // Cardinal direction from degrees
  const getWindCardinal = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((deg % 360) / 22.5) % 16;
    return directions[index];
  };

  // AQI classification according to Indian CPCB / US AQI norms
  const getAqiStatus = (aqi: number) => {
    if (aqi <= 50) {
      return {
        label: 'Good',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        badgeColor: 'bg-emerald-500',
        description: 'Clean ambient air. Baseline conditions.',
      };
    } else if (aqi <= 100) {
      return {
        label: 'Moderate',
        color: 'text-lime-400',
        bgColor: 'bg-lime-500/10',
        borderColor: 'border-lime-500/30',
        badgeColor: 'bg-lime-500',
        description: 'Acceptable; sensitive individuals take precaution.',
      };
    } else if (aqi <= 150) {
      return {
        label: 'Unhealthy for Sensitive',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        badgeColor: 'bg-amber-500',
        description: 'GRAP Stage-I advisory active for dust suppression.',
      };
    } else if (aqi <= 200) {
      return {
        label: 'Poor / Unhealthy',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        badgeColor: 'bg-orange-500',
        description: 'GRAP Stage-II: Mist cannons deployed at key junctions.',
      };
    } else if (aqi <= 300) {
      return {
        label: 'Very Poor',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        badgeColor: 'bg-red-500',
        description: 'GRAP Stage-III: Construction ban & anti-smog guns active.',
      };
    } else {
      return {
        label: 'Severe / Hazardous',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        badgeColor: 'bg-purple-600',
        description: 'Emergency air protocol: Strict diesel generator restriction.',
      };
    }
  };

  const weatherDesc = getWeatherDescriptor(weather.weatherCode, weather.isDay);
  const aqiStatus = getAqiStatus(airQuality.usAqi);

  // Generate dynamic operational recommendations based on real readings
  const getMunicipalDirectives = () => {
    const directives = [];

    // Air Quality & Dust Control (UPPCB / Sanitation)
    if (airQuality.usAqi >= 150 || airQuality.pm25 >= 60) {
      directives.push({
        id: 'dir-aqi-high',
        department: 'UPPCB & Sanitation Wing',
        type: 'warning',
        icon: <ShieldAlert className="w-4 h-4 text-orange-400" />,
        directive: 'Anti-Smog Mist Cannons Deployed',
        action: `Elevated PM2.5 (${airQuality.pm25} µg/m³). Deploy mechanical sweeping & mobile mist cannons across ${selectedSector.name} & Noida-Gr Noida Expressway corridor.`,
        urgency: 'Immediate Action',
      });
    } else {
      directives.push({
        id: 'dir-aqi-ok',
        department: 'UPPCB & Sanitation Wing',
        type: 'normal',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        directive: 'Dust Suppression: Baseline Schedule',
        action: `Air quality at ${selectedSector.name} remains within monitored threshold (${airQuality.pm25} µg/m³ PM2.5). Maintain regular median washing.`,
        urgency: 'Routine Protocol',
      });
    }

    // Jal Board / Stormwater Drainage
    if (weather.precipitation > 0 || weather.hourly.some((h) => h.precipProb >= 35)) {
      directives.push({
        id: 'dir-rain',
        department: 'GNIDA Jal Board & Drainage',
        type: 'alert',
        icon: <Waves className="w-4 h-4 text-cyan-400" />,
        directive: 'Dewatering Pump Stations on Standby',
        action: `Rainfall detected / forecasted. Pre-position dewatering pumps at Knowledge Park II underpass, Surajpur drain culvert & Pari Chowk dip points.`,
        urgency: 'High Priority',
      });
    } else {
      directives.push({
        id: 'dir-drain-ok',
        department: 'GNIDA Jal Board & Drainage',
        type: 'normal',
        icon: <CheckCircle2 className="w-4 h-4 text-blue-400" />,
        directive: 'Stormwater Drains Flowing Clear',
        action: 'No waterlogging risk detected across primary GNIDA drainage outfalls into Hindon River.',
        urgency: 'Standby',
      });
    }

    // Traffic Police & Infrastructure
    if (weather.windSpeed >= 20) {
      directives.push({
        id: 'dir-wind',
        department: 'Traffic & Power Infrastructure',
        type: 'warning',
        icon: <Wind className="w-4 h-4 text-amber-400" />,
        directive: 'High Wind Caution: Overhead Asset Vigil',
        action: `Wind gusting at ${weather.windSpeed} km/h (${getWindCardinal(weather.windDirection)}). Inspect commercial hoarding signs and tree branches along Kasna-Surajpur link road.`,
        urgency: 'Advisory Active',
      });
    } else if (weather.weatherCode === 45 || weather.weatherCode === 48) {
      directives.push({
        id: 'dir-fog',
        department: 'Traffic Interceptor Cell',
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        directive: 'Reduced Visibility / Haze Protocol',
        action: 'Display dynamic 50 km/h speed warnings on Expressway Variable Message Signs (VMS).',
        urgency: 'Advisory Active',
      });
    } else if (weather.temperature >= 36) {
      directives.push({
        id: 'dir-heat',
        department: 'Public Health & Labor Dept',
        type: 'warning',
        icon: <Flame className="w-4 h-4 text-red-400" />,
        directive: 'Extreme Heat: Hydration Stations Active',
        action: `High ambient temperature (${weather.temperature}°C). Activate ORS and drinking water relief kiosks for municipal sanitation crews.`,
        urgency: 'Advisory Active',
      });
    } else {
      directives.push({
        id: 'dir-traffic-ok',
        department: 'Traffic & Infrastructure',
        type: 'normal',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        directive: 'Normal Roadway Conditions',
        action: `Surface wind (${weather.windSpeed} km/h) and visibility within safe municipal operating standards.`,
        urgency: 'Normal Ops',
      });
    }

    return directives;
  };

  const directives = getMunicipalDirectives();

  const handleDispatchAllDirectives = () => {
    const summary = `GNIDA Urban Telemetry Dispatch [${selectedSector.name}]: AQI ${airQuality.usAqi} (${aqiStatus.label}), Temp ${weather.temperature}°C, Wind ${weather.windSpeed} km/h ${getWindCardinal(weather.windDirection)}. Operational directives transmitted to Jal Board, UPPCB & Traffic Interceptors.`;
    setDirectiveDispatched(summary);
    if (onDispatchAction) {
      onDispatchAction(summary);
    }
    setTimeout(() => {
      setDirectiveDispatched(null);
    }, 4000);
  };

  return (
    <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl overflow-hidden shadow-lg shadow-black/20 transition-all">
      {/* Top Bar: Title, Sector Selector, and Realtime Telemetry Status */}
      <div className="px-5 py-4 border-b border-[#1E2D4A] flex flex-wrap items-center justify-between gap-4 bg-[#0F1829]/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase text-blue-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                GNIDA Telemetry Network
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                Greater Noida, UP
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Real-Time Weather & Environmental Telemetry
            </h2>
          </div>
        </div>

        {/* Action Controls & Sector Node Picker */}
        <div className="flex items-center gap-2.5">
          {/* Sector Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1B2942] hover:bg-[#223352] border border-[#2B3E63] rounded-lg text-xs font-medium text-slate-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{selectedSector.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isSectorDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#101B2E] border border-[#233554] rounded-lg shadow-2xl py-1 z-30">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-[#1E2D4A]">
                  Select Greater Noida Sector Sensor Node
                </div>
                {SECTORS.map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => {
                      setSelectedSector(sector);
                      setIsSectorDropdownOpen(false);
                      fetchTelemetry(sector, true);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col ${
                      selectedSector.id === sector.id
                        ? 'bg-blue-600/20 text-blue-300 font-semibold border-l-2 border-blue-400'
                        : 'text-slate-300 hover:bg-[#1A2840]'
                    }`}
                  >
                    <span className="font-medium text-white">{sector.name}</span>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5">
                      {sector.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchTelemetry(selectedSector, true)}
            disabled={isRefreshing}
            title="Fetch latest meteorological telemetry"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2942] hover:bg-[#223352] border border-[#2B3E63] rounded-lg text-xs font-medium text-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-300 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Environmental & Weather Grid */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 Cols): Live Current Weather & Atmosphere */}
        <div className="lg:col-span-5 bg-[#0D1728] border border-[#1E2D4A] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {selectedSector.keySensors}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {lastUpdated.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}{' '}
                IST
              </span>
            </div>

            {/* Main Temp & Condition */}
            <div className="flex items-center justify-between pt-2 pb-4 border-b border-[#1B2A45]">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#14223A] border border-[#203353]">
                  {weatherDesc.icon}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                      {weather.temperature}°C
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Feels {weather.apparentTemperature}°C
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">
                    {weatherDesc.label}
                  </div>
                </div>
              </div>

              {/* Day High / Low */}
              <div className="text-right font-mono text-xs space-y-0.5">
                <div className="text-rose-400 font-medium">H: {weather.tempMax}°C</div>
                <div className="text-sky-400 font-medium">L: {weather.tempMin}°C</div>
                <div className="text-[11px] text-slate-400 pt-0.5">
                  UV: <span className="text-amber-400 font-bold">{weather.uvIndex}</span>
                </div>
              </div>
            </div>

            {/* 4 Primary Meteorological Tiles */}
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              {/* Humidity */}
              <div className="bg-[#121E33] border border-[#1C2C47] rounded-lg p-2.5 flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400">Humidity</div>
                  <div className="text-sm font-bold text-white font-mono">
                    {weather.relativeHumidity}%
                  </div>
                </div>
              </div>

              {/* Wind Speed & Direction */}
              <div className="bg-[#121E33] border border-[#1C2C47] rounded-lg p-2.5 flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400">Wind Velocity</div>
                  <div className="text-sm font-bold text-white font-mono flex items-center gap-1">
                    <span>{weather.windSpeed} <span className="text-xs font-normal text-slate-400">km/h</span></span>
                    <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                      {getWindCardinal(weather.windDirection)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Precipitation */}
              <div className="bg-[#121E33] border border-[#1C2C47] rounded-lg p-2.5 flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400">
                  <CloudRain className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400">Precipitation</div>
                  <div className="text-sm font-bold text-white font-mono">
                    {weather.precipitation} mm
                  </div>
                </div>
              </div>

              {/* Surface Pressure */}
              <div className="bg-[#121E33] border border-[#1C2C47] rounded-lg p-2.5 flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400">Barometer</div>
                  <div className="text-sm font-bold text-white font-mono">
                    {weather.surfacePressure} <span className="text-[10px] text-slate-400 font-normal">hPa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6-Hour Micro-Forecast Strip */}
          <div className="mt-4 pt-3 border-t border-[#1B2A45]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Next 6 Hours Forecast</span>
              <span className="text-blue-400">Rain Prob.</span>
            </div>
            <div className="grid grid-cols-6 gap-1 text-center">
              {weather.hourly.map((hour, idx) => (
                <div
                  key={idx}
                  className="bg-[#121E33]/60 hover:bg-[#121E33] border border-[#1E2D4A] rounded-md p-1.5 transition-colors"
                >
                  <div className="text-[10px] text-slate-400 font-mono">{hour.time}</div>
                  <div className="text-xs font-bold text-white font-mono my-0.5">{hour.temp}°</div>
                  <div className="flex items-center justify-center gap-0.5 text-[9px] font-mono text-cyan-400">
                    <Droplets className="w-2.5 h-2.5" />
                    <span>{hour.precipProb}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center & Right Column (7 Cols): Air Quality & Municipal Operational Directives */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Air Quality Index (AQI) Banner - Critical for Greater Noida UPPCB monitoring */}
          <div
            className={`border rounded-xl p-4 transition-all ${aqiStatus.bgColor} ${aqiStatus.borderColor}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-current shrink-0 animate-pulse" />
                <span className="text-xs font-bold tracking-wider uppercase font-mono text-slate-300">
                  Air Quality Index (AQI) • UPPCB Monitoring
                </span>
              </div>
              <div
                className={`px-2.5 py-1 rounded-md text-xs font-black uppercase font-mono tracking-wide ${aqiStatus.color} bg-black/30 border border-current/20`}
              >
                {aqiStatus.label}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center mt-3">
              <div className="bg-[#0B1424]/80 border border-[#1F304E] rounded-lg p-3 text-center sm:text-left">
                <div className="text-[10px] font-mono uppercase text-slate-400">Overall US AQI</div>
                <div className={`text-3xl font-extrabold font-mono ${aqiStatus.color}`}>
                  {airQuality.usAqi}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{aqiStatus.description}</div>
              </div>

              <div className="bg-[#0B1424]/80 border border-[#1F304E] rounded-lg p-3">
                <div className="text-[10px] font-mono uppercase text-slate-400">PM2.5 (Fine Particles)</div>
                <div className="text-2xl font-bold font-mono text-white mt-0.5">
                  {airQuality.pm25} <span className="text-xs text-slate-400 font-normal">µg/m³</span>
                </div>
                <div className="text-[10px] text-orange-400 mt-0.5 font-medium">
                  {airQuality.pm25 > 60 ? 'Above CPCB safe limit (60)' : 'Within permissible limits'}
                </div>
              </div>

              <div className="bg-[#0B1424]/80 border border-[#1F304E] rounded-lg p-3">
                <div className="text-[10px] font-mono uppercase text-slate-400">PM10 (Inhalable Dust)</div>
                <div className="text-2xl font-bold font-mono text-white mt-0.5">
                  {airQuality.pm10} <span className="text-xs text-slate-400 font-normal">µg/m³</span>
                </div>
                <div className="text-[10px] text-amber-400 mt-0.5 font-medium">
                  {airQuality.pm10 > 100 ? 'Construction dust alert active' : 'Stable particulate load'}
                </div>
              </div>
            </div>
          </div>

          {/* Municipal Environmental Operational Directives */}
          <div className="bg-[#0D1728] border border-[#1E2D4A] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Municipal Operational Directives (Impact Matrix)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Auto-computed by CityPulse AI Engine
              </span>
            </div>

            <div className="space-y-2.5">
              {directives.map((dir) => (
                <div
                  key={dir.id}
                  className="bg-[#121E33] border border-[#1D2E4A] hover:border-[#2C446F] rounded-lg p-3 flex items-start gap-3 transition-colors"
                >
                  <div className="p-1.5 rounded bg-slate-800/80 border border-slate-700 mt-0.5 shrink-0">
                    {dir.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200">{dir.directive}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                        {dir.department}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{dir.action}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Municipal Advisory Broadcast Button */}
            <div className="mt-3.5 pt-3 border-t border-[#1E2D4A] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-[11px]">
                  Directives link live weather telemetry to GNIDA field operations.
                </span>
              </div>

              <button
                onClick={handleDispatchAllDirectives}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Environmental Directives</span>
              </button>
            </div>

            {/* Toast feedback upon broadcast */}
            {directiveDispatched && (
              <div className="mt-2 p-2 bg-emerald-500/15 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 font-mono flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{directiveDispatched}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
