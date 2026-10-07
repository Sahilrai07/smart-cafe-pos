'use client';

import React, { useState } from 'react';
import { Bell, Droplets, UtensilsCrossed, Sparkles, UserCheck, CheckCircle2, X } from 'lucide-react';
import { supabaseService } from '@/lib/services/supabaseService';
import { ServiceRequestType } from '@/types';

interface ServiceBellModalProps {
  restaurantId: string;
  tableNumber?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceBellModal({
  restaurantId,
  tableNumber = '01',
  isOpen,
  onClose,
}: ServiceBellModalProps) {
  const [submittingType, setSubmittingType] = useState<ServiceRequestType | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequest = async (type: ServiceRequestType, label: string) => {
    if (submittingType) return;
    setSubmittingType(type);

    try {
      await supabaseService.createServiceRequest({
        restaurant_id: restaurantId,
        table_number: tableNumber,
        type,
      });

      // Browser vibration if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 60, 40]);
      }

      setSuccessMessage(`${label} requested for Table ${tableNumber}. Staff notified!`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (e) {
      console.error('Service request error:', e);
    } finally {
      setSubmittingType(null);
    }
  };

  const options: { type: ServiceRequestType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      type: 'WATER',
      label: 'Drinking Water',
      desc: 'Bring a fresh bottle / glasses',
      icon: <Droplets className="w-5 h-5 text-[#6B8E9B]" />,
    },
    {
      type: 'CUTLERY',
      label: 'Cutlery & Napkins',
      desc: 'Extra forks, spoons, or tissues',
      icon: <UtensilsCrossed className="w-5 h-5 text-[#C29B72]" />,
    },
    {
      type: 'CLEAN_TABLE',
      label: 'Clean Table',
      desc: 'Clear empty plates or wipe table',
      icon: <Sparkles className="w-5 h-5 text-[#8A5C2B]" />,
    },
    {
      type: 'CALL_WAITER',
      label: 'Call Captain / Waiter',
      desc: 'Assistance with menu or questions',
      icon: <UserCheck className="w-5 h-5 text-[#5F7A62]" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#EAE3D8] animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F0E8] border border-[#EAE3D8] flex items-center justify-center text-[#8A5C2B]">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2A231E]">Service Bell</h3>
              <p className="text-xs text-[#7A6B5D]">Table {tableNumber} Assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EAE3D8] flex items-center justify-center text-[#7A6B5D] hover:text-[#2A231E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#EDF3EE] border border-[#5F7A62]/30 flex items-center gap-2.5 text-xs text-[#5F7A62] font-semibold animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
          {options.map((opt) => (
            <button
              key={opt.type}
              disabled={!!submittingType || !!successMessage}
              onClick={() => handleRequest(opt.type, opt.label)}
              className="flex items-start gap-3 p-3.5 rounded-2xl border border-[#EAE3D8] bg-[#FAF8F5] hover:bg-[#F5F0E8] hover:border-[#D4AD85] text-left transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE3D8] flex items-center justify-center shrink-0 shadow-2xs">
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#2A231E]">{opt.label}</div>
                <div className="text-[11px] text-[#8A7B6E] mt-0.5 line-clamp-1">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Note */}
        <p className="text-[11px] text-center text-[#A89887] mt-5">
          Staff will receive an instant chime on their terminal with Table {tableNumber}.
        </p>
      </div>
    </div>
  );
}
