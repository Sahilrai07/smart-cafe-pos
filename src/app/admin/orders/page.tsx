'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cafeStore, subscribeToStore } from '@/lib/store';
import { Order, OrderStatus, Restaurant, RestaurantSettings, Bill } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { GenerateBillModal } from '@/components/admin/GenerateBillModal';
import {
  UtensilsCrossed,
  Volume2,
  VolumeX,
  PlusCircle,
  Clock,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<Order | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const previousNewCount = useRef(0);

  const refreshOrders = () => {
    const rId = cafeStore.getActiveRestaurantId();
    const r = cafeStore.getRestaurantById(rId);
    setRestaurant(r || null);
    if (r) {
      setSettings(cafeStore.getSettings(r.id));
      const list = cafeStore.getOrders(r.id);
      setOrders(list);

      // Check if new order arrived and play sound
      const currentNewCount = list.filter((o) => o.status === 'NEW').length;
      if (currentNewCount > previousNewCount.current && soundEnabled) {
        playOrderChime();
      }
      previousNewCount.current = currentNewCount;
    }
  };

  useEffect(() => {
    refreshOrders();
    const unsub = subscribeToStore(refreshOrders);
    // Polling fallback every 10 seconds for real-time safety
    const interval = setInterval(refreshOrders, 10000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [soundEnabled]);

  // Audio chime via Web Audio API (100% free, zero external audio assets required)
  const playOrderChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    cafeStore.updateOrderStatus(orderId, status);
    refreshOrders();
  };

  const handleOpenBillModal = (order: Order) => {
    setSelectedOrderForBill(order);
    setIsBillModalOpen(true);
  };

  // Handy pitch simulation button
  const handleSimulateNewOrder = () => {
    if (!restaurant) return;
    cafeStore.createOrder({
      restaurant_id: restaurant.id,
      table_number_snapshot: '04',
      items: [
        { item_name_snapshot: 'Classic Veg Burger', quantity: 1, unit_price_snapshot: 120, total: 120 },
        { item_name_snapshot: 'Chilled Coke (Can)', quantity: 2, unit_price_snapshot: 40, total: 80 },
        { item_name_snapshot: 'Crispy Golden Salted Fries', quantity: 1, unit_price_snapshot: 60, total: 60 },
      ],
      subtotal: 260,
      tax: 13,
      total: 273,
      special_instructions: 'Less spicy, please serve fries hot.',
    });
    playOrderChime();
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return o.status === 'NEW' || o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'READY';
    return o.status === statusFilter;
  });

  const newOrdersCount = orders.filter((o) => o.status === 'NEW').length;
  const currency = settings?.currency || '₹';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Live Kitchen Orders
            </h1>
            {newOrdersCount > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30">
                <AlertCircle className="w-3.5 h-3.5" />
                {newOrdersCount} NEW
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time table orders from customer QR scans • {restaurant?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Notification Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 text-amber-400 border-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'Chime sound is ON' : 'Chime sound is MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{soundEnabled ? 'Sound ON' : 'Muted'}</span>
          </button>

          {/* Simulate Live Order for Pitch Demos */}
          <button
            onClick={handleSimulateNewOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simulate Order #1042</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: 'All Orders', value: 'ALL' },
          { label: 'Active Kitchen', value: 'ACTIVE' },
          { label: 'New', value: 'NEW', count: newOrdersCount },
          { label: 'Preparing', value: 'PREPARING' },
          { label: 'Ready', value: 'READY' },
          { label: 'Completed', value: 'COMPLETED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === tab.value
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-950/60 rounded-3xl border border-slate-800/80">
            <UtensilsCrossed className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">No orders found in this filter</p>
            <p className="text-xs text-slate-500 mt-1">
              New customer orders placed from table QR codes will appear here automatically.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isNew = order.status === 'NEW';
            return (
              <div
                key={order.id}
                className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                  isNew
                    ? 'bg-slate-950 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30 animate-in zoom-in-95'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Order Top Bar */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">
                          #{order.order_number}
                        </span>
                        {isNew && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                            NEW ORDER
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        {order.table_number_snapshot ? `Table ${order.table_number_snapshot}` : 'Takeaway'}
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="py-3 space-y-1.5 text-xs">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-300">
                        <span className="font-semibold">
                          <span className="text-amber-400 font-bold">{item.quantity}×</span>{' '}
                          {item.item_name_snapshot}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {formatCurrency(item.total, currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Special Instructions */}
                  {order.special_instructions && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300/90 mb-3 flex items-start gap-1.5">
                      <ChefHat className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{order.special_instructions}</span>
                    </div>
                  )}

                  {/* Total & Tax */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Subtotal: {formatCurrency(order.subtotal, currency)} + GST
                    </span>
                    <span className="text-base font-black text-white">
                      {formatCurrency(order.total, currency)}
                    </span>
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    {order.status === 'NEW' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-colors text-center"
                      >
                        Accept & Prepare
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors text-center"
                      >
                        Mark Ready
                      </button>
                    )}

                    {order.status === 'READY' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors text-center"
                      >
                        Mark Completed
                      </button>
                    )}

                    {/* Generate Bill Button (Always visible / primary action!) */}
                    <button
                      onClick={() => handleOpenBillModal(order)}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all col-span-2"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Generate Bill & Send WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bill Modal */}
      {restaurant && settings && (
        <GenerateBillModal
          order={selectedOrderForBill}
          restaurant={restaurant}
          settings={settings}
          isOpen={isBillModalOpen}
          onClose={() => {
            setIsBillModalOpen(false);
            setSelectedOrderForBill(null);
          }}
          onSuccess={() => {
            refreshOrders();
          }}
        />
      )}
    </div>
  );
}
