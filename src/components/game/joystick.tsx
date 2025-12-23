
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
  const [isDragging, setIsDragging] = React.useState(false);
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
    if (!knobRef.current) return;
    setIsDragging(false);
    touchIdRef.current = null;
    knobRef.current.style.transform = 'translate(0, 0)';
    onEnd();
  }, [onEnd]);

  // Mouse Events
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = React.useCallback(() => {
    if (isDragging) {
      handleEnd();
    }
  }, [isDragging, handleEnd]);

  // Touch Events
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent this touch from triggering camera controls
    const touch = e.changedTouches[0];
    if (touch && touchIdRef.current === null) {
      touchIdRef.current = touch.identifier;
      setIsDragging(true);
      handleMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (isDragging) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === touchIdRef.current) {
            e.preventDefault();
            handleMove(touch.clientX, touch.clientY);
            break;
          }
        }
      }
    },
    [isDragging, handleMove]
  );

  const handleTouchEnd = React.useCallback(
    (e: TouchEvent) => {
      if (isDragging) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === touchIdRef.current) {
            handleEnd();
            break;
          }
        }
      }
    },
    [isDragging, handleEnd]
  );

  React.useEffect(() => {
    const currentContainer = containerRef.current;
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Use window for move/end to handle dragging outside the element
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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
