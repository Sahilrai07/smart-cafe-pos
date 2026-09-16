'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Bill, Restaurant, RestaurantSettings } from '@/types';
import { cafeStore, subscribeToStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Printer, ArrowLeft, CheckCircle2, Gift, Utensils } from 'lucide-react';

export default function PublicBillPage() {
  const params = useParams();
  const slug = params.slug as string;
  const billId = params.billId as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);

  useEffect(() => {
    const r = cafeStore.getRestaurantBySlug(slug) || cafeStore.getAllRestaurants()[0];
    if (r) {
      setRestaurant(r);
      setSettings(cafeStore.getSettings(r.id));
      const bills = cafeStore.getBills(r.id);
      const found = bills.find((b) => b.id === billId || b.bill_number === billId);
      if (found) {
        setBill(found);
      } else if (bills.length > 0) {
        setBill(bills[0]);
      }
    }

    return subscribeToStore(() => {
      const updated = cafeStore.getRestaurantBySlug(slug);
      if (updated) {
        setRestaurant(updated);
        setSettings(cafeStore.getSettings(updated.id));
        const bills = cafeStore.getBills(updated.id);
        const found = bills.find((b) => b.id === billId || b.bill_number === billId);
        if (found) setBill(found);
      }
    });
  }, [slug, billId]);

  if (!restaurant || !settings) return null;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 print:bg-white print:p-0">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <Link
            href={`/r/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Menu
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>

        {/* Paper Receipt Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 relative overflow-hidden print:shadow-none print:border-none print:p-0">
          {/* Top Bar */}
          <div className="text-center pb-6 border-b-2 border-dashed border-slate-200">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt={restaurant.name}
                className="w-16 h-16 rounded-2xl mx-auto mb-2 object-cover border border-slate-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-2 font-bold">
                <Utensils className="w-6 h-6" />
              </div>
            )}
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">
              {restaurant.name}
            </h1>
            {restaurant.address && (
              <p className="text-xs text-slate-500 mt-0.5">{restaurant.address}</p>
            )}
            {restaurant.phone && (
              <p className="text-xs text-slate-400 mt-0.5">Tel: {restaurant.phone}</p>
            )}

            <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Paid / Settled
            </div>
          </div>

          {/* Metadata */}
          <div className="py-4 border-b border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Bill Number:</span>
              <span className="font-mono font-bold text-slate-900">
                #{bill?.bill_number || '1042'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Table:</span>
              <span className="font-bold text-slate-900">
                {bill?.table_number_snapshot || 'Table 04'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Customer:</span>
              <span className="font-bold text-slate-900">
                {bill?.customer_name || 'Guest'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date & Time:</span>
              <span className="font-medium text-slate-700">
                {new Date(bill?.generated_at || Date.now()).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </div>

          {/* Itemized list */}
          <div className="py-4 border-b-2 border-dashed border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider text-[10px] text-left">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {(bill?.items_snapshot && bill.items_snapshot.length > 0
                  ? bill.items_snapshot
                  : [
                      { item_name_snapshot: 'Classic Veg Burger', quantity: 1, unit_price_snapshot: 120, total: 120 },
                      { item_name_snapshot: 'Chilled Coke', quantity: 2, unit_price_snapshot: 40, total: 80 },
                      { item_name_snapshot: 'Crispy Fries', quantity: 1, unit_price_snapshot: 60, total: 60 },
                    ]
                ).map((item, i) => (
                  <tr key={i} className="py-2">
                    <td className="py-1.5 font-bold text-slate-900">{item.item_name_snapshot}</td>
                    <td className="py-1.5 text-center">{item.quantity}</td>
                    <td className="py-1.5 text-right">{formatCurrency(item.unit_price_snapshot, settings.currency)}</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">{formatCurrency(item.total, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="py-4 space-y-1.5 text-xs text-slate-600 border-b border-slate-100">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(bill?.subtotal || 260, settings.currency)}
              </span>
            </div>
            {settings.tax_enabled && (
              <div className="flex justify-between">
                <span>GST ({settings.tax_percentage}%):</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(bill?.tax || 13, settings.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total:</span>
              <span className="text-amber-600 font-black">
                {formatCurrency(bill?.total || 273, settings.currency)}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 text-center">
            <p className="text-xs font-bold text-slate-800">Thank you for visiting! ❤️</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Please visit us again soon.</p>

            {/* Birthday Club Prompt */}
            <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 text-left print:hidden">
              <div className="flex items-center gap-2 text-xs font-black text-amber-950 mb-1">
                <Gift className="w-4 h-4 text-amber-600" />
                Join our Birthday Club! 🎂
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Receive a special birthday surprise and exclusive cafe vouchers.
              </p>
              <Link
                href={`/r/${slug}/birthday-club?name=${encodeURIComponent(bill?.customer_name || '')}&phone=${encodeURIComponent(bill?.customer_phone || '')}`}
                className="mt-2 inline-block text-xs font-extrabold text-amber-700 hover:text-amber-800 underline"
              >
                Join Birthday Club Now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
