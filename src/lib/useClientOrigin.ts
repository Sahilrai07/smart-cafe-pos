'use client';

import { useState, useEffect } from 'react';

// In-memory cache across all rendered components
let cachedOrigin = '';

// Known local Wi-Fi IP fallback for physical phone camera scanning
const DEFAULT_FALLBACK_IP = '192.168.31.81';

function getInitialOrigin(): string {
  if (typeof window === 'undefined') return '';

  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  // If already accessing on a LAN IP or domain (e.g. 192.168.31.81:3000 or vercel.app), use it
  if (!isLocalhost) {
    cachedOrigin = window.location.origin;
    return window.location.origin;
  }

  // If user or prior session saved LAN origin, use that
  try {
    const saved = localStorage.getItem('qb_lan_origin');
    if (saved) {
      cachedOrigin = saved;
      return saved;
    }
  } catch {}

  // Localhost fallback: construct phone-reachable LAN origin using the active port
  const port = window.location.port ? `:${window.location.port}` : ':3000';
  const fallback = `http://${DEFAULT_FALLBACK_IP}${port}`;
  cachedOrigin = fallback;
  return fallback;
}

/**
 * Hook to retrieve the phone-scannable origin.
 * Automatically resolves the machine's Wi-Fi IP (e.g. 'http://192.168.31.81:3000')
 * so scanning a QR code with a physical phone camera immediately connects over LAN
 * rather than failing with "localhost refused to connect".
 */
export function useClientOrigin(): string {
  const [origin, setOrigin] = useState<string>(() => cachedOrigin || getInitialOrigin());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen for origin changes from other components/settings
    const handleOriginChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setOrigin(customEvent.detail);
      }
    };
    window.addEventListener('qb-origin-updated', handleOriginChange);

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (!isLocalhost) {
      const current = window.location.origin;
      cachedOrigin = current;
      setOrigin(current);
      return () => {
        window.removeEventListener('qb-origin-updated', handleOriginChange);
      };
    }

    // Query server for latest detected LAN IP
    fetch('/api/network-ip')
      .then((res) => res.json())
      .then((data) => {
        if (data?.networkUrl) {
          cachedOrigin = data.networkUrl;
          try {
            localStorage.setItem('qb_lan_origin', data.networkUrl);
          } catch {}
          setOrigin(data.networkUrl);
        }
      })
      .catch((err) => {
        console.warn('Using default LAN IP fallback:', err);
      });

    return () => {
      window.removeEventListener('qb-origin-updated', handleOriginChange);
    };
  }, []);

  return origin;
}

/**
 * Manually update the client origin (e.g. if user connects to a different Wi-Fi hotspot)
 */
export function updateClientOrigin(newOrigin: string) {
  if (typeof window === 'undefined') return;
  const clean = newOrigin.trim().replace(/\/$/, '');
  cachedOrigin = clean;
  try {
    localStorage.setItem('qb_lan_origin', clean);
  } catch {}
  window.dispatchEvent(new CustomEvent('qb-origin-updated', { detail: clean }));
}

