'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cafeStore, subscribeToStore } from '@/lib/store';
import { Bill, Restaurant, RestaurantSettings } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { buildBillWhatsAppUrl } from '@/lib/whatsapp';
import {
  Receipt,
  Send,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';

export default function AdminBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [search, setSearch] = useState('');

  const refreshBills = () => {
    const rId = cafeStore.getActiveRestaurantId();
    const r = cafeStore.getRestaurantById(rId);
    setRestaurant(r || null);
    if (r) {
      setSettings(cafeStore.getSettings(r.id));
      setBills(cafeStore.getBills(r.id));
    }
  };

  useEffect(() => {
    refreshBills();
    return subscribeToStore(refreshBills);
  }, []);

  const handleSendWhatsApp = (bill: Bill) => {
    if (!restaurant || !settings) return;
    const url = buildBillWhatsAppUrl({
      bill,
      restaurant,
      settings,
      customerName: bill.customer_name || 'Valued Guest',
      customerPhone: bill.customer_phone || '+919876543210',
      items: bill.items_snapshot || [],
    });
    cafeStore.markBillWhatsAppSent(bill.id);
    window.open(url, '_blank');
  };

  const currency = settings?.currency || '₹';
  const filteredBills = bills.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.bill_number.toLowerCase().includes(q) ||
      (b.customer_name && b.customer_name.toLowerCase().includes(q)) ||
      (b.customer_phone && b.customer_phone.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Bills & WhatsApp Receipts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generated customer receipts with one-click WhatsApp Click-to-Chat dispatch
          </p>
        </div>

        <div className="w-full sm:w-64">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bill #, customer..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Bill #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Table</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No bills generated yet. Generate a bill from any order in the{' '}
                    <Link href="/admin/orders" className="text-amber-400 font-bold hover:underline">
                      Live Orders
                    </Link>{' '}
                    screen.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">#{b.bill_number}</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{b.customer_name || 'Guest'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{b.customer_phone}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-amber-400 font-bold text-[11px]">
                        {b.table_number_snapshot ? `Table ${b.table_number_snapshot}` : 'Takeaway'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {b.items_snapshot?.length || 0} items
                    </td>
                    <td className="p-4 font-black text-amber-400 text-sm">
                      {formatCurrency(b.total, currency)}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(b.generated_at).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendWhatsApp(b)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                          title="Open WhatsApp Click-to-Chat with pre-filled receipt"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                        {restaurant && (
                          <Link
                            href={`/r/${restaurant.slug}/bill/${b.id}`}
                            target="_blank"
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="View public digital receipt"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
