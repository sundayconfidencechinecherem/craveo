'use client';

import { useEffect, useState } from 'react';

export function useSplash(isAuthenticated: boolean, isLoading: boolean) {
  const [showSplash, setShowSplash] = useState(false);
  const [splashReady, setSplashReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      try {
        const splashTime = localStorage.getItem('craveo_splash_time');
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (!splashTime || now - Number(splashTime) > twentyFourHours) {
          setShowSplash(true);
          localStorage.setItem('craveo_splash_time', now.toString());
        }
      } catch (err) {
        console.warn('Splash storage error:', err);
      }

      setSplashReady(true);
    }
  }, [isAuthenticated, isLoading]);

  return {
    showSplash,
    splashReady,
    hideSplash: () => setShowSplash(false),
  };
}
