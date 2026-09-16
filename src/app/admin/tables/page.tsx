'use client';

import React, { useState, useEffect } from 'react';
import { cafeStore, subscribeToStore } from '@/lib/store';
import { Table, Restaurant } from '@/types';
import { ClientQRCode } from '@/components/common/ClientQRCode';
import { useClientOrigin } from '@/lib/useClientOrigin';
import { QRCodeModal } from '@/components/admin/QRCodeModal';
import {
  QrCode,
  Plus,
  Download,
  Printer,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');

  const refreshData = () => {
    const rId = cafeStore.getActiveRestaurantId();
    const r = cafeStore.getRestaurantById(rId);
    setRestaurant(r || null);
    if (r) {
      setTables(cafeStore.getTables(r.id));
    }
  };

  useEffect(() => {
    refreshData();
    return subscribeToStore(refreshData);
  }, []);

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !newTableNumber.trim()) return;
    cafeStore.addTable(restaurant.id, newTableNumber.trim());
    setNewTableNumber('');
    refreshData();
  };

  const handleOpenQR = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const origin = useClientOrigin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Tables & QR Code Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Print-ready table tent QR codes linking directly to frictionless digital ordering
          </p>
        </div>

        <form onSubmit={handleAddTable} className="flex items-center gap-2">
          <input
            type="text"
            required
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            placeholder="e.g. 07 or Outdoor-1"
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </form>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
        {tables.map((table) => {
          const tablePath = `/r/${restaurant?.slug}/t/${table.table_number}`;
          const tableUrl = origin ? `${origin}${tablePath}` : tablePath;
          return (
            <div
              key={table.id}
              className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col items-center text-center group"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-xs font-bold text-slate-400">
                  {restaurant?.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>

              <div className="w-full py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 mb-4">
                <span className="text-lg font-black text-white">
                  Table {table.table_number}
                </span>
              </div>

              {/* QR Code SVG */}
              <div
                onClick={() => handleOpenQR(table)}
                className="p-3 bg-white rounded-2xl cursor-pointer shadow-md hover:scale-105 transition-transform inline-block"
                title="Click to expand & download print format"
              >
                <ClientQRCode
                  path={tablePath}
                  size={140}
                  level="M"
                  includeMargin={true}
                />
              </div>

              <p className="text-[10px] text-slate-400 mt-3 font-mono truncate w-full">
                {tableUrl}
              </p>

              <div className="grid grid-cols-2 gap-2 w-full mt-4 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => handleOpenQR(table)}
                  className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <a
                  href={tablePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open URL</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Modal */}
      {restaurant && (
        <QRCodeModal
          table={selectedTable}
          restaurant={restaurant}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
