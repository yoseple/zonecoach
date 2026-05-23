import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
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

export const RouteMap: React.FC<RouteMapProps> = ({ points }) => {
  if (points.length === 0) return null;

  const positions = points.map(p => [p.lat, p.lng] as [number, number]);
  const center = positions[Math.floor(positions.length / 2)];
  const start = positions[0];
  const end = positions[positions.length - 1];

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border shadow-inner bg-slate-100">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline 
          positions={positions} 
          color="#3b82f6" 
          weight={4}
          opacity={0.8}
        />
        <Marker position={start}>
          <Popup>Start</Popup>
        </Marker>
        <Marker position={end}>
          <Popup>Finish</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
