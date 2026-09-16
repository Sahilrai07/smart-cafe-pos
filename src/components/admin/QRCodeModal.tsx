'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Restaurant, Table } from '@/types';
import { Download, Printer, X, QrCode } from 'lucide-react';

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

  if (!isOpen || !table) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://quick-bite-demo.vercel.app';
  const qrUrl = `${origin}/r/${restaurant.slug}/t/${table.table_number}`;

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
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <QrCode className="w-4 h-4 text-amber-500" />
              Table QR Code
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Printable Table Tent Card Preview */}
          <div className="p-6 text-center" ref={qrRef}>
            <div className="border-4 border-slate-900 rounded-3xl p-6 bg-amber-50/50 shadow-inner">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-2 font-black text-lg">
                ☕
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                {restaurant.name}
              </h2>
              <div className="inline-block my-2 px-4 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-extrabold tracking-widest uppercase">
                Table {table.table_number}
              </div>

              {/* QR Code SVG */}
              <div className="my-4 p-3 bg-white rounded-2xl shadow-sm inline-block border border-slate-200/80">
                <QRCodeSVG
                  value={qrUrl}
                  size={190}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="text-xs font-black text-slate-900">
                Scan with your phone camera
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                No app download required • Digital Menu & Ordering
              </p>
            </div>

            <p className="text-[10px] text-slate-400 mt-3 break-all">
              {qrUrl}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
