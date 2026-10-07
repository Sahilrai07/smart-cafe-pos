'use client';

import React, { useRef, useState } from 'react';
import { ClientQRCode } from '@/components/common/ClientQRCode';
import { useClientOrigin } from '@/lib/useClientOrigin';
import { Restaurant, Table } from '@/types';
import { Download, Printer, X, QrCode, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  table: Table | null;
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  table,
  restaurant,
  isOpen,
  onClose,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const origin = useClientOrigin();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !table) return null;

  const restaurantSlug = restaurant?.slug || 'quick-bite';
  const tablePath = `/r/${restaurantSlug}/t/${table.table_number}`;
  const qrUrl = origin ? `${origin}${tablePath}` : tablePath;

  const handleDownload = () => {
    if (!qrRef.current) return;
    const svgElement = qrRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 800, 800);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${restaurant.slug}-table-${table.table_number}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#14110E]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-sm rounded-3xl bg-[#FAF8F5] shadow-2xl overflow-hidden border border-[#EAE3D8] animate-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-[#EAE3D8] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2A231E]">
              <QrCode className="w-4 h-4 text-[#C29B72]" />
              Table QR Standee
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#F5F0E8] hover:bg-[#EAE3D8] text-[#7A6B5D] hover:text-[#2A231E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Printable Table Tent Card Preview */}
          <div className="p-6 text-center" ref={qrRef}>
            <div className="border-4 border-[#2A231E] rounded-3xl p-6 bg-[#F5F0E8] shadow-inner">
              <div className="w-10 h-10 rounded-2xl bg-[#C29B72]/20 border border-[#C29B72]/40 text-[#2A231E] flex items-center justify-center mx-auto mb-2 font-bold text-lg">
                ☕
              </div>
              <h2 className="text-base font-bold text-[#2A231E] tracking-tight">
                {restaurant.name}
              </h2>
              <div className="inline-block my-2 px-4 py-1 rounded-full bg-[#2A231E] text-[#D4AD85] text-xs font-bold tracking-widest uppercase">
                Table {table.table_number}
              </div>

              {/* QR Code SVG */}
              <div className="my-4 p-3 bg-white rounded-2xl shadow-sm inline-block border border-[#EAE3D8]">
                <ClientQRCode
                  path={tablePath}
                  size={190}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="text-xs font-bold text-[#2A231E]">
                Scan with your phone camera
              </p>
              <p className="text-[10px] text-[#7A6B5D] mt-0.5">
                No app download required • Digital Menu & Ordering
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-3 px-3 py-2 rounded-xl bg-[#F5F0E8] border border-[#EAE3D8] text-[#5A4D41] text-[11px] font-mono break-all">
              <span className="truncate">{qrUrl}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="shrink-0 p-1 rounded-md hover:bg-[#EAE3D8] text-[#5A4D41] transition-colors cursor-pointer"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#5F7A62]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#2A231E] hover:bg-[#3D322B] text-[#FAF8F5] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] text-xs font-bold transition-colors cursor-pointer shadow-md shadow-[#C29B72]/20"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Standee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
