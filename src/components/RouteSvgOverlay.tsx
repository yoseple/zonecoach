import React from 'react';
import { generateRouteSvg } from '../utils/routeSvg';
import type { RoutePoint } from '../types';

interface Props {
  points: RoutePoint[];
  size?: number;
}

export const RouteSvgOverlay: React.FC<Props> = ({ points, size = 400 }) => {
  const svgString = generateRouteSvg(points, size, size);
  if (!svgString) return null;

  return (
    <div 
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};
