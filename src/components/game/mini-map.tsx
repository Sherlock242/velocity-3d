'use client';

import * as React from 'react';

type MiniMapProps = {
  carPosition: { x: number; z: number };
  gridSize: number;
  totalGridWidth: number;
};

const MAP_SIZE = 128; // size of the map in pixels

export default function MiniMap({
  carPosition,
  gridSize,
  totalGridWidth,
}: MiniMapProps) {
  const halfGridWidth = totalGridWidth / 2;

  // Convert car's world coordinates to map coordinates (0-1 range)
  const mapX = (carPosition.x + halfGridWidth) / totalGridWidth;
  const mapY = (carPosition.z + halfGridWidth) / totalGridWidth;

  const carStyle = {
    left: `${mapX * 100}%`,
    top: `${mapY * 100}%`,
  };

  return (
    <div
      className="relative bg-card"
      style={{ width: MAP_SIZE, height: MAP_SIZE }}
    >
      {/* Grid Lines */}
      <div className="absolute inset-0">
        {Array.from({ length: gridSize + 1 }).map((_, i) => {
          const pos = `${(i / gridSize) * 100}%`;
          return (
            <React.Fragment key={i}>
              {/* Vertical Line */}
              <div
                className="absolute bg-accent/20"
                style={{
                  left: pos,
                  top: 0,
                  width: 1,
                  height: '100%',
                }}
              />
              {/* Horizontal Line */}
              <div
                className="absolute bg-accent/20"
                style={{
                  top: pos,
                  left: 0,
                  height: 1,
                  width: '100%',
                }}
              />
            </React.Fragment>
          );
        })}
      </div>

      {/* Sector Numbers */}
      <div className="absolute inset-0">
        {Array.from({ length: gridSize * gridSize }).map((_, i) => {
          const sectorNumber = i + 1;
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;

          const cellWidth = 100 / gridSize;
          const cellHeight = 100 / gridSize;

          const sectorStyle = {
            left: `${col * cellWidth + cellWidth / 2}%`,
            top: `${row * cellHeight + cellHeight / 2}%`,
          };

          return (
            <div
              key={sectorNumber}
              className="absolute text-xs text-accent/50 font-bold transform -translate-x-1/2 -translate-y-1/2"
              style={sectorStyle}
            >
              {sectorNumber}
            </div>
          );
        })}
      </div>

      {/* Car Marker */}
      <div
        className="absolute w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={carStyle}
      />
    </div>
  );
}
