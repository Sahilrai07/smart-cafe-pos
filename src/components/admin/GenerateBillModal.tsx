'use client';

import React, { useState } from 'react';
import { Order, Restaurant, RestaurantSettings, Bill } from '@/types';
import { cafeStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { buildBillWhatsAppUrl } from '@/lib/whatsapp';
import {
  Receipt,
  X,
  User,
  Phone,
  Send,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface GenerateBillModalProps {
  order: Order | null;
  restaurant: Restaurant;
  settings: RestaurantSettings;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bill: Bill) => void;
}

export const GenerateBillModal: React.FC<GenerateBillModalProps> = ({
  order,
  restaurant,
  settings,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState(order?.customer_name || 'Rahul Sharma');
  const [customerPhone, setCustomerPhone] = useState(order?.customer_phone || '+91 9876543210');
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState('');

  if (!isOpen || !order) return null;

  const currency = settings.currency || '₹';

  const handleGenerateAndOpenWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    // 1. Generate bill in store (this also upserts the customer into the CRM database!)
    const bill = cafeStore.generateBill({
      restaurant_id: restaurant.id,
      order_id: order.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      items: order.items || [],
      table_number: order.table_number_snapshot || '01',
    });

    // 2. Build personalized WhatsApp click-to-chat URL
    const url = buildBillWhatsAppUrl({
      bill,
      restaurant,
      settings,
      customerName,
      customerPhone,
      items: order.items || [],
    });

    setGeneratedBill(bill);
    setWhatsAppUrl(url);

    // 3. Mark sent & notify parent
    cafeStore.markBillWhatsAppSent(bill.id);
    onSuccess(bill);

    // 4. Open WhatsApp in new tab/app immediately
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black leading-tight">
                  Generate Bill • Order #{order.order_number}
                </h3>
                <p className="text-xs text-slate-400">
                  {order.table_number_snapshot ? `Table ${order.table_number_snapshot}` : 'Takeaway'} • {restaurant.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            {generatedBill ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">
                  Bill #{generatedBill.bill_number} Generated!
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Customer <strong>{customerName}</strong> ({customerPhone}) has been automatically added to your Customer Database.
                </p>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-emerald-900 font-bold">Total Amount:</span>
                    <span className="text-emerald-900 font-extrabold text-sm">
                      {formatCurrency(generatedBill.total, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>WhatsApp Link:</span>
                    <span className="text-emerald-700 font-semibold">Opened in WhatsApp</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>Re-open WhatsApp Bill Message</span>
                  </a>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Done & Return to Orders
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateAndOpenWhatsApp} className="space-y-4">
                {/* Items preview */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Order Items
                  </span>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700">
                      <span>
                        {item.item_name_snapshot} × {item.quantity}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(item.total, currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-slate-200 text-sm">
                    <span>Grand Total</span>
                    <span className="text-amber-600">{formatCurrency(order.total, currency)}</span>
                  </div>
                </div>

                {/* Asking customer for Name & WhatsApp (The Pitch Story!) */}
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-950 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Ask Customer:</strong> &ldquo;What name should I put on the bill?&rdquo; and &ldquo;Can I have your WhatsApp number for the digital bill?&rdquo;
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Customer Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. +91 9876543210"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      WhatsApp will open with the pre-filled personalized bill receipt.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all mt-3"
                >
                  <Send className="w-4 h-4" />
                  <span>Generate & Send Bill on WhatsApp</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
