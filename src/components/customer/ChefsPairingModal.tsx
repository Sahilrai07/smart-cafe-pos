'use client';

import React from 'react';
import { MenuItem } from '@/types';
import { Sparkles, Plus, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ChefsPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerItem: MenuItem | null;
  pairings: MenuItem[];
  onAddPairing: (item: MenuItem) => void;
  currency?: string;
}

export function ChefsPairingModal({
  isOpen,
  onClose,
  triggerItem,
  pairings,
  onAddPairing,
  currency = '₹',
}: ChefsPairingModalProps) {
  if (!isOpen || !triggerItem || pairings.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#EAE3D8] animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EAE3D8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F5F0E8] border border-[#EAE3D8] flex items-center justify-center text-[#C29B72]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-[#8A5C2B]">Chef's Recommendation</span>
              <h3 className="text-sm font-bold text-[#2A231E]">Pairs with your {triggerItem.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#EAE3D8] flex items-center justify-center text-[#7A6B5D] hover:text-[#2A231E]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pairing list */}
        <div className="space-y-2.5 mt-4">
          {pairings.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D8] hover:border-[#D4AD85] transition-all"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#EAE3D8]"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#F5F0E8] border border-[#EAE3D8] flex items-center justify-center shrink-0 text-xl font-bold text-[#C29B72]">
                  ☕
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      item.is_veg ? 'bg-[#5F7A62]' : 'bg-[#B35C4A]'
                    }`}
                  />
                  <h4 className="text-xs font-bold text-[#2A231E] truncate">{item.name}</h4>
                </div>
                {item.description && (
                  <p className="text-[11px] text-[#7A6B5D] line-clamp-1 mt-0.5">{item.description}</p>
                )}
                <div className="text-xs font-bold text-[#8A5C2B] mt-1">
                  {formatCurrency(item.price, currency)}
                </div>
              </div>

              <button
                onClick={() => {
                  onAddPairing(item);
                  onClose();
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#241D17] hover:bg-[#18130F] text-[#FAF8F5] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          ))}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl text-xs font-semibold text-[#7A6B5D] hover:text-[#2A231E] bg-[#FAF8F5] hover:bg-[#F5F0E8] transition-colors cursor-pointer"
        >
          No thanks, continue
        </button>
      </div>
    </div>
  );
}
