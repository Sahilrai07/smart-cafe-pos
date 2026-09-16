'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cafeStore, subscribeToStore } from '@/lib/store';
import { Restaurant, RestaurantSettings, Order, UpcomingBirthday } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { formatBirthdayDisplay } from '@/lib/birthday';
import {
  UtensilsCrossed,
  Receipt,
  Users,
  Cake,
  TrendingUp,
  ArrowRight,
  Sparkles,
  QrCode,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<UpcomingBirthday[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const refresh = () => {
    const rId = cafeStore.getActiveRestaurantId();
    const r = cafeStore.getRestaurantById(rId);
    setRestaurant(r || null);
    if (r) {
      setSettings(cafeStore.getSettings(r.id));
      const ords = cafeStore.getOrders(r.id);
      setOrders(ords);
      const custs = cafeStore.getCustomers(r.id);
      setTotalCustomers(custs.length);
      const bdays = cafeStore.getUpcomingBirthdays(r.id, 7);
      setUpcomingBirthdays(bdays);
    }
  };

  useEffect(() => {
    refresh();
    return subscribeToStore(refresh);
  }, []);

  const currency = settings?.currency || '₹';
  const newOrders = orders.filter((o) => o.status === 'NEW');
  const activeOrders = orders.filter((o) => o.status === 'NEW' || o.status === 'PREPARING' || o.status === 'READY');
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 sm:p-8 text-slate-950 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-black uppercase tracking-wider bg-slate-950/10 px-3 py-1 rounded-full">
              Live Demo Pitch Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
              {restaurant?.name || 'Quick Bite Cafe'} Dashboard
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-900/80 mt-1 max-w-lg">
              Multi-tenant cafe ordering, kitchen display, digital bills, and WhatsApp Birthday Club.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/orders"
              className="px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              <span>Kitchen Display</span>
            </Link>
            {restaurant && (
              <a
                href={`/r/${restaurant.slug}/t/01`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-2xl bg-white/30 hover:bg-white/40 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Table 01 Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {formatCurrency(totalRevenue, currency)}
          </div>
          <span className="text-[10px] text-slate-500">From table orders</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Active Kitchen Orders</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            {activeOrders.length}
          </div>
          <span className="text-[10px] text-rose-400 font-bold">
            {newOrders.length} unaccepted new orders
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Customer Database</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {totalCustomers}
          </div>
          <span className="text-[10px] text-slate-500">Captured through bills</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Upcoming Birthdays</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Cake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">
            {upcomingBirthdays.length}
          </div>
          <span className="text-[10px] text-slate-500">Next 7 days</span>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Upcoming Birthdays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">
                      #{order.order_number}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-amber-400 border border-slate-800">
                      {order.table_number_snapshot ? `Table ${order.table_number_snapshot}` : 'Takeaway'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        order.status === 'NEW'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : order.status === 'PREPARING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {order.items?.map((i) => `${i.item_name_snapshot} (${i.quantity})`).join(', ')}
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-black text-amber-400 text-sm">
                    {formatCurrency(order.total, currency)}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Birthdays Alert Card */}
        <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Cake className="w-4 h-4 text-rose-400" />
              Birthdays (Next 7 Days)
            </h2>
            <Link
              href="/admin/birthday-club"
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {upcomingBirthdays.length === 0 ? (
            <div className="py-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80">
              <Cake className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No birthdays in the next 7 days.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingBirthdays.map((bday) => (
                <div
                  key={bday.customer_id}
                  className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-black text-white flex items-center gap-1.5">
                      {bday.name}
                      <span>🎂</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatBirthdayDisplay(bday.birthday)} • {bday.days_until === 0 ? 'Today!' : `${bday.days_until} days away`}
                    </div>
                  </div>

                  <Link
                    href="/admin/birthday-club"
                    className="px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[11px] transition-colors"
                  >
                    Send Offer
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/80">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 text-xs text-amber-300">
              <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
              <strong>Pitch Note:</strong> Show the cafe owner how the Birthday Club automatically flags customers every year without any staff manual entry!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
