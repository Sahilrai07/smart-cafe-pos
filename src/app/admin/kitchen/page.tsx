'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { Order, OrderStatus, Restaurant } from '@/types';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  RefreshCw,
  ArrowLeft,
  Flame,
  Utensils,
  Check,
  User,
  ShoppingBag,
  Coffee,
  MessageSquare,
} from 'lucide-react';

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PREPARING' | 'READY'>('ALL');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const previousNewCount = useRef(0);
  const [now, setNow] = useState(Date.now());

  // Update clock every 5 seconds for timer calculations
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const refreshOrders = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const list = await supabaseService.getOrders(r.id);
        // Only active kitchen orders
        const kitchenOrders = list.filter(
          (o) => o.status === 'NEW' || o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'READY'
        );
        setOrders(kitchenOrders);

        const newCount = kitchenOrders.filter((o) => o.status === 'NEW').length;
        if (newCount > previousNewCount.current && soundEnabled) {
          playKitchenChime();
        }
        previousNewCount.current = newCount;
      }
    } catch (e) {
      console.error('Error refreshing kitchen orders:', e);
    }
  };

  useEffect(() => {
    refreshOrders();
    const rId = cafeStore.getActiveRestaurantId();
    const unsub = supabaseService.subscribeToOrders(rId, () => refreshOrders());
    const interval = setInterval(refreshOrders, 3000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [soundEnabled]);

  const playKitchenChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus, prepTime?: number) => {
    await supabaseService.updateOrderStatus(orderId, status, prepTime);
    await refreshOrders();
  };

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'PREPARING') return o.status === 'NEW' || o.status === 'CONFIRMED' || o.status === 'PREPARING';
    if (filter === 'READY') return o.status === 'READY';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A221B] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2.5 rounded-2xl bg-[#1F1915] text-[#A8988C] hover:text-[#EDE7DF] border border-[#2F251E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#FAF8F5] tracking-tight">
                Kitchen Display System (KDS)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#5F7A62]/15 text-[#9BB89E] border border-[#5F7A62]/25">
                LIVE
              </span>
            </div>
            <p className="text-xs text-[#8E7E73] mt-0.5">
              Chef order tickets, preparation timers & item checklists • {restaurant?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors ${
              soundEnabled
                ? 'bg-[#C29B72]/15 border-[#C29B72]/30 text-[#D4AD85]'
                : 'bg-[#1E1814] border-[#2D231B] text-[#7A6B60]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          <div className="flex rounded-xl bg-[#1C1713] p-1 border border-[#2D231B] text-xs font-medium">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'ALL' ? 'bg-[#C29B72] text-[#14110E] font-bold' : 'text-[#8E7E73] hover:text-[#EDE7DF]'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilter('PREPARING')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'PREPARING' ? 'bg-[#C29B72] text-[#14110E] font-bold' : 'text-[#8E7E73] hover:text-[#EDE7DF]'
              }`}
            >
              Cooking ({orders.filter((o) => o.status !== 'READY').length})
            </button>
            <button
              onClick={() => setFilter('READY')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === 'READY' ? 'bg-[#C29B72] text-[#14110E] font-bold' : 'text-[#8E7E73] hover:text-[#EDE7DF]'
              }`}
            >
              Ready ({orders.filter((o) => o.status === 'READY').length})
            </button>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-[#1C1713] rounded-3xl border border-[#2B221A]">
          <div className="w-14 h-14 rounded-2xl bg-[#251E18] border border-[#352B21] flex items-center justify-center mx-auto mb-3 text-[#9BB89E]">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#FAF8F5]">All Caught Up, Chef!</h3>
          <p className="text-xs text-[#8E7E73] mt-1 max-w-sm mx-auto">
            No active orders waiting in the kitchen. New orders from customer QR scans or Counter POS will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => {
            const isNew = order.status === 'NEW';
            const isReady = order.status === 'READY';
            const orderTime = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Calculate countdown minutes
            let minutesLeft = 0;
            let isOverdue = false;
            if (order.estimated_ready_at) {
              const diffMs = new Date(order.estimated_ready_at).getTime() - now;
              minutesLeft = Math.round(diffMs / 60000);
              if (diffMs < 0) isOverdue = true;
            }

            return (
              <div
                key={order.id}
                className={`rounded-3xl border flex flex-col justify-between overflow-hidden transition-all shadow-md ${
                  isNew
                    ? 'bg-[#1C1512] border-[#4A261F]'
                    : isReady
                    ? 'bg-[#161C17] border-[#2E4231]'
                    : isOverdue
                    ? 'bg-[#211612] border-[#4A2B22]'
                    : 'bg-[#1C1713] border-[#2D231B]'
                }`}
              >
                {/* Ticket Top Bar */}
                <div
                  className={`p-4 border-b flex items-center justify-between ${
                    isNew
                      ? 'bg-[#2B1B17] border-[#44231C] text-[#DF9182]'
                      : isReady
                      ? 'bg-[#19261C] border-[#293E2D] text-[#9BB89E]'
                      : 'bg-[#221A15] border-[#30251D] text-[#EDE7DF]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#FAF8F5]">
                        #{order.order_number}
                      </span>
                      {order.pickup_token && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C29B72]/20 text-[#D4AD85] border border-[#C29B72]/30">
                          Token #{order.pickup_token}
                        </span>
                      )}
                    </div>
                    {order.order_type === 'PICKUP' ? (
                      <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#C29B72]/20 text-[#D4AD85] border border-[#C29B72]/30">
                        📦 Self-Pickup
                      </span>
                    ) : (
                      <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider bg-[#5F7A62]/30 text-[#A8D3AC] border border-[#5F7A62]/50 shadow-2xs">
                        🍽️ TABLE {order.table_number_snapshot || '01'}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold block text-[#A8988C]">{orderTime}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 inline-block ${
                        isNew
                          ? 'bg-[#B35C4A]/25 text-[#DF9182] border border-[#B35C4A]/30'
                          : isReady
                          ? 'bg-[#5F7A62]/25 text-[#9BB89E] border border-[#5F7A62]/30'
                          : 'bg-[#C29B72]/15 text-[#DFBD98] border border-[#C29B72]/25'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Prep Timer Bar */}
                {!isReady && (
                  <div
                    className={`px-4 py-2 border-b flex items-center justify-between text-xs font-semibold ${
                      isOverdue
                        ? 'bg-[#2A1612] border-[#3D201A] text-[#DF9182]'
                        : 'bg-[#201A16] border-[#2E241D] text-[#D4AD85]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C29B72]" />
                      <span>{isOverdue ? 'Overdue by' : 'Target timer:'}</span>
                    </div>
                    <span className="font-bold text-xs">
                      {isOverdue ? `${Math.abs(minutesLeft)}m overdue` : `${minutesLeft > 0 ? minutesLeft : '<1'}m left`}
                    </span>
                  </div>
                )}

                {/* Items List (Clickable Checklist) */}
                <div className="p-4 flex-1 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7A6B60]">
                    Tap item to strike off:
                  </p>
                  <div className="space-y-1.5">
                    {order.items?.map((item, idx) => {
                      const isChecked = !!checkedItems[`${order.id}-${idx}`];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleItemCheck(order.id, idx)}
                          className={`flex items-start justify-between p-2 rounded-xl border text-xs cursor-pointer select-none transition-colors ${
                            isChecked
                              ? 'bg-[#181310] border-[#221A15] text-[#695B52] line-through'
                              : 'bg-[#211B16] border-[#2F2620] text-[#EDE7DF] hover:border-[#3D322A]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                isChecked
                                  ? 'bg-[#5F7A62] border-[#5F7A62] text-[#14110E]'
                                  : 'border-[#3D3127] bg-[#181310]'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 font-bold" />}
                            </div>
                            <span className="font-medium">{item.item_name_snapshot}</span>
                          </div>
                          <span className="font-bold px-1.5 py-0.5 rounded bg-[#C29B72]/15 text-[#D4AD85] border border-[#C29B72]/25 shrink-0">
                            ×{item.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {order.special_instructions && (
                    <div className="p-2.5 rounded-xl bg-[#261E17] border border-[#3C3025] text-[#D8C7B8] text-xs font-normal mt-2">
                      <span className="font-semibold block text-[10px] uppercase text-[#C29B72]">Guest Note:</span>
                      &ldquo;{order.special_instructions}&rdquo;
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-3 bg-[#181310] border-t border-[#2A211A] space-y-2">
                  {isNew ? (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-[#8E7E73] text-center font-medium">Accept & Assign Prep Time:</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING', 10)}
                          className="py-1.5 rounded-xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-xs transition-colors"
                        >
                          10m
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING', 15)}
                          className="py-1.5 rounded-xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-xs transition-colors"
                        >
                          15m
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING', 25)}
                          className="py-1.5 rounded-xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-xs transition-colors"
                        >
                          25m
                        </button>
                      </div>
                    </div>
                  ) : order.status === 'PREPARING' || order.status === 'CONFIRMED' ? (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      className="w-full py-2.5 rounded-2xl bg-[#5F7A62] hover:bg-[#526B55] text-[#FAF8F5] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#5F7A62]/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Order Ready! 🔔</span>
                    </button>
                  ) : isReady ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#9BB89E] flex-1 text-center">
                        Ready for Pickup / Table
                      </span>
                      {order.customer_phone && (
                        <a
                          href={`https://wa.me/${order.customer_phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                            `Hey ${order.customer_name || 'there'}! 👋\n\nYour order #${order.order_number} (${order.order_type === 'PICKUP' ? 'Self-Pickup' : `Table ${order.table_number_snapshot || '01'}`}) is ready! 🍽️\n\nEnjoy your meal!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 rounded-xl bg-[#1C2C1E] hover:bg-[#253A28] border border-[#35583A] text-[#9BB89E] flex items-center gap-1 text-xs font-semibold transition-colors"
                          title="Ping Customer on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="py-1.5 px-3 rounded-xl bg-[#28211B] hover:bg-[#342B23] text-[#EDE7DF] font-semibold text-xs border border-[#3A2F26] cursor-pointer"
                      >
                        Served
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
