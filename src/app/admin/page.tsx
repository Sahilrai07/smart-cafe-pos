'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore, subscribeToStore } from '@/lib/store';
import {
  Restaurant,
  RestaurantSettings,
  Order,
  UpcomingBirthday,
  InventoryItem,
  Expense,
  Customer,
} from '@/types';
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
  ChefHat,
  CreditCard,
  Coins,
  Boxes,
  AlertTriangle,
  Building,
  Crown,
  ChevronRight,
  Coffee,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<UpcomingBirthday[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const refresh = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const [s, ords, custs, bdays, inv, exp] = await Promise.all([
          supabaseService.getSettings(r.id),
          supabaseService.getOrders(r.id),
          supabaseService.getCustomers(r.id),
          supabaseService.getUpcomingBirthdays(r.id, 7),
          supabaseService.getInventory(r.id),
          supabaseService.getExpenses(r.id),
        ]);
        setSettings(s);
        setOrders(ords);
        setCustomers(custs);
        setUpcomingBirthdays(bdays);
        setInventory(inv);
        setExpenses(exp);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    }
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(() => {
      refresh();
    });
    return unsub;
  }, []);

  const currency = settings?.currency || '₹';
  const newOrders = orders.filter((o) => o.status === 'NEW');
  const activeOrders = orders.filter((o) => o.status === 'NEW' || o.status === 'PREPARING' || o.status === 'READY');
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  // Financial calculations
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const estimatedCOGS = totalRevenue * 0.32; // ~32% food cost benchmark
  const estimatedNetProfit = totalRevenue - estimatedCOGS - totalExpenses;

  // Inventory alerts
  const lowStockItems = inventory.filter((item) => item.current_stock <= item.min_threshold);

  // Total loyalty coins in circulation
  const totalCoinsInCirculation = customers.reduce((acc, c) => acc + (c.loyalty_coins || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner - Refined Artisan Coffee House Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-[#241D17] via-[#1D1713] to-[#15110E] p-6 sm:p-8 text-[#FAF8F5] border border-[#352A20] shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#352920] text-[#D4AD85] text-xs font-semibold uppercase tracking-wider mb-2.5 border border-[#48372A]">
              <Coffee className="w-3.5 h-3.5 text-[#C29B72]" />
              <span>Modern Hospitality Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5]">
              {restaurant?.name || 'Quick Bite Cafe'} Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#A8988C] mt-1.5 max-w-xl leading-relaxed">
              Real-time cafe operations: QR table ordering, kitchen dispatch, touch POS register, automated WhatsApp guest loyalty & financial ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/admin/kitchen"
              className="px-4 py-2.5 rounded-2xl bg-[#28201A] hover:bg-[#322820] text-[#D4AD85] font-semibold text-xs flex items-center gap-2 border border-[#3E3126] transition-all shadow-xs"
            >
              <ChefHat className="w-4 h-4 text-[#C29B72]" />
              <span>Kitchen Display</span>
            </Link>
            <Link
              href="/admin/pos"
              className="px-4 py-2.5 rounded-2xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-xs flex items-center gap-2 shadow-md shadow-[#C29B72]/20 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Counter POS</span>
            </Link>
            {restaurant && (
              <a
                href={`/r/${restaurant.slug}/t/01`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-2xl bg-[#221A15] hover:bg-[#2C221B] text-[#D8C7B8] font-semibold text-xs flex items-center gap-1.5 border border-[#35281F] transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-[#C29B72]" />
                <span>Table 01 QR Menu</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A8988C]" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row - 6 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Sales */}
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8E7E73]">Total Sales</span>
            <div className="w-7 h-7 rounded-xl bg-[#C29B72]/15 text-[#D4AD85] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#FAF8F5] mt-2">
            {formatCurrency(totalRevenue, currency)}
          </div>
          <span className="text-[10px] text-[#A8988C]">QR + Counter POS</span>
        </div>

        {/* Active Kitchen Orders */}
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8E7E73]">Kitchen Queue</span>
            <div className="w-7 h-7 rounded-xl bg-[#B35C4A]/15 text-[#DF9182] flex items-center justify-center">
              <ChefHat className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#DFBD98] mt-2">
            {activeOrders.length}
          </div>
          <span className="text-[10px] text-[#C97B6B] font-medium">
            {newOrders.length} pending ticket{newOrders.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Net Profit */}
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8E7E73]">Est. Net Profit</span>
            <div className="w-7 h-7 rounded-xl bg-[#5F7A62]/15 text-[#9BB89E] flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl font-bold mt-2 ${estimatedNetProfit >= 0 ? 'text-[#9BB89E]' : 'text-[#DF9182]'}`}>
            {formatCurrency(estimatedNetProfit, currency)}
          </div>
          <span className="text-[10px] text-[#8E7E73]">After COGS & Ops</span>
        </div>

        {/* Inventory Low Stock Alert */}
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8E7E73]">Inventory</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${lowStockItems.length > 0 ? 'bg-[#B35C4A]/15 text-[#DF9182]' : 'bg-[#221B16] text-[#7A6B60]'}`}>
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl font-bold mt-2 ${lowStockItems.length > 0 ? 'text-[#DF9182]' : 'text-[#FAF8F5]'}`}>
            {lowStockItems.length} alert{lowStockItems.length === 1 ? '' : 's'}
          </div>
          <Link href="/admin/inventory" className="text-[10px] text-[#C29B72] hover:underline font-medium">
            {lowStockItems.length > 0 ? 'Restock needed' : 'Stock healthy'}
          </Link>
        </div>

        {/* Customer Database & Loyalty */}
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8E7E73]">Loyalty Coins</span>
            <div className="w-7 h-7 rounded-xl bg-[#C29B72]/15 text-[#D4AD85] flex items-center justify-center">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#D4AD85] mt-2">
            {totalCoinsInCirculation}
          </div>
          <span className="text-[10px] text-[#8E7E73]">In {customers.length} guest wallets</span>
        </div>

        {/* Birthday Club */}
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8E7E73]">Birthdays (7d)</span>
            <div className="w-7 h-7 rounded-xl bg-[#C29B72]/15 text-[#D4AD85] flex items-center justify-center">
              <Cake className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#D4AD85] mt-2">
            {upcomingBirthdays.length}
          </div>
          <Link href="/admin/birthday-club" className="text-[10px] text-[#C29B72] hover:underline font-medium">
            Send WhatsApp perk
          </Link>
        </div>
      </div>

      {/* Quick Launch Hub - 4 Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/kitchen"
          className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A] hover:border-[#3E3126] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#28201A] text-[#C29B72] border border-[#382B21] flex items-center justify-center mb-3">
              <ChefHat className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#FAF8F5] group-hover:text-[#D4AD85] transition-colors">
              Kitchen Display (KDS)
            </h3>
            <p className="text-xs text-[#8E7E73] mt-1 leading-relaxed font-normal">
              High-clarity cook tickets, countdown timers, checklist strikes, and ready notifications.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#C29B72]">
            <span>Open Kitchen Screen</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/pos"
          className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A] hover:border-[#3E3126] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#241E18] text-[#9BB89E] border border-[#352D24] flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#FAF8F5] group-hover:text-[#9BB89E] transition-colors">
              Counter POS & Billing
            </h3>
            <p className="text-xs text-[#8E7E73] mt-1 leading-relaxed font-normal">
              Speedy touch billing, loyalty lookup, UPI QR generator, split payments & WhatsApp invoices.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#9BB89E]">
            <span>Open Cash Register</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/finance"
          className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A] hover:border-[#3E3126] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#221C17] text-[#C29B72] border border-[#352B21] flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#FAF8F5] group-hover:text-[#D4AD85] transition-colors">
              Finance & P&L Ledger
            </h3>
            <p className="text-xs text-[#8E7E73] mt-1 leading-relaxed font-normal">
              Automated P&L ledger, rent/salaries/ingredient tracking, gross margins & CSV export.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#C29B72]">
            <span>View Financials</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/saas"
          className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A] hover:border-[#3E3126] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#28211A] text-[#DFBD98] border border-[#3C3026] flex items-center justify-center mb-3">
              <Crown className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#FAF8F5] group-hover:text-[#DFBD98] transition-colors">
              SaaS Multi-Cafe Platform
            </h3>
            <p className="text-xs text-[#8E7E73] mt-1 leading-relaxed font-normal">
              Central Super Admin portal, ₹500–₹1,500/mo subscription tiers & multi-branch expansion.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#DFBD98]">
            <span>Platform Overview</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Two Column Layout: Recent Orders & Upcoming Birthdays / Inventory Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#1C1713] rounded-3xl border border-[#2B221A] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#FAF8F5] flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-[#C29B72]" />
              Live Order Stream
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#C29B72] hover:text-[#D4AD85] flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#2B221A]">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-[#FAF8F5] text-sm">
                      #{order.order_number}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#241D17] text-[#C29B72] border border-[#352920]">
                      {order.order_type === 'PICKUP' ? (
                        `Pickup ${order.pickup_token || ''}`
                      ) : order.table_number_snapshot ? (
                        `Table ${order.table_number_snapshot}`
                      ) : (
                        'Counter Walk-in'
                      )}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'NEW'
                          ? 'bg-[#B35C4A]/15 text-[#DF9182] border border-[#B35C4A]/25'
                          : order.status === 'PREPARING'
                          ? 'bg-[#C29B72]/15 text-[#DFBD98] border border-[#C29B72]/25'
                          : order.status === 'READY'
                          ? 'bg-[#5F7A62]/15 text-[#9BB89E] border border-[#5F7A62]/25'
                          : 'bg-[#221A15] text-[#8E7E73] border border-[#30251D]'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8E7E73] mt-1 font-normal">
                    {order.items?.map((i) => `${i.item_name_snapshot} (${i.quantity})`).join(', ')}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-[#D4AD85] text-sm">
                    {formatCurrency(order.total, currency)}
                  </div>
                  <span className="text-[10px] text-[#7A6B60]">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar widgets: Low Stock & Upcoming Birthdays */}
        <div className="space-y-4">
          {/* Low Stock Alert if any */}
          {lowStockItems.length > 0 && (
            <div className="bg-[#241714] rounded-3xl border border-[#482822] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#DF9182] flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-[#B35C4A]" />
                  Stock Warning ({lowStockItems.length})
                </h3>
                <Link
                  href="/admin/inventory"
                  className="text-[11px] font-semibold text-[#DF9182] hover:underline"
                >
                  Restock
                </Link>
              </div>
              <div className="space-y-2">
                {lowStockItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-2xl bg-[#1C1311] border border-[#381F1A] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#FAF8F5]">{item.name}</p>
                      <p className="text-[10px] text-[#8E7E73]">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#DF9182]">
                        {item.current_stock} {item.unit}
                      </span>
                      <p className="text-[9px] text-[#7A6B60]">Min: {item.min_threshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Birthdays Alert Card */}
          <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#FAF8F5] flex items-center gap-2">
                <Cake className="w-4 h-4 text-[#C29B72]" />
                Birthdays (7 Days)
              </h2>
              <Link
                href="/admin/birthday-club"
                className="text-xs font-semibold text-[#C29B72] hover:text-[#D4AD85] flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {upcomingBirthdays.length === 0 ? (
              <div className="py-6 text-center bg-[#181310] rounded-2xl border border-[#261E17]">
                <Cake className="w-6 h-6 text-[#6B5C52] mx-auto mb-1.5" />
                <p className="text-xs text-[#8E7E73]">No birthdays in the next 7 days.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingBirthdays.slice(0, 4).map((bday) => (
                  <div
                    key={bday.customer_id}
                    className="p-2.5 bg-[#201A16] rounded-2xl border border-[#322820] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#FAF8F5] flex items-center gap-1">
                        {bday.name}
                        <span>🎂</span>
                      </div>
                      <div className="text-[10px] text-[#8E7E73]">
                        {formatBirthdayDisplay(bday.birthday)} • {bday.days_until === 0 ? 'Today!' : `${bday.days_until}d away`}
                      </div>
                    </div>

                    <Link
                      href="/admin/birthday-club"
                      className="px-2.5 py-1 rounded-xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-[10px] transition-colors"
                    >
                      WhatsApp
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
