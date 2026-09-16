'use client';

import React, { useState, useEffect } from 'react';
import { cafeStore, subscribeToStore } from '@/lib/store';
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
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const refreshCustomers = () => {
    const rId = cafeStore.getActiveRestaurantId();
    const r = cafeStore.getRestaurantById(rId);
    setRestaurant(r || null);
    if (r) {
      setSettings(cafeStore.getSettings(r.id));
      setCustomers(cafeStore.getCustomers(r.id));
    }
  };

  useEffect(() => {
    refreshCustomers();
    return subscribeToStore(refreshCustomers);
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
          <h1 className="text-2xl font-black text-white tracking-tight">
            Customer Database (CRM)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Built automatically from table bill transactions and Birthday Club joins
          </p>
        </div>

        <div className="w-full sm:w-64">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Total Customers</span>
          <div className="text-2xl font-black text-white mt-1">{customers.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Birthday Club Members</span>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {customers.filter((c) => c.birthday_club_member).length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Total Orders Logged</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {customers.reduce((acc, c) => acc + (c.total_visits || 1), 0)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Total Spend Recorded</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {formatCurrency(
              customers.reduce((acc, c) => acc + (c.total_spent || 0), 0),
              currency
            )}
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-slate-900/40 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        {c.name}
                        {c.birthday_club_member && (
                          <Cake className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                      </div>
                      {c.email && (
                        <div className="text-[11px] text-slate-500">{c.email}</div>
                      )}
                    </td>
                    <td className="p-4 font-mono">{c.phone}</td>
                    <td className="p-4">
                      {c.birthday ? (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-300">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {formatBirthdayDisplay(c.birthday)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {c.birthday_club_member ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          YES
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-white">{c.total_visits || 1}</td>
                    <td className="p-4 font-black text-amber-400 text-sm">
                      {formatCurrency(c.total_spent || 0, currency)}
                    </td>
                    <td className="p-4 text-slate-400">
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-colors"
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedCustomer(null)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedCustomer.phone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Total Visits
                  </span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {selectedCustomer.total_visits || 1}
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Total Spent
                  </span>
                  <div className="text-lg font-black text-amber-400 mt-0.5">
                    {formatCurrency(selectedCustomer.total_spent || 0, currency)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-500">Birthday:</span>
                  <span className="font-bold">
                    {selectedCustomer.birthday
                      ? formatBirthdayDisplay(selectedCustomer.birthday)
                      : 'Not recorded'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-500">Birthday Club:</span>
                  <span className="font-bold text-rose-400">
                    {selectedCustomer.birthday_club_member ? 'YES (Active)' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono">{selectedCustomer.email || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Last Visit:</span>
                  <span>
                    {selectedCustomer.last_visit
                      ? new Date(selectedCustomer.last_visit).toLocaleDateString()
                      : 'Today'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenWhatsAppChat(selectedCustomer.phone)}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
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
