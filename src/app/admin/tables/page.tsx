'use client';

import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { Table, Restaurant } from '@/types';
import { ClientQRCode } from '@/components/common/ClientQRCode';
import { QRCodeModal } from '@/components/admin/QRCodeModal';
import {
  QrCode,
  Plus,
  Printer,
  Download,
  ExternalLink,
  Sparkles,
  X,
  CheckCircle2,
  RefreshCw,
  Wifi,
  Copy,
  Check,
  Edit2,
} from 'lucide-react';
import { useClientOrigin, updateClientOrigin } from '@/lib/useClientOrigin';

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [isEditingOrigin, setIsEditingOrigin] = useState(false);
  const [originInput, setOriginInput] = useState('');
  const [copied, setCopied] = useState(false);

  const origin = useClientOrigin();

  const refreshData = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const tbls = await supabaseService.getTables(r.id);
        setTables(tbls);
      }
    } catch (e) {
      console.error('Error loading tables:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !newTableNumber.trim()) return;
    await supabaseService.createTable(restaurant.id, newTableNumber.trim());
    setNewTableNumber('');
    await refreshData();
  };

  const handleOpenQR = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleSaveOrigin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originInput.trim()) return;
    updateClientOrigin(originInput.trim());
    setIsEditingOrigin(false);
  };

  const handleCopyOrigin = () => {
    if (!origin) return;
    navigator.clipboard.writeText(origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#EDE7DF] tracking-tight">
            Tables & QR Code Generator
          </h1>
          <p className="text-xs text-[#A89887] mt-1">
            Print-ready table tent QR standees linking directly to frictionless contactless menu • {restaurant?.name}
          </p>
        </div>

        <form onSubmit={handleAddTable} className="flex items-center gap-2">
          <input
            type="text"
            required
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            placeholder="e.g. 07 or Patio-1"
            className="px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] placeholder-[#7A6B5D] focus:outline-hidden focus:border-[#C29B72]"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs shadow-md shadow-[#C29B72]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </form>
      </div>

      {/* Network / Wi-Fi Origin Banner */}
      <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A] shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#5F7A62]/15 border border-[#5F7A62]/30 flex items-center justify-center text-[#9BB89E] shrink-0">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#EDE7DF]">
                  Phone Camera Scannable Origin
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#5F7A62]/20 text-[#9BB89E] border border-[#5F7A62]/30">
                  Wi-Fi Ready
                </span>
              </div>
              <p className="text-[11px] text-[#A89887] mt-0.5">
                All QR codes embed <span className="font-mono font-bold text-[#D4AD85]">{origin}</span> so phones on this Wi-Fi load the menu instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyOrigin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#241D17] hover:bg-[#2B221A] text-xs font-semibold text-[#EDE7DF] border border-[#2B221A] transition-colors cursor-pointer"
              title="Copy Base URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#9BB89E]" /> : <Copy className="w-3.5 h-3.5 text-[#A89887]" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => {
                setOriginInput(origin);
                setIsEditingOrigin(!isEditingOrigin);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#241D17] hover:bg-[#2B221A] text-xs font-semibold text-[#EDE7DF] border border-[#2B221A] transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#A89887]" />
              <span>{isEditingOrigin ? 'Cancel' : 'Change IP'}</span>
            </button>
          </div>
        </div>

        {isEditingOrigin && (
          <form onSubmit={handleSaveOrigin} className="pt-3 border-t border-[#2B221A] flex items-center gap-2">
            <span className="text-xs text-[#A89887]">Target Origin:</span>
            <input
              type="text"
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value)}
              placeholder="e.g. http://192.168.31.81:3000"
              className="flex-1 max-w-sm px-3 py-1.5 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] font-mono focus:outline-hidden focus:border-[#C29B72]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] text-xs font-bold transition-colors cursor-pointer"
            >
              Save & Apply
            </button>
          </form>
        )}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
        {tables.map((table) => {
          const restaurantSlug = restaurant?.slug || 'quick-bite';
          const tablePath = `/r/${restaurantSlug}/t/${table.table_number}`;
          const tableUrl = origin ? `${origin}${tablePath}` : tablePath;
          return (
            <div
              key={table.id}
              className="p-6 rounded-3xl bg-[#1C1713] border border-[#2B221A] hover:border-[#C29B72]/40 transition-all flex flex-col items-center text-center group shadow-xl"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-xs font-semibold text-[#A89887]">
                  {restaurant?.name}
                </span>
                {(() => {
                  if (table.status === 'OCCUPIED') {
                    const elapsedMins = table.seated_at
                      ? Math.floor((Date.now() - new Date(table.seated_at).getTime()) / (60 * 1000))
                      : 25;

                    if (elapsedMins > 75) {
                      return (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B35C4A]/20 text-[#DF9182] border border-[#B35C4A]/40 animate-pulse">
                          🔴 Idle ({elapsedMins}m)
                        </span>
                      );
                    }
                    if (elapsedMins > 45) {
                      return (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#D4AD85]/20 text-[#D4AD85] border border-[#D4AD85]/40">
                          🟡 Dining ({elapsedMins}m)
                        </span>
                      );
                    }
                    return (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#5F7A62]/20 text-[#9BB89E] border border-[#5F7A62]/40">
                        🟢 Active ({elapsedMins}m)
                      </span>
                    );
                  }
                  if (table.status === 'BILL_PENDING') {
                    return (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#D4AD85]/20 text-[#D4AD85] border border-[#D4AD85]/40">
                        🟡 Bill Pending
                      </span>
                    );
                  }
                  return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#241D17] text-[#8A7B6E] border border-[#2B221A]">
                      ⚪ Vacant
                    </span>
                  );
                })()}
              </div>

              <div className="w-full py-2 px-4 rounded-xl bg-[#241D17] border border-[#2B221A] mb-4">
                <span className="text-lg font-bold text-[#EDE7DF]">
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

              <p className="text-[10px] text-[#A89887] mt-3 font-mono truncate w-full">
                {tableUrl}
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 w-full mt-4 pt-3 border-t border-[#2B221A]">
                <button
                  onClick={() => handleOpenQR(table)}
                  className="py-2 px-2 rounded-xl bg-[#241D17] hover:bg-[#2B221A] text-[#EDE7DF] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[#2B221A] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#A89887]" />
                  <span>Download</span>
                </button>
                <a
                  href={tablePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open URL</span>
                </a>
              </div>

              {/* Anti-Prank Clear Table Action */}
              {table.status === 'OCCUPIED' && (
                <button
                  onClick={async () => {
                    if (restaurant) {
                      await supabaseService.clearTableSession(restaurant.id, table.table_number);
                      await refreshData();
                    }
                  }}
                  className="mt-2 w-full py-1.5 rounded-lg bg-[#2B1B18] hover:bg-[#3D231E] text-[#DF9182] border border-[#522922] text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Clear Table / Invalidate Session
                </button>
              )}
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
