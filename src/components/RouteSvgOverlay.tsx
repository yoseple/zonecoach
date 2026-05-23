import React from 'react';
import { generateRouteSvg } from '../utils/routeSvg';
import { RoutePoint } from '../types';

interface Props {
  points: RoutePoint[];
  color?: string;
  size?: number;
}

export const RouteSvgOverlay: React.FC<Props> = ({ points, color = 'white', size = 400 }) => {
  const svgString = generateRouteSvg(points, size, size);
  if (!svgString) return null;

  // We need to inject the color into the string if it's dynamic, 
  // but our utility already handles basic styling.
  
  return (
    <div 
      className="w-full h-full flex items-center justify-center pointer-events-none"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};
