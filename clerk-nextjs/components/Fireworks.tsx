"use client";

import { useEffect, useRef } from "react";
import { Fireworks } from "fireworks-js";

export default function FireworksBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const fireworks = new Fireworks(containerRef.current, {
      autoresize: true,
      opacity: 0.15,
      acceleration: 1.02,
      friction: 0.98,
      gravity: 1.2,

      particles: 70,
      explosion: 6,

      intensity: 20,

      traceLength: 3,
      traceSpeed: 8,

      hue: {
        min: 0,
        max: 240,
      },

      delay: {
        min: 30,
        max: 60,
      },

      rocketsPoint: {
        min: 20,
        max: 80,
      }
    });

    fireworks.start();

    return () => fireworks.stop();
  }, []);

  return (
    <div
      ref={containerRef}
className="absolute inset-x-0 .top-[280px] bottom-0 pointer-events-none z-0"    />
  );
}