import type { RoutePoint } from '../types';

export const generateRouteSvg = (points: RoutePoint[], width: number = 400, height: number = 400, padding: number = 40): string => {
  if (!points || points.length < 2) return '';

  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const latRange = maxLat - minLat || 0.0001;
  const lngRange = maxLng - minLng || 0.0001;
  
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  
  const scale = Math.min(innerWidth / lngRange, innerHeight / latRange);
  
  const offsetX = (width - lngRange * scale) / 2;
  const offsetY = (height - latRange * scale) / 2;
  
  const project = (lat: number, lng: number) => {
    const x = (lng - minLng) * scale + offsetX;
    const y = height - ((lat - minLat) * scale + offsetY); // Flip Y for SVG coords
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  };
  
  const pathData = points.map(p => project(p.lat, p.lng)).join(' L ');
  const start = project(points[0].lat, points[0].lng);
  const end = project(points[points.length - 1].lat, points[points.length - 1].lng);

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <path d="M ${pathData}" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
      <circle cx="${start.split(',')[0]}" cy="${start.split(',')[1]}" r="6" fill="#10b981" stroke="white" stroke-width="2" />
      <circle cx="${end.split(',')[0]}" cy="${end.split(',')[1]}" r="6" fill="#ef4444" stroke="white" stroke-width="2" />
    </svg>
  `;
};
