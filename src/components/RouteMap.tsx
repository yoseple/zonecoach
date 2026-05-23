import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RoutePoint } from '../types';
import { MapPin, TrendingUp } from 'lucide-react';

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
  html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// Custom Finish Marker
const finishIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
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
      map.fitBounds(bounds, { padding: [40, 40], animate: true });
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

  if (!points || points.length === 0) {
    return (
      <div className="h-[400px] w-full rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-4">
        <MapPin size={40} className="text-slate-300" />
        <p className="text-slate-400 font-bold italic">No route data available for this activity.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[400px] w-full rounded-[2.5rem] bg-slate-100 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rendering Engine...</p>
      </div>
    );
  }

  const positions = points.map(p => [p.lat, p.lng] as [number, number]);
  const start = positions[0];
  const end = positions[positions.length - 1];

  // Logic to identify mile markers (simplified: take points at roughly mile intervals if possible)
  // In a real app, you'd use the distance property on points. Here we'll just show start/end for clarity.

  return (
    <div className="group relative h-[450px] w-full rounded-[3rem] overflow-hidden border border-slate-200 shadow-2xl transition-all duration-500 hover:shadow-blue-900/10">
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
            weight: 6,
            opacity: 0.9,
            lineJoin: 'round',
            lineCap: 'round'
          }}
        />
        <Marker position={start} icon={startIcon}>
          <Popup><span className="font-black uppercase text-[10px]">Start</span></Popup>
        </Marker>
        <Marker position={end} icon={finishIcon}>
          <Popup><span className="font-black uppercase text-[10px]">Finish</span></Popup>
        </Marker>
        
        <FitBounds positions={positions} />
      </MapContainer>

      {/* Floating Stat Overlay - Strava Style */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col space-y-2 pointer-events-none">
         <div className="bg-white/90 backdrop-blur-xl border border-white p-4 rounded-[2rem] shadow-2xl shadow-black/10 flex items-center space-x-6">
            <div className="flex flex-col">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Distance</p>
               <p className="text-xl font-black italic tracking-tighter text-slate-900 leading-none">
                  {distance ? distance.toFixed(2) : '--.--'} <span className="text-[10px] text-slate-400">mi</span>
               </p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Pace</p>
               <p className="text-xl font-black italic tracking-tighter text-blue-600 leading-none">
                  {pace || '--:--'} <span className="text-[10px] text-slate-400">/mi</span>
               </p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Time</p>
               <p className="text-xl font-black italic tracking-tighter text-slate-900 leading-none">
                  {duration || '--:--'}
               </p>
            </div>
         </div>
      </div>

      {/* Bottom Right Actions */}
      <div className="absolute bottom-6 right-6 z-[1000]">
         <div className="bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded-2xl flex items-center space-x-2 shadow-xl border border-white/10">
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Performance Route</span>
         </div>
      </div>
    </div>
  );
};
