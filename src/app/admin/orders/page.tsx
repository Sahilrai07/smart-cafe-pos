'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
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

  const refreshOrders = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const [s, list] = await Promise.all([
          supabaseService.getSettings(r.id),
          supabaseService.getOrders(r.id),
        ]);
        setSettings(s);
        setOrders(list);

        // Check if new order arrived and play sound
        const currentNewCount = list.filter((o) => o.status === 'NEW').length;
        if (currentNewCount > previousNewCount.current && soundEnabled) {
          playOrderChime();
        }
        previousNewCount.current = currentNewCount;
      }
    } catch (e) {
      console.error('Error refreshing orders:', e);
    }
  };

  useEffect(() => {
    refreshOrders();

    const rId = cafeStore.getActiveRestaurantId();
    // Subscribe to real-time changes from Supabase Realtime channel
    const unsubRealtime = supabaseService.subscribeToOrders(rId, () => {
      refreshOrders();
    });

    // Fast background safety interval (3s)
    const interval = setInterval(refreshOrders, 3000);

    return () => {
      unsubRealtime();
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

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await supabaseService.updateOrderStatus(orderId, status);
    await refreshOrders();
  };

  const handleOpenBillModal = (order: Order) => {
    setSelectedOrderForBill(order);
    setIsBillModalOpen(true);
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
            <h1 className="text-2xl font-bold text-[#EDE7DF] tracking-tight">
              Live Table Orders
            </h1>
            {newOrdersCount > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#B35C4A] text-white shadow-md shadow-[#B35C4A]/20">
                <AlertCircle className="w-3.5 h-3.5" />
                {newOrdersCount} NEW
              </span>
            )}
          </div>
          <p className="text-xs text-[#A89887] mt-1">
            Real-time table orders from customer QR scans • {restaurant?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Sync Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#5F7A62]/15 border border-[#5F7A62]/30 text-[#9BB89E] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#5F7A62] animate-pulse" />
            <span>Live Sync</span>
          </div>

          {/* Sound Notification Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-[#241D17] text-[#D4AD85] border-[#C29B72]/30'
                : 'bg-[#1C1713] text-[#7A6B5D] border-[#2B221A]'
            }`}
            title={soundEnabled ? 'Chime sound is ON' : 'Chime sound is MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#D4AD85]" /> : <VolumeX className="w-4 h-4 text-[#7A6B5D]" />}
            <span>{soundEnabled ? 'Sound ON' : 'Muted'}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={refreshOrders}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C1713] hover:bg-[#241D17] text-[#EDE7DF] text-xs font-semibold border border-[#2B221A] transition-colors cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#A89887]" />
            <span className="hidden sm:inline">Refresh</span>
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
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-[#C29B72] text-[#14110E] font-bold shadow-md shadow-[#C29B72]/20'
                : 'bg-[#1C1713] text-[#A89887] hover:text-[#EDE7DF] border border-[#2B221A]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#B35C4A] text-white text-[10px] font-bold flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-[#1C1713] rounded-3xl border border-[#2B221A]">
            <UtensilsCrossed className="w-10 h-10 text-[#7A6B5D] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#EDE7DF]">No orders found in this filter</p>
            <p className="text-xs text-[#A89887] mt-1">
              New customer orders placed from table QR codes will appear here in real-time.
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
                    ? 'bg-[#1C1713] border-[#C29B72]/60 shadow-lg shadow-[#C29B72]/5 ring-1 ring-[#C29B72]/30 animate-in zoom-in-95'
                    : 'bg-[#1C1713] border-[#2B221A] hover:border-[#3D322B]'
                }`}
              >
                <div>
                  {/* Order Top Bar */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#2B221A]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#EDE7DF]">
                          #{order.order_number}
                        </span>
                        {isNew && (
                          <span className="px-2 py-0.5 rounded-md bg-[#B35C4A] text-white text-[10px] font-bold uppercase tracking-wider">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A89887] mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#7A6B5D]" />
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#241D17] text-[#D4AD85] border border-[#2B221A]">
                        {order.table_number_snapshot ? `Table ${order.table_number_snapshot}` : 'Takeaway'}
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="py-3 space-y-1.5 text-xs">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[#EDE7DF]">
                        <span className="font-medium">
                          <span className="text-[#D4AD85] font-bold">{item.quantity}×</span>{' '}
                          {item.item_name_snapshot}
                        </span>
                        <span className="text-[#A89887] font-mono">
                          {formatCurrency(item.total, currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Special Instructions */}
                  {order.special_instructions && (
                    <div className="p-2.5 rounded-xl bg-[#241D17] border border-[#2B221A] text-xs text-[#EDE7DF] mb-3 flex items-start gap-1.5">
                      <ChefHat className="w-3.5 h-3.5 text-[#D4AD85] shrink-0 mt-0.5" />
                      <span>{order.special_instructions}</span>
                    </div>
                  )}

                  {/* Total & Tax */}
                  <div className="pt-2 border-t border-[#2B221A] flex items-center justify-between text-xs text-[#A89887]">
                    <span>
                      Subtotal: {formatCurrency(order.subtotal, currency)} + GST
                    </span>
                    <span className="text-base font-bold text-[#EDE7DF]">
                      {formatCurrency(order.total, currency)}
                    </span>
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="mt-4 pt-3 border-t border-[#2B221A] flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    {order.status === 'NEW' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="py-2.5 px-3 rounded-xl bg-[#5F7A62] hover:bg-[#4E6751] text-[#FAF8F5] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#5F7A62]/20 text-center cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FAF8F5]" />
                        <span>Accept Order</span>
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="py-2.5 px-3 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] text-xs font-bold transition-colors text-center cursor-pointer"
                      >
                        Mark Ready
                      </button>
                    )}

                    {order.status === 'READY' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="py-2.5 px-3 rounded-xl bg-[#241D17] hover:bg-[#2B221A] text-[#EDE7DF] border border-[#2B221A] text-xs font-bold transition-colors text-center cursor-pointer"
                      >
                        Mark Completed
                      </button>
                    )}

                    {/* Generate Bill Button */}
                    <button
                      onClick={() => handleOpenBillModal(order)}
                      className="py-2.5 px-3 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#C29B72]/20 transition-all col-span-2 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Generate Bill & WhatsApp</span>
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
