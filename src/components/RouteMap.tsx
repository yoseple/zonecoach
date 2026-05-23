import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RoutePoint } from '../types';
import { MapPin, TrendingUp } from 'lucide-react';
import { calculateDistance, metersToMiles } from '../utils/gps';

// Fix for default marker icons in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Start Marker
const startIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #10b981; width: 14px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Custom Finish Marker
const finishIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #ef4444; width: 14px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Custom Mile Marker Icon
const createMileIcon = (mile: number) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #1e293b; color: white; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transform: translateY(-5px);">${mile}</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface RouteMapProps {
  points: RoutePoint[];
  distance?: number;
  duration?: string;
  pace?: string;
}

const FitBounds: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
    }
  }, [positions, map]);
  return null;
};

export const RouteMap: React.FC<RouteMapProps> = ({ points, distance, duration, pace }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Calculate mile markers
  const mileMarkers = useMemo(() => {
    if (!points || points.length < 2) return [];
    
    const markers: { mile: number, pos: [number, number] }[] = [];
    let cumulativeMeters = 0;
    let nextMileTarget = 1;

    for (let i = 1; i < points.length; i++) {
      const d = calculateDistance(points[i-1], points[i]);
      cumulativeMeters += d;
      const currentMiles = metersToMiles(cumulativeMeters);

      if (currentMiles >= nextMileTarget) {
        markers.push({ mile: nextMileTarget, pos: [points[i].lat, points[i].lng] });
        nextMileTarget++;
      }
    }
    return markers;
  }, [points]);

  if (!points || points.length === 0) {
    return (
      <div className="h-[400px] w-full rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-4">
        <MapPin size={40} className="text-slate-300" />
        <div className="text-center">
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Route Tracked</p>
          <p className="text-slate-300 text-[10px] font-bold mt-1">Manual activity or GPS disabled</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[400px] w-full rounded-[3rem] bg-slate-100 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading High-Res Map...</p>
      </div>
    );
  }

  const positions = points.map(p => [p.lat, p.lng] as [number, number]);
  const start = positions[0];
  const end = positions[positions.length - 1];

  return (
    <div className="group relative h-[450px] w-full max-w-full rounded-[3rem] overflow-hidden border border-slate-200 shadow-2xl transition-all duration-500 hover:shadow-blue-900/10">
      <MapContainer 
        center={start} 
        zoom={15} 
        scrollWheelZoom={false}
        zoomControl={false}
        className="h-full w-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline 
          positions={positions} 
          pathOptions={{
            color: '#3b82f6',
            weight: 7,
            opacity: 0.9,
            lineJoin: 'round',
            lineCap: 'round'
          }}
        />
        
        {/* Mile Markers */}
        {mileMarkers.map(m => (
          <Marker key={m.mile} position={m.pos} icon={createMileIcon(m.mile)} />
        ))}

        <Marker position={start} icon={startIcon}>
          <Popup><span className="font-black uppercase text-[10px]">Start Location</span></Popup>
        </Marker>
        <Marker position={end} icon={finishIcon}>
          <Popup><span className="font-black uppercase text-[10px]">Finish Location</span></Popup>
        </Marker>
        
        <FitBounds positions={positions} />
      </MapContainer>

      {/* Floating Stat Overlay - Strava Style */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col space-y-2 pointer-events-none max-w-[calc(100%-3rem)]">
         <div className="bg-white/95 backdrop-blur-xl border border-white p-4 md:p-5 rounded-[2rem] shadow-2xl shadow-black/10 flex items-center space-x-5 md:space-x-8 overflow-hidden">
            <div className="flex flex-col shrink-0">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Distance</p>
               <p className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-900 leading-none">
                  {distance ? distance.toFixed(2) : '--.--'} <span className="text-[10px] text-slate-400">mi</span>
               </p>
            </div>
            <div className="w-px h-8 bg-slate-100 shrink-0" />
            <div className="flex flex-col shrink-0">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Avg Pace</p>
               <p className="text-xl md:text-2xl font-black italic tracking-tighter text-blue-600 leading-none">
                  {pace || '--:--'} <span className="text-[10px] text-slate-400">/mi</span>
               </p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-100 shrink-0" />
            <div className="hidden sm:flex flex-col shrink-0">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Time</p>
               <p className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-900 leading-none">
                  {duration || '--:--'}
               </p>
            </div>
         </div>
      </div>

      {/* Bottom Right Actions */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col items-end space-y-2">
         <div className="bg-slate-900/95 backdrop-blur text-white px-4 py-2 rounded-2xl flex items-center space-x-2 shadow-xl border border-white/10">
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Performance Trail</span>
         </div>
      </div>
    </div>
  );
};
