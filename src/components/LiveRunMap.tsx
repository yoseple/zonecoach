import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GPSPoint } from '../utils/gps';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  points: GPSPoint[];
  currentPoint: GPSPoint | null;
}

const AutoFollow: React.FC<{ point: GPSPoint | null }> = ({ point }) => {
  const map = useMap();
  useEffect(() => {
    if (point) {
      map.setView([point.lat, point.lng], map.getZoom());
    }
  }, [point, map]);
  return null;
};

export const LiveRunMap: React.FC<Props> = ({ points, currentPoint }) => {
  const [center, setCenter] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (currentPoint && center[0] === 0) {
      setCenter([currentPoint.lat, currentPoint.lng]);
    }
  }, [currentPoint, center]);

  const positions = points.map(p => [p.lat, p.lng] as [number, number]);

  if (!currentPoint && center[0] === 0) {
    return (
      <div className="h-64 w-full bg-slate-100 rounded-[2rem] flex items-center justify-center border border-slate-200 shadow-inner">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">Initializing Map...</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded-[2rem] overflow-hidden border border-slate-200 shadow-inner relative">
      <MapContainer 
        center={center[0] !== 0 ? center : [currentPoint!.lat, currentPoint!.lng]} 
        zoom={16} 
        zoomControl={false}
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
        {currentPoint && (
          <>
            <Circle 
              center={[currentPoint.lat, currentPoint.lng]} 
              radius={currentPoint.accuracy} 
              pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.1, stroke: false }}
            />
            <Marker position={[currentPoint.lat, currentPoint.lng]} />
            <AutoFollow point={currentPoint} />
          </>
        )}
      </MapContainer>
      <div className="absolute top-4 right-4 z-[1000]">
         <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-lg border border-white">
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-600 leading-none">Live Track</span>
         </div>
      </div>
    </div>
  );
};
