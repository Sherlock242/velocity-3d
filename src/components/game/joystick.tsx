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

  const handleMove = React.useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !knobRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    const maxDistance = rect.width / 2;
    const distance = Math.min(maxDistance, Math.sqrt(deltaX ** 2 + deltaY ** 2));
    const angle = Math.atan2(deltaY, deltaX);

    const knobX = distance * Math.cos(angle);
    const knobY = distance * Math.sin(angle);

    knobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`;

    const moveX = knobX / maxDistance;
    const moveY = knobY / maxDistance;
    onMove(moveX, -moveY); // Invert Y-axis for typical joystick behavior
  }, [onMove]);

  const handleEnd = React.useCallback(() => {
    if (!knobRef.current) return;
    setIsDragging(false);
    knobRef.current.style.transform = 'translate(0, 0)';
    onEnd();
  }, [onEnd]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX, e.clientY);
    }
  }, [isDragging, handleMove]);

  const handleMouseUp = React.useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  
  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [isDragging, handleMove]);
  
  const handleTouchEnd = React.useCallback(() => {
    handleEnd();
  }, [handleEnd]);


  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
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
        "relative w-32 h-32 rounded-full bg-card/50 backdrop-blur-sm border-accent/20 flex items-center justify-center pointer-events-auto",
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
