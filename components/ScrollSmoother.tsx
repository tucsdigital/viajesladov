'use client';

import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

export default function ScrollSmoother() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.6,
      smoothWheel: true,
      wheelMultiplier: 1.1,
      lerp: 0.2,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
