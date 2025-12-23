
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

      const moveX = deltaX / maxDistance;
      const moveY = deltaY / maxDistance;
      onMove(moveX, -moveY); // Invert Y-axis for typical joystick behavior
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
    handleMove(e.clientX, e.clientY);
  };

  // Touch Events
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent this touch from triggering camera controls
    const touch = e.changedTouches[0];
    if (touch && touchIdRef.current === null) {
      touchIdRef.current = touch.identifier;
      isDraggingRef.current = true;
      handleMove(touch.clientX, touch.clientY);
    }
  };
  
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
        if(isDraggingRef.current) {
            handleMove(e.clientX, e.clientY);
        }
    };
    
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

    const handleGlobalMouseUp = () => {
        handleEnd();
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
        if(isDraggingRef.current && touchIdRef.current !== null) {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === touchIdRef.current) {
                    handleEnd();
                    break;
                }
            }
        }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchmove', handleGlobalTouchMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalTouchEnd);
    window.addEventListener('touchcancel', handleGlobalTouchEnd);

    return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('touchmove', handleGlobalTouchMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('touchend', handleGlobalTouchEnd);
        window.removeEventListener('touchcancel', handleGlobalTouchEnd);
    }
  }, [handleMove, handleEnd]);


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
