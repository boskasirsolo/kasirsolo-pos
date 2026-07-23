'use client';

import { useRef, useCallback } from 'react';

export function useTestimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -364, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 364, behavior: 'smooth' });
    }
  }, []);

  return { scrollRef, scrollLeft, scrollRight };
}
