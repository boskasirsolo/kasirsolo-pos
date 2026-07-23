'use client';

import { useState, useEffect, useCallback } from 'react';

export function useFloatingUI() {
  const [showWa, setShowWa] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [showMobileCta, setShowMobileCta] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    setShowWa(scrollTop > 400);
    setShowMobileCta(scrollTop > 600);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const dismissTooltip = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return {
    showWa,
    showTooltip,
    showMobileCta,
    dismissTooltip,
  };
}
