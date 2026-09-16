'use client';

import { useState, useEffect } from 'react';

/**
 * Returns the active origin on the client (e.g. 'http://localhost:3000', 'http://192.168.31.81:3000', or production domain).
 * Returns empty string during SSR to ensure safe hydration matching.
 */
export function useClientOrigin(): string {
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  return origin;
}
