import type { RoutePoint } from '../types';

export const parseGPX = async (file: File): Promise<RoutePoint[]> => {
  const text = await file.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');
  const trkpts = xml.querySelectorAll('trkpt');
  
  const points: RoutePoint[] = [];
  trkpts.forEach((pt) => {
    const lat = parseFloat(pt.getAttribute('lat') || '0');
    const lng = parseFloat(pt.getAttribute('lon') || '0');
    const time = pt.querySelector('time')?.textContent || undefined;
    
    if (lat && lng) {
      points.push({ lat, lng, time });
    }
  });
  
  return points;
};
