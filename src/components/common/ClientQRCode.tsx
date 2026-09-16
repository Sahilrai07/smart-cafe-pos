'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ClientQRCodeProps {
  path?: string; // Relative path e.g. "/r/quick-bite/t/01"
  value?: string; // Explicit full URL
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  className?: string;
  onUrlReady?: (fullUrl: string) => void;
}

export const ClientQRCode: React.FC<ClientQRCodeProps> = ({
  path,
  value,
  size = 180,
  level = 'M',
  includeMargin = true,
  className,
  onUrlReady,
}) => {
  const [origin, setOrigin] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      setOrigin(currentOrigin);
      const computedUrl =
        value ||
        (path ? `${currentOrigin}${path.startsWith('/') ? path : `/${path}`}` : currentOrigin);
      if (onUrlReady) {
        onUrlReady(computedUrl);
      }
    }
  }, [path, value, onUrlReady]);

  // SSR and initial client hydration render identical placeholder div to guarantee zero hydration mismatch
  if (!mounted || (!value && !origin)) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100/90 rounded-2xl flex flex-col items-center justify-center p-2 text-center border border-slate-200/70 shadow-inner ${className || ''}`}
      >
        <div className="w-8 h-8 rounded-lg border-2 border-slate-300 border-t-amber-500 animate-spin mb-1.5" />
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Loading QR
        </span>
      </div>
    );
  }

  const qrValue =
    value ||
    (path ? `${origin}${path.startsWith('/') ? path : `/${path}`}` : origin);

  return (
    <QRCodeSVG
      value={qrValue}
      size={size}
      level={level}
      includeMargin={includeMargin}
      className={className}
    />
  );
};
