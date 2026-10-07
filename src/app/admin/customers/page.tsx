'use client';

import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { Customer, Restaurant, RestaurantSettings } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { formatBirthdayDisplay } from '@/lib/birthday';
import {
  Users,
  Search,
  Cake,
  Calendar,
  Phone,
  Mail,
  Send,
  X,
  History,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const refreshCustomers = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const [s, custs] = await Promise.all([
          supabaseService.getSettings(r.id),
          supabaseService.getCustomers(r.id),
        ]);
        setSettings(s);
        setCustomers(custs);
      }
    } catch (e) {
      console.error('Error refreshing customers:', e);
    }
  };

  useEffect(() => {
    refreshCustomers();
  }, []);

  const currency = settings?.currency || '₹';

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const handleOpenWhatsAppChat = (phone: string) => {
    const clean = phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#EDE7DF] tracking-tight">
            Customer Directory (CRM)
          </h1>
          <p className="text-xs text-[#A89887] mt-1">
            Built automatically from table bill transactions and Birthday Club registrations • {restaurant?.name}
          </p>
        </div>

        <div className="w-full sm:w-64">
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A6B5D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] placeholder-[#7A6B5D] focus:outline-hidden focus:border-[#C29B72]"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[11px] font-semibold text-[#A89887]">Total Guests</span>
          <div className="text-2xl font-bold text-[#EDE7DF] mt-1">{customers.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[11px] font-semibold text-[#A89887]">Birthday Club Members</span>
          <div className="text-2xl font-bold text-[#DF9182] mt-1">
            {customers.filter((c) => c.birthday_club_member).length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[11px] font-semibold text-[#A89887]">Total Visits Logged</span>
          <div className="text-2xl font-bold text-[#D4AD85] mt-1">
            {customers.reduce((acc, c) => acc + (c.total_visits || 1), 0)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[11px] font-semibold text-[#A89887]">Total Spend Recorded</span>
          <div className="text-2xl font-bold text-[#9BB89E] mt-1">
            {formatCurrency(
              customers.reduce((acc, c) => acc + (c.total_spent || 0), 0),
              currency
            )}
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#241D17] text-[#A89887] uppercase text-[10px] font-bold tracking-wider border-b border-[#2B221A]">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Birthday</th>
                <th className="p-4">Birthday Club</th>
                <th className="p-4">Visits</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Last Visit</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B221A]/80 text-[#EDE7DF]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#7A6B5D]">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-[#241D17] transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-[#EDE7DF] flex items-center gap-2">
                        {c.name}
                        {c.birthday_club_member && (
                          <Cake className="w-3.5 h-3.5 text-[#DF9182] shrink-0" />
                        )}
                      </div>
                      {c.email && (
                        <div className="text-[11px] text-[#A89887]">{c.email}</div>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[#A89887]">{c.phone}</td>
                    <td className="p-4">
                      {c.birthday ? (
                        <span className="inline-flex items-center gap-1 font-medium text-[#EDE7DF]">
                          <Calendar className="w-3 h-3 text-[#7A6B5D]" />
                          {formatBirthdayDisplay(c.birthday)}
                        </span>
                      ) : (
                        <span className="text-[#7A6B5D]">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {c.birthday_club_member ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B35C4A]/15 text-[#DF9182] border border-[#B35C4A]/30">
                          YES
                        </span>
                      ) : (
                        <span className="text-[#7A6B5D] text-[11px]">No</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-[#EDE7DF]">{c.total_visits || 1}</td>
                    <td className="p-4 font-bold text-[#D4AD85] text-sm">
                      {formatCurrency(c.total_spent || 0, currency)}
                    </td>
                    <td className="p-4 text-[#A89887]">
                      {c.last_visit
                        ? new Date(c.last_visit).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Today'}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenWhatsAppChat(c.phone)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#241D17] hover:bg-[#2B221A] text-[#9BB89E] border border-[#2B221A] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Details Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-[#14110E]/70 backdrop-blur-xs"
            onClick={() => setSelectedCustomer(null)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-[#1C1713] border border-[#2B221A] p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#EDE7DF]">{selectedCustomer.name}</h3>
                  <p className="text-xs text-[#A89887] font-mono mt-0.5">
                    {selectedCustomer.phone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-8 h-8 rounded-full bg-[#241D17] text-[#A89887] hover:text-[#EDE7DF] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#241D17] rounded-2xl border border-[#2B221A]">
                  <span className="text-[10px] text-[#A89887] uppercase font-semibold">
                    Total Visits
                  </span>
                  <div className="text-lg font-bold text-[#EDE7DF] mt-0.5">
                    {selectedCustomer.total_visits || 1}
                  </div>
                </div>
                <div className="p-3 bg-[#241D17] rounded-2xl border border-[#2B221A]">
                  <span className="text-[10px] text-[#A89887] uppercase font-semibold">
                    Total Spent
                  </span>
                  <div className="text-lg font-bold text-[#D4AD85] mt-0.5">
                    {formatCurrency(selectedCustomer.total_spent || 0, currency)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#EDE7DF]">
                <div className="flex justify-between py-1.5 border-b border-[#2B221A]">
                  <span className="text-[#A89887]">Birthday:</span>
                  <span className="font-semibold">
                    {selectedCustomer.birthday
                      ? formatBirthdayDisplay(selectedCustomer.birthday)
                      : 'Not recorded'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2B221A]">
                  <span className="text-[#A89887]">Birthday Club:</span>
                  <span className="font-semibold text-[#DF9182]">
                    {selectedCustomer.birthday_club_member ? 'YES (Active)' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2B221A]">
                  <span className="text-[#A89887]">Email:</span>
                  <span className="font-mono text-[#A89887]">{selectedCustomer.email || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#A89887]">Last Visit:</span>
                  <span>
                    {selectedCustomer.last_visit
                      ? new Date(selectedCustomer.last_visit).toLocaleDateString()
                      : 'Today'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenWhatsAppChat(selectedCustomer.phone)}
                className="w-full py-3 rounded-2xl bg-[#5F7A62] hover:bg-[#4E6751] text-[#FAF8F5] font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#5F7A62]/20 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Open Direct WhatsApp Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
