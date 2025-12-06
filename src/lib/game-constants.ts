import * as THREE from 'three';
import type { TrackTheme, Gear } from '@/lib/types';

export const TRACK_THEMES: Record<
  TrackTheme,
  { ground: THREE.Color; sky: THREE.Color; scenery: THREE.Color[] }
> = {
  Forest: {
    ground: new THREE.Color(0x228b22), // Grassy ground color
    sky: new THREE.Color(0xffa500), // Orange sunset
    scenery: [new THREE.Color(0x006400), new THREE.Color(0x004000)],
  },
  Desert: {
    ground: new THREE.Color(0xc2b280), // Sand color
    sky: new THREE.Color(0x8a2be2), // Purple/orange sunset
    scenery: [new THREE.Color(0x8b4513)],
  },
  City: {
    ground: new THREE.Color(0x004d00), // Dark green for city parks
    sky: new THREE.Color(0x00008b), // Dark blue evening
    scenery: [
      new THREE.Color(0x2c3e50),
      new THREE.Color(0x34495e),
      new THREE.Color(0x8e44ad),
      new THREE.Color(0xc0392b),
      new THREE.Color(0x2980b9),
    ],
  },
};

export const ROAD_WIDTH = 40;
export const GRID_SIZE = 5; // 5x5 grid
export const CELL_SIZE = 1000; // 1km per cell
export const TOTAL_GRID_WIDTH = GRID_SIZE * CELL_SIZE;
export const NUM_OBSTACLES = 50; // Increased for a larger area

export const GEAR_MAX_SPEEDS: Record<Gear, number> = {
  1: 22.22, // 80 km/h
  2: 61.11, // 220 km/h
  3: 100, // 360 km/h
};
