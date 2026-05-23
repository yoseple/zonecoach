import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { RoutePoint } from '../types';

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

interface RouteMapProps {
  points: RoutePoint[];
}

const FitBounds: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [positions, map]);
  return null;
};

export const RouteMap: React.FC<RouteMapProps> = ({ points }) => {
  if (!points || points.length === 0) return null;

  const positions = points.map(p => [p.lat, p.lng] as [number, number]);
  const start = positions[0];
  const end = positions[positions.length - 1];

  return (
    <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden border shadow-inner bg-slate-100 relative">
      <MapContainer 
        center={start} 
        zoom={15} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline 
          positions={positions} 
          color="#3b82f6" 
          weight={5}
          opacity={0.8}
        />
        <Marker position={start}>
          <Popup><span className="font-black uppercase text-[10px]">Start Location</span></Popup>
        </Marker>
        <Marker position={end}>
          <Popup><span className="font-black uppercase text-[10px]">Finish Location</span></Popup>
        </Marker>
        <FitBounds positions={positions} />
      </MapContainer>
      
      <div className="absolute top-6 right-6 z-[1000]">
         <div className="bg-white/90 backdrop-blur shadow-xl px-4 py-2 rounded-2xl flex items-center space-x-2 border border-white">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Route Map</span>
         </div>
      </div>
    </div>
  );
};
