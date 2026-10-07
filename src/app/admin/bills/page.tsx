'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
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
  RefreshCw,
} from 'lucide-react';

export default function AdminBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [search, setSearch] = useState('');

  const refreshBills = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const [s, list] = await Promise.all([
          supabaseService.getSettings(r.id),
          supabaseService.getBills(r.id),
        ]);
        setSettings(s);
        setBills(list);
      }
    } catch (e) {
      console.error('Error refreshing bills:', e);
    }
  };

  useEffect(() => {
    refreshBills();
  }, []);

  const handleSendWhatsApp = async (bill: Bill) => {
    if (!restaurant || !settings) return;
    const url = buildBillWhatsAppUrl({
      bill,
      restaurant,
      settings,
      customerName: bill.customer_name || 'Valued Guest',
      customerPhone: bill.customer_phone || '+919876543210',
      items: bill.items_snapshot || [],
    });
    await supabaseService.markBillWhatsAppSent(bill.id);
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
          <h1 className="text-2xl font-bold text-[#EDE7DF] tracking-tight">
            Bills & Digital Invoices
          </h1>
          <p className="text-xs text-[#A89887] mt-1">
            Generated customer receipts with one-click WhatsApp digital dispatch • {restaurant?.name}
          </p>
        </div>

        <div className="w-full sm:w-64">
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A6B5D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bill #, guest name..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] placeholder-[#7A6B5D] focus:outline-hidden focus:border-[#C29B72]"
            />
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#241D17] text-[#A89887] uppercase text-[10px] font-bold tracking-wider border-b border-[#2B221A]">
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
            <tbody className="divide-y divide-[#2B221A]/80 text-[#EDE7DF]">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#7A6B5D]">
                    No bills generated yet. Generate a bill from any order in the{' '}
                    <Link href="/admin/orders" className="text-[#C29B72] font-semibold hover:underline">
                      Live Orders
                    </Link>{' '}
                    screen.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-[#241D17] transition-colors">
                    <td className="p-4 font-mono font-bold text-[#EDE7DF]">#{b.bill_number}</td>
                    <td className="p-4">
                      <div className="font-semibold text-[#EDE7DF]">{b.customer_name || 'Guest'}</div>
                      <div className="text-[11px] text-[#A89887] font-mono">{b.customer_phone}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#241D17] text-[#D4AD85] border border-[#2B221A] font-semibold text-[11px]">
                        {b.table_number_snapshot ? `Table ${b.table_number_snapshot}` : 'Takeaway'}
                      </span>
                    </td>
                    <td className="p-4 text-[#A89887]">
                      {b.items_snapshot?.length || 0} items
                    </td>
                    <td className="p-4 font-bold text-[#D4AD85] text-sm">
                      {formatCurrency(b.total, currency)}
                    </td>
                    <td className="p-4 text-[#A89887]">
                      {new Date(b.generated_at).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendWhatsApp(b)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5F7A62] hover:bg-[#4E6751] text-[#FAF8F5] font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                          title="Open WhatsApp Click-to-Chat with pre-filled receipt"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                        {restaurant && (
                          <Link
                            href={`/r/${restaurant.slug}/bill/${b.id}`}
                            target="_blank"
                            className="p-1.5 rounded-xl bg-[#241D17] hover:bg-[#2B221A] text-[#A89887] hover:text-[#EDE7DF] border border-[#2B221A] transition-colors"
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
