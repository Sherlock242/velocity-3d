
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type JoystickProps = {
  onMove: (x: number, y: number) => void;
  onEnd: () => void;
  className?: string;
};

const Joystick: React.FC<JoystickProps> = ({ onMove, onEnd, className }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const knobRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef(false);
  const touchIdRef = React.useRef<number | null>(null);

  const handleMove = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current || !knobRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxDistance = rect.width / 2;
      
      const deadZone = 0.1 * maxDistance;

      let deltaX = clientX - centerX;
      let deltaY = clientY - centerY;

      let distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

      if (distance < deadZone) {
        // Inside dead zone, treat as no movement
        deltaX = 0;
        deltaY = 0;
        distance = 0;
        knobRef.current.style.transform = `translate(0px, 0px)`;
        onMove(0, 0);
        return;
      }
      
      // Normalize the vector if it exceeds maxDistance
      if (distance > maxDistance) {
        const scale = maxDistance / distance;
        deltaX *= scale;
        deltaY *= scale;
        distance = maxDistance;
      }

      knobRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

      let moveX = deltaX / maxDistance;
      let moveY = -deltaY / maxDistance; // Invert Y-axis for typical joystick behavior

      // Directional Snapping Logic
      const angle = Math.atan2(moveY, moveX) * (180 / Math.PI); // Angle in degrees
      const snapThreshold = 25; // Degrees

      // Snap to vertical axis (Up/Down)
      if (Math.abs(angle) > 90 - snapThreshold && Math.abs(angle) < 90 + snapThreshold) {
        moveX = 0;
      }
      // Snap to horizontal axis (Left/Right)
      else if (Math.abs(angle) < snapThreshold || Math.abs(angle) > 180 - snapThreshold) {
        moveY = 0;
      }

      // Re-normalize after snapping to ensure diagonal movement isn't faster
      const snappedMagnitude = Math.sqrt(moveX ** 2 + moveY ** 2);
      if (snappedMagnitude > 1) {
        moveX /= snappedMagnitude;
        moveY /= snappedMagnitude;
      }

      onMove(moveX, moveY);
    },
    [onMove]
  );

  const handleEnd = React.useCallback(() => {
    if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (knobRef.current) {
            knobRef.current.style.transform = 'translate(0, 0)';
        }
        onEnd();
    }
    touchIdRef.current = null;
  }, [onEnd]);

  // Mouse Events
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
        if(isDraggingRef.current) {
            handleMove(e.clientX, e.clientY);
        }
    };
    
    const handleGlobalMouseUp = () => {
        handleEnd();
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
  };

  // Touch Events
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (touch && touchIdRef.current === null) {
      touchIdRef.current = touch.identifier;
      isDraggingRef.current = true;
      
      const handleGlobalTouchMove = (e: TouchEvent) => {
          if(isDraggingRef.current && touchIdRef.current !== null) {
              for (let i = 0; i < e.changedTouches.length; i++) {
                  const touch = e.changedTouches[i];
                  if (touch.identifier === touchIdRef.current) {
                      handleMove(touch.clientX, touch.clientY);
                      break;
                  }
              }
          }
      };

      const handleGlobalTouchEnd = (e: TouchEvent) => {
          if(isDraggingRef.current && touchIdRef.current !== null) {
              for (let i = 0; i < e.changedTouches.length; i++) {
                  const touch = e.changedTouches[i];
                  if (touch.identifier === touchIdRef.current) {
                      handleEnd();
                      window.removeEventListener('touchmove', handleGlobalTouchMove);
                      window.removeEventListener('touchend', handleGlobalTouchEnd);
                      window.removeEventListener('touchcancel', handleGlobalTouchEnd);
                      break;
                  }
              }
          }
      };
      
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      window.addEventListener('touchend', handleGlobalTouchEnd);
      window.addEventListener('touchcancel', handleGlobalTouchEnd);
    }
  };
  
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-32 h-32 rounded-full bg-card/50 backdrop-blur-sm border-accent/20 flex items-center justify-center pointer-events-auto',
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        ref={knobRef}
        className="w-16 h-16 rounded-full bg-accent/30 border-2 border-accent transition-transform duration-75"
      ></div>
    </div>
  );
};

export default Joystick;
