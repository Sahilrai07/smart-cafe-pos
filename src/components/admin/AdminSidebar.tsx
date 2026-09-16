'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cafeStore, subscribeToStore } from '@/lib/store';
import { Restaurant } from '@/types';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Receipt,
  Users,
  Cake,
  PartyPopper,
  BookOpen,
  QrCode,
  Tag,
  Settings,
  ExternalLink,
  ChevronDown,
  Building2,
  Menu,
  X,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState('');
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [upcomingBdayCount, setUpcomingBdayCount] = useState(0);

  const refreshData = () => {
    const all = cafeStore.getAllRestaurants();
    setRestaurants(all);
    const activeId = cafeStore.getActiveRestaurantId();
    setActiveRestaurantId(activeId);
    const curr = cafeStore.getRestaurantById(activeId) || all[0];
    setActiveRestaurant(curr || null);

    if (curr) {
      const orders = cafeStore.getOrders(curr.id);
      const newOrders = orders.filter((o) => o.status === 'NEW');
      setNewOrderCount(newOrders.length);

      const bdays = cafeStore.getUpcomingBirthdays(curr.id, 7);
      setUpcomingBdayCount(bdays.length);
    }
  };

  useEffect(() => {
    refreshData();
    return subscribeToStore(refreshData);
  }, []);

  const handleRestaurantSwitch = (id: string) => {
    cafeStore.setActiveRestaurantId(id);
    refreshData();
  };

  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Live Orders', href: '/admin/orders', icon: UtensilsCrossed, badge: newOrderCount },
    { name: 'Bills & Receipts', href: '/admin/bills', icon: Receipt },
    { name: 'Customer Database', href: '/admin/customers', icon: Users },
    { name: 'Birthday Club', href: '/admin/birthday-club', icon: Cake, badge: upcomingBdayCount, badgeColor: 'bg-rose-500' },
    { name: 'Party Bookings', href: '/admin/birthday-bookings', icon: PartyPopper },
    { name: 'Menu Items', href: '/admin/menu', icon: BookOpen },
    { name: 'Tables & QR Codes', href: '/admin/tables', icon: QrCode },
    { name: 'Offers & Promos', href: '/admin/offers', icon: Tag },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-900 text-sm">
            QB
          </div>
          <div>
            <h1 className="text-xs font-bold leading-tight">{activeRestaurant?.name || 'Cafe Admin'}</h1>
            <p className="text-[10px] text-slate-400">Admin Portal</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay on Mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-amber-500/20">
              ☕
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight leading-tight">
                CAFE SAAS
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Multi-Tenant
              </span>
            </div>
          </div>

          {/* Restaurant Switcher (Key Pitch Demonstration!) */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Active Restaurant:
            </label>
            <div className="relative">
              <select
                value={activeRestaurantId}
                onChange={(e) => handleRestaurantSwitch(e.target.value)}
                className="w-full appearance-none bg-slate-900 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-full text-white ${
                      item.badgeColor || 'bg-amber-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 space-y-2">
          {activeRestaurant && (
            <a
              href={`/r/${activeRestaurant.slug}/t/01`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700/60 text-xs font-bold transition-colors"
            >
              <span>View Table 01 Menu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <div className="text-[10px] text-center text-slate-500 pt-1">
            Free Tier • WhatsApp Click-to-Chat
          </div>
        </div>
      </aside>
    </>
  );
};
