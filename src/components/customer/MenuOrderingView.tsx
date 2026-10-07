'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Restaurant, Table, MenuCategory, MenuItem, CartItem, Order, RestaurantSettings } from '@/types';
import { supabaseService } from '@/lib/services/supabaseService';
import { MenuHeader } from './MenuHeader';
import { MenuItemCard } from './MenuItemCard';
import { CartDrawer } from './CartDrawer';
import { BirthdayClubModal } from './BirthdayClubModal';
import { ServiceBellModal } from './ServiceBellModal';
import { ChefsPairingModal } from './ChefsPairingModal';
import { sendLocalNotification, requestNotificationPermission } from '@/lib/notifications';
import { formatCurrency } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  Search,
  ShoppingBag,
  CheckCircle2,
  Clock,
  ChefHat,
  Sparkles,
  PartyPopper,
  Flame,
  ArrowRight,
  Bell,
} from 'lucide-react';

interface MenuOrderingViewProps {
  slug: string;
  tableNumber?: string;
}

export const MenuOrderingView: React.FC<MenuOrderingViewProps> = ({ slug, tableNumber }) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVeg, setOnlyVeg] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [isServiceBellOpen, setIsServiceBellOpen] = useState(false);
  const [pairingModalOpen, setPairingModalOpen] = useState(false);
  const [pairingTriggerItem, setPairingTriggerItem] = useState<MenuItem | null>(null);
  const [suggestedPairings, setSuggestedPairings] = useState<MenuItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderAcceptedPopup, setOrderAcceptedPopup] = useState(false);
  const hasTriggeredPopup = useRef(false);

  // Cheerful audio chime for customer when admin accepts order
  const playAcceptedChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.4);
      });
    } catch {}
  };

  // Real-time listener for Admin / Kitchen accepting the order
  useEffect(() => {
    if (!activeOrder) return;
    if (activeOrder.status !== 'NEW') return;

    const orderId = activeOrder.id;

    const onAccepted = (updated: Order) => {
      if (hasTriggeredPopup.current) return;
      if (updated.status !== 'NEW') {
        hasTriggeredPopup.current = true;
        setActiveOrder(updated);
        setOrderAcceptedPopup(true);
        playAcceptedChime();
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.4 },
          });
        } catch {}

        if (updated.status === 'CONFIRMED' || updated.status === 'PREPARING') {
          sendLocalNotification(`Order #${updated.order_number} Accepted! ☕`, {
            body: `Kitchen is preparing your food (Est. ${updated.prep_time_minutes || 10} mins).`,
          });
        } else if (updated.status === 'READY') {
          sendLocalNotification(`Order #${updated.order_number} Ready! 🍽️`, {
            body: `Your food is ready for Table ${updated.table_number_snapshot || ''}. Enjoy your meal!`,
          });
        }
      }
    };

    // 1. Supabase Realtime channel
    const unsub = supabaseService.subscribeToSingleOrder(orderId, (updated) => {
      onAccepted(updated);
    });

    // 2. High-frequency 2-second polling fallback
    const interval = setInterval(async () => {
      try {
        const latest = await supabaseService.getOrderById(orderId);
        if (latest && latest.status !== 'NEW') {
          onAccepted(latest);
        }
      } catch (err) {
        console.error('Error polling order status:', err);
      }
    }, 2000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [activeOrder?.id, activeOrder?.status]);

  // Load store / Supabase data
  const refreshData = async () => {
    try {
      const r = (await supabaseService.getRestaurantBySlug(slug)) || (await supabaseService.getAllRestaurants())[0];
      if (r) {
        setRestaurant(r);
        const [s, cats, items] = await Promise.all([
          supabaseService.getSettings(r.id),
          supabaseService.getCategories(r.id),
          supabaseService.getMenuItems(r.id),
        ]);
        setSettings(s);
        setCategories(cats);
        setMenuItems(items);

        if (tableNumber) {
          const t = await supabaseService.getTableByNumber(r.id, tableNumber);
          setTable(t || { id: 'tbl-custom', restaurant_id: r.id, table_number: tableNumber, qr_slug: tableNumber, active: true });
        }
      }
    } catch (e) {
      console.error('Error loading menu data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, [slug, tableNumber]);

  // Cart quantity controls
  const handleAddToCart = (item: MenuItem, triggerPairing = true) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menu_item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menu_item: item, quantity: 1 }];
    });

    if (triggerPairing) {
      // Find smart complementary pairings
      const isBeverage =
        item.name.toLowerCase().includes('latte') ||
        item.name.toLowerCase().includes('cappuccino') ||
        item.name.toLowerCase().includes('espresso') ||
        item.name.toLowerCase().includes('coffee') ||
        item.name.toLowerCase().includes('tea');

      const pairs = menuItems
        .filter(
          (m) =>
            m.id !== item.id &&
            m.available &&
            (item.paired_item_ids?.includes(m.id) ||
              (isBeverage
                ? m.name.toLowerCase().includes('croissant') ||
                  m.name.toLowerCase().includes('muffin') ||
                  m.name.toLowerCase().includes('cake') ||
                  m.name.toLowerCase().includes('toast')
                : m.name.toLowerCase().includes('latte') ||
                  m.name.toLowerCase().includes('shake') ||
                  m.name.toLowerCase().includes('fries')))
        )
        .slice(0, 2);

      if (pairs.length > 0) {
        setPairingTriggerItem(item);
        setSuggestedPairings(pairs);
        setPairingModalOpen(true);
      }
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menu_item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.menu_item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.menu_item.id !== itemId);
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    if (delta > 0) {
      const item = menuItems.find((m) => m.id === itemId);
      if (item) handleAddToCart(item, false);
    } else {
      handleRemoveFromCart(itemId);
    }
  };

  // Place order via secure server route with server-verified prices
  const handlePlaceOrder = async (instructions: string, orderType: 'DINE_IN' | 'PICKUP' = 'DINE_IN') => {
    if (!restaurant || cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Request background push notification permission
      requestNotificationPermission().catch(() => {});

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          table_id: table?.id,
          table_number: table?.table_number || tableNumber || 'Takeaway',
          order_type: orderType,
          items: cart.map((c) => ({
            menu_item_id: c.menu_item.id,
            quantity: c.quantity,
          })),
          special_instructions: instructions,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.order) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Mark table OCCUPIED with anti-prank session token
      const tNum = table?.table_number || tableNumber;
      if (tNum && orderType === 'DINE_IN') {
        const sessionKey = `table_session_${restaurant.id}_${tNum}`;
        let sToken = typeof window !== 'undefined' ? localStorage.getItem(sessionKey) : null;
        if (!sToken) {
          sToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          if (typeof window !== 'undefined') localStorage.setItem(sessionKey, sToken);
        }
        await supabaseService.updateTableStatus(restaurant.id, tNum, 'OCCUPIED', sToken);
      }

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }

      hasTriggeredPopup.current = false;
      setOrderAcceptedPopup(false);
      setActiveOrder(data.order);
      setCart([]);
      setIsCartOpen(false);
    } catch (err: any) {
      console.error('Error placing order:', err);
      alert(err.message || 'Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category_id !== selectedCategory) {
        return false;
      }
      if (onlyVeg && !item.is_veg) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [menuItems, selectedCategory, onlyVeg, searchQuery]);

  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce((acc, i) => acc + i.menu_item.price * i.quantity, 0);

  if (!restaurant || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col pb-28">
      {/* Restaurant Header */}
      <MenuHeader restaurant={restaurant} table={table} />

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 pt-4 flex-1">
        {/* Search & Veg Filter */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9C8B7F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coffee, pastries, artisan toasts..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E6DFD3] text-xs sm:text-sm text-[#2A231E] focus:outline-hidden focus:border-[#C29B72] focus:ring-2 focus:ring-[#C29B72]/15 shadow-2xs placeholder:text-[#A8988C]"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyVeg(!onlyVeg)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-semibold border transition-colors shadow-2xs whitespace-nowrap ${
              onlyVeg
                ? 'bg-[#EDF3EE] text-[#48634C] border-[#D3E0D5] ring-2 ring-[#5F7A62]/20'
                : 'bg-white text-[#6A5A4E] border-[#E6DFD3] hover:bg-[#F9F7F2]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#5F7A62]" />
            Veg Only
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
              selectedCategory === 'ALL'
                ? 'bg-[#2A231E] text-[#FAF8F5]'
                : 'bg-white text-[#6A5A4E] border border-[#E6DFD3] hover:border-[#D5C6B5]'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                selectedCategory === cat.id
                  ? 'bg-[#2A231E] text-[#FAF8F5]'
                  : 'bg-white text-[#6A5A4E] border border-[#E6DFD3] hover:border-[#D5C6B5]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Promotional Birthday Club Banner - Elegant Warm Cafe Club */}
        <div
          onClick={() => setIsBirthdayModalOpen(true)}
          className="my-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#2B231D] via-[#352B24] to-[#261E18] text-[#FAF8F5] border border-[#483B31] shadow-sm cursor-pointer hover:opacity-95 transition-opacity flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#43352B] flex items-center justify-center shrink-0 text-[#D4AD85]">
              <PartyPopper className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold tracking-tight text-[#FAF8F5] leading-tight">
                🎂 Join {restaurant.name} Birthday Club
              </h4>
              <p className="text-[11px] text-[#C4B2A2] line-clamp-1 mt-0.5">
                {settings.birthday_offer_text || 'Enjoy a complimentary handcrafted dessert on your special week!'}
              </p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-full bg-[#C29B72] text-[#14110E] text-[11px] font-bold tracking-wide flex items-center gap-1">
            Join <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* Menu Items Grid */}
        <div className="space-y-3 mt-4">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#EAE3D8]">
              <p className="text-sm font-semibold text-[#6E5E52]">No dishes found</p>
              <p className="text-xs text-[#9E8E81] mt-1">Try modifying your search or dietary filter</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const cartItem = cart.find((c) => c.menu_item.id === item.id);
              const qty = cartItem ? cartItem.quantity : 0;
              return (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantity={qty}
                  currency={settings.currency}
                  onAdd={() => handleAddToCart(item)}
                  onRemove={() => handleRemoveFromCart(item.id)}
                />
              );
            })
          )}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && !isCartOpen && (
        <div className="fixed inset-x-0 bottom-4 z-40 max-w-lg mx-auto px-4 animate-in slide-in-from-bottom duration-200">
          <div
            onClick={() => setIsCartOpen(true)}
            className="flex items-center justify-between bg-[#241D17] text-[#FAF8F5] px-5 py-3.5 rounded-2xl shadow-xl hover:bg-[#2C241D] border border-[#3D3025] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-lg bg-[#C29B72] text-[#14110E] flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#B35C4A] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#241D17]">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <p className="text-xs text-[#B5A597]">
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} in order
                </p>
                <p className="text-sm font-bold text-[#D8B693]">
                  {formatCurrency(cartSubtotal, settings.currency)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C29B72]">
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        restaurant={restaurant}
        settings={settings}
        table={table}
        onUpdateQuantity={handleUpdateQuantity}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Birthday Club Modal */}
      <BirthdayClubModal
        isOpen={isBirthdayModalOpen}
        onClose={() => setIsBirthdayModalOpen(false)}
        restaurant={restaurant}
        settings={settings}
      />

      {/* Floating Service Bell Button (For Table Guests) */}
      {(table?.table_number || tableNumber) && (
        <button
          onClick={() => setIsServiceBellOpen(true)}
          className={`fixed z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-[#EAE3D8] text-[#2A231E] shadow-lg hover:bg-[#F5F0E8] hover:border-[#C29B72]/50 transition-all active:scale-95 cursor-pointer text-xs font-bold ${
            totalCartCount > 0 ? 'bottom-24 left-4 sm:left-6' : 'bottom-6 left-4 sm:left-6'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-[#F5F0E8] border border-[#EAE3D8] flex items-center justify-center text-[#8A5C2B]">
            <Bell className="w-3 h-3 animate-bounce" />
          </div>
          <span>Service Bell</span>
        </button>
      )}

      {/* Service Bell Modal */}
      {restaurant && (
        <ServiceBellModal
          isOpen={isServiceBellOpen}
          onClose={() => setIsServiceBellOpen(false)}
          restaurantId={restaurant.id}
          tableNumber={table?.table_number || tableNumber || '01'}
        />
      )}

      {/* Chef's Pairing Upsell Modal */}
      <ChefsPairingModal
        isOpen={pairingModalOpen}
        onClose={() => setPairingModalOpen(false)}
        triggerItem={pairingTriggerItem}
        pairings={suggestedPairings}
        onAddPairing={(item) => handleAddToCart(item, false)}
        currency={settings?.currency}
      />

      {/* Live Order Confirmation & Tracking Overlay */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#14110E]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-2xl overflow-hidden border border-[#E8DFD3] animate-in zoom-in-95 duration-200">
            {/* Header Status */}
            <div className="bg-[#241D17] p-6 text-[#FAF8F5] text-center border-b border-[#382E25]">
              <div className="w-12 h-12 rounded-2xl bg-[#33271F] border border-[#48382B] flex items-center justify-center mx-auto mb-2.5 text-[#C29B72]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9BB89E] px-3 py-0.5 rounded-full bg-[#5F7A62]/15 border border-[#5F7A62]/25">
                Order Placed Successfully
              </span>
              <h3 className="text-xl font-bold tracking-tight mt-1.5 text-[#FAF8F5]">
                Order #{activeOrder.order_number}
              </h3>
              <p className="text-xs text-[#B5A597] mt-0.5">
                {activeOrder.table_number_snapshot ? `Table ${activeOrder.table_number_snapshot}` : 'Self-Pickup'} • {restaurant.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Order Ready Notification Banner */}
              {activeOrder.status === 'READY' ? (
                <div className="bg-[#EDF3EE] border border-[#B8D1BC] p-4 rounded-2xl text-center space-y-1.5">
                  <span className="text-2xl block">🔔</span>
                  <h4 className="text-sm font-bold text-[#324C35] uppercase tracking-wide">
                    Your Order is Ready!
                  </h4>
                  <p className="text-xs text-[#48634C] leading-relaxed">
                    {activeOrder.pickup_token
                      ? `Please collect your food at the Self-Pickup Counter with Token #${activeOrder.pickup_token}`
                      : `Our team is bringing your food hot & fresh to Table ${activeOrder.table_number_snapshot}!`}
                  </p>
                </div>
              ) : (
                /* Order Status & Countdown Timer */
                <div className="bg-white p-4 rounded-2xl border border-[#EAE3D8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#5A4B40] flex items-center gap-1.5">
                      <ChefHat className="w-4 h-4 text-[#C29B72]" />
                      Kitchen Status:
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        activeOrder.status === 'NEW'
                          ? 'text-[#8A5C2B] bg-[#F7F2EB] border-[#E5D7C3]'
                          : 'text-[#48634C] bg-[#EDF3EE] border-[#D3E0D5]'
                      }`}
                    >
                      {activeOrder.status === 'NEW' ? 'Order Queued' : 'Preparing Fresh'}
                    </span>
                  </div>

                  {/* Countdown Timer Display */}
                  <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EFE8DE] text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[#8A796D] text-xs font-medium mb-1">
                      <Clock className="w-3.5 h-3.5 text-[#C29B72]" />
                      <span>Estimated Preparation Time</span>
                    </div>
                    <div className="text-2xl font-bold text-[#2A231E] tracking-tight">
                      ~{activeOrder.prep_time_minutes || 15} Mins
                    </div>
                    <div className="w-full bg-[#EBE4D8] h-1.5 rounded-full overflow-hidden mt-2.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          activeOrder.status === 'NEW'
                            ? 'bg-[#C29B72] w-1/4'
                            : 'bg-[#5F7A62] w-3/4'
                        }`}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#8A796D] text-center">
                    {activeOrder.status === 'NEW'
                      ? 'The kitchen staff will confirm and start brewing momentarily.'
                      : 'Our barista and chefs are preparing your order. Updates automatically!'}
                  </p>
                </div>
              )}

              {/* Items Summary */}
              <div className="border-t border-[#EAE3D8] pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#2A231E]">Order Summary:</h4>
                  {activeOrder.pickup_token && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2ECE1] text-[#6E4E2C] border border-[#E2D5C3]">
                      Token #{activeOrder.pickup_token}
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-xs text-[#5A4B40]">
                  {activeOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-0.5">
                      <span>
                        {item.item_name_snapshot} × {item.quantity}
                      </span>
                      <span className="font-semibold text-[#2A231E]">
                        {formatCurrency(item.total, settings.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-[#2A231E] pt-2 border-t border-[#EAE3D8] text-sm mt-1">
                    <span>Total Bill</span>
                    <span className="text-[#8A5C2B]">
                      {formatCurrency(activeOrder.total, settings.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Post-Order Birthday Club CTA */}
              <div className="p-3.5 rounded-2xl bg-[#F5EFE6] border border-[#DFD3C3] text-[#3D2F23]">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#C29B72] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-[#2A231E]">While you wait: Birthday Club 🎂</h5>
                    <p className="text-[11px] text-[#7A6B60] mt-0.5">
                      Receive an exclusive handcrafted dessert perk during your birthday week.
                    </p>
                    <button
                      onClick={() => setIsBirthdayModalOpen(true)}
                      className="mt-2 text-xs font-bold px-3 py-1 rounded-xl bg-[#C29B72] hover:bg-[#B38B62] text-[#14110E] transition-colors shadow-2xs"
                    >
                      Join in 10s
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveOrder(null)}
                className="w-full py-2.5 rounded-xl bg-[#241D17] hover:bg-[#2F251E] text-[#FAF8F5] text-xs font-bold transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Order Accepted Celebration Popup */}
      {orderAcceptedPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#14110E]/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#FAF8F5] rounded-3xl p-6 shadow-2xl border border-[#E8DFD3] text-center animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Soft Chef Icon */}
            <div className="relative mx-auto w-14 h-14 mb-3 flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#241D17] text-[#C29B72] border border-[#3C3026] flex items-center justify-center shadow-md">
                <ChefHat className="w-7 h-7" />
              </div>
            </div>

            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EDF3EE] text-[#48634C] border border-[#D3E0D5] uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5F7A62]" />
              Order Confirmed
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-[#2A231E] leading-snug">
              Your order has been placed and will be arriving soon
            </h3>

            <p className="text-xs text-[#7A6B60] mt-2 leading-relaxed">
              Our baristas and chefs at <strong>{restaurant?.name}</strong> confirmed your ticket{' '}
              {activeOrder?.order_number ? `(#${activeOrder.order_number})` : ''} and are preparing your order fresh for{' '}
              <strong>{table?.table_number ? `Table ${table.table_number}` : (tableNumber ? `Table ${tableNumber}` : 'your table')}</strong>.
            </p>

            {/* Live preparation progress */}
            <div className="mt-4 p-3.5 rounded-2xl bg-white border border-[#EAE3D8] text-left flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F4ECE1] text-[#7A5A38] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#2A231E]">Preparing Fresh</span>
                  <span className="font-semibold text-[#8A5C2B] text-[11px]">~10-15 mins</span>
                </div>
                <div className="w-full bg-[#EFE8DE] h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-[#C29B72] h-full w-3/4 rounded-full" />
                </div>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setOrderAcceptedPopup(false)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-[#241D17] hover:bg-[#30261E] text-[#FAF8F5] font-bold text-xs shadow-md transition-colors"
            >
              Track Live Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

