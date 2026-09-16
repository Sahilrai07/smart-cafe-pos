'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Restaurant, Table, MenuCategory, MenuItem, CartItem, Order, RestaurantSettings } from '@/types';
import { cafeStore, subscribeToStore } from '@/lib/store';
import { MenuHeader } from './MenuHeader';
import { MenuItemCard } from './MenuItemCard';
import { CartDrawer } from './CartDrawer';
import { BirthdayClubModal } from './BirthdayClubModal';
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
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Load store data
  const refreshData = () => {
    const r = cafeStore.getRestaurantBySlug(slug) || cafeStore.getAllRestaurants()[0];
    if (r) {
      setRestaurant(r);
      const s = cafeStore.getSettings(r.id);
      setSettings(s);
      const cats = cafeStore.getCategories(r.id);
      setCategories(cats);
      const items = cafeStore.getMenuItems(r.id);
      setMenuItems(items);

      if (tableNumber) {
        const t = cafeStore.getTableByNumber(r.id, tableNumber);
        setTable(t || { id: 'tbl-custom', restaurant_id: r.id, table_number: tableNumber, qr_slug: tableNumber, active: true });
      }
    }
  };

  useEffect(() => {
    refreshData();
    return subscribeToStore(() => {
      refreshData();
    });
  }, [slug, tableNumber]);

  // Cart quantity controls
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menu_item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menu_item: item, quantity: 1 }];
    });
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
      if (item) handleAddToCart(item);
    } else {
      handleRemoveFromCart(itemId);
    }
  };

  // Place order
  const handlePlaceOrder = async (instructions: string) => {
    if (!restaurant) return;

    const subtotal = cart.reduce((acc, i) => acc + i.menu_item.price * i.quantity, 0);
    const tax = settings?.tax_enabled ? (subtotal * (settings.tax_percentage || 5)) / 100 : 0;
    const total = subtotal + tax;

    const orderItems = cart.map((c) => ({
      menu_item_id: c.menu_item.id,
      item_name_snapshot: c.menu_item.name,
      quantity: c.quantity,
      unit_price_snapshot: c.menu_item.price,
      total: c.menu_item.price * c.quantity,
    }));

    const newOrder = cafeStore.createOrder({
      restaurant_id: restaurant.id,
      table_id: table?.id,
      table_number_snapshot: table?.table_number || 'Takeaway',
      items: orderItems,
      subtotal,
      tax,
      total,
      special_instructions: instructions,
    });

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }

    setActiveOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);
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
    <div className="min-h-screen bg-slate-50 flex flex-col pb-28">
      {/* Restaurant Header */}
      <MenuHeader restaurant={restaurant} table={table} />

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 pt-4 flex-1">
        {/* Search & Veg Filter */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search burgers, pizzas, shakes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyVeg(!onlyVeg)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold border transition-colors shadow-2xs whitespace-nowrap ${
              onlyVeg
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Veg Only
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shadow-2xs ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500 text-white shadow-amber-500/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shadow-2xs ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-amber-500/25'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Promotional Birthday Club Banner */}
        <div
          onClick={() => setIsBirthdayModalOpen(true)}
          className="my-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md cursor-pointer hover:opacity-95 transition-opacity flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <PartyPopper className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black tracking-tight leading-tight">
                🎂 Join {restaurant.name} Birthday Club!
              </h4>
              <p className="text-[11px] text-amber-100 line-clamp-1 mt-0.5">
                {settings.birthday_offer_text || 'Get a surprise treat on your birthday!'}
              </p>
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold tracking-wide flex items-center gap-1">
            Join <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* Menu Items Grid */}
        <div className="space-y-3 mt-4">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
              <p className="text-sm font-bold text-slate-500">No items found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search or filters</p>
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
            className="flex items-center justify-between bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all cursor-pointer ring-4 ring-slate-900/10"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black flex items-center justify-center ring-2 ring-slate-900">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} in Cart
                </p>
                <p className="text-sm font-black text-amber-400">
                  {formatCurrency(cartSubtotal, settings.currency)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
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

      {/* Live Order Confirmation & Tracking Overlay */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Header Status */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-emerald-200" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-200 px-3 py-0.5 rounded-full bg-emerald-700/50">
                Order Received!
              </span>
              <h3 className="text-2xl font-black tracking-tight mt-1">
                Order #{activeOrder.order_number}
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {activeOrder.table_number_snapshot ? `Table ${activeOrder.table_number_snapshot}` : 'Takeaway'} • {restaurant.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Order Status Progress */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-amber-500" />
                    Kitchen Status:
                  </span>
                  <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Preparing Food
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-2/3 rounded-full animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 text-center">
                  Your food is being prepared fresh. Staff will bring it to your table.
                </p>
              </div>

              {/* Items Summary */}
              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-bold text-slate-900 mb-2">Order Items:</h4>
                <div className="space-y-1 text-xs text-slate-600">
                  {activeOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1">
                      <span>
                        {item.item_name_snapshot} × {item.quantity}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(item.total, settings.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                    <span>Total Amount</span>
                    <span className="text-amber-600">
                      {formatCurrency(activeOrder.total, settings.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Post-Order Birthday Club CTA */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/70 text-purple-950">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black">While you wait: Join Birthday Club 🎂</h5>
                    <p className="text-[11px] text-purple-800/80 mt-0.5">
                      Get a surprise treat on your birthday every year!
                    </p>
                    <button
                      onClick={() => setIsBirthdayModalOpen(true)}
                      className="mt-2.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    >
                      Join Free in 10s
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveOrder(null)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
