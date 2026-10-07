'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import {
  Restaurant,
  RestaurantSettings,
  MenuCategory,
  MenuItem,
  Customer,
  PaymentMethod,
  OrderType,
  OrderItem,
  Table,
} from '@/types';
import { formatCurrency } from '@/lib/utils';
import { buildBillWhatsAppUrl } from '@/lib/whatsapp';
import confetti from 'canvas-confetti';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  QrCode,
  DollarSign,
  Receipt,
  User,
  Phone,
  Coins,
  Send,
  Printer,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Percent,
} from 'lucide-react';

export default function CounterPOSPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart / Active POS Ticket
  const [ticketItems, setTicketItems] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState('01');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);

  // Billing discounts & payment
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [redeemCoins, setRedeemCoins] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastBill, setLastBill] = useState<any | null>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);

  const refreshData = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const [s, cats, items, tbls] = await Promise.all([
          supabaseService.getSettings(r.id),
          supabaseService.getCategories(r.id),
          supabaseService.getMenuItems(r.id),
          supabaseService.getTables(r.id),
        ]);
        setSettings(s);
        setCategories(cats);
        setMenuItems(items);
        setTables(tbls);
      }
    } catch (e) {
      console.error('Error loading POS data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Look up customer when phone changes
  useEffect(() => {
    if (!restaurant) return;
    const clean = customerPhone.replace(/[^\d]/g, '');
    if (clean.length >= 10) {
      const custs = cafeStore.getCustomers(restaurant.id);
      const found = custs.find((c) => c.phone.replace(/[^\d]/g, '').includes(clean));
      if (found) {
        setMatchedCustomer(found);
        if (!customerName) setCustomerName(found.name);
      } else {
        setMatchedCustomer(null);
      }
    } else {
      setMatchedCustomer(null);
    }
  }, [customerPhone, restaurant]);

  const currency = settings?.currency || '₹';

  // Subtotal calculation
  const subtotal = ticketItems.reduce((acc, t) => acc + t.item.price * t.quantity, 0);

  // Discount calculation
  const percentageDiscount = (subtotal * discountPercent) / 100;
  const maxCoinsRedeemable = matchedCustomer ? Math.min(matchedCustomer.loyalty_coins || 0, subtotal - percentageDiscount) : 0;
  const coinDiscount = redeemCoins ? maxCoinsRedeemable : 0;
  const totalDiscount = percentageDiscount + coinDiscount;

  const afterDiscount = Math.max(0, subtotal - totalDiscount);
  const taxRate = settings?.tax_enabled ? settings.tax_percentage || 5 : 0;
  const tax = (afterDiscount * taxRate) / 100;
  const grandTotal = Math.round(afterDiscount + tax);

  const handleAddItem = (item: MenuItem) => {
    setTicketItems((prev) => {
      const existing = prev.find((t) => t.item.id === item.id);
      if (existing) {
        return prev.map((t) => (t.item.id === item.id ? { ...t, quantity: t.quantity + 1 } : t));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setTicketItems((prev) => {
      return prev
        .map((t) => {
          if (t.item.id === itemId) {
            const newQty = t.quantity + delta;
            return newQty > 0 ? { ...t, quantity: newQty } : null;
          }
          return t;
        })
        .filter(Boolean) as { item: MenuItem; quantity: number }[];
    });
  };

  const handleClearTicket = () => {
    setTicketItems([]);
    setDiscountPercent(0);
    setRedeemCoins(false);
    setCustomerPhone('');
    setCustomerName('');
    setMatchedCustomer(null);
  };

  const handleCheckout = async () => {
    if (!restaurant || ticketItems.length === 0) return;
    setIsProcessing(true);
    try {
      const orderItems: OrderItem[] = ticketItems.map((t) => ({
        menu_item_id: t.item.id,
        item_name_snapshot: t.item.name,
        unit_price_snapshot: t.item.price,
        quantity: t.quantity,
        total: t.item.price * t.quantity,
      }));

      // Generate and settle bill immediately
      const bill = await supabaseService.createBill({
        restaurant_id: restaurant.id,
        customer_name: customerName.trim() || 'Counter Guest',
        customer_phone: customerPhone.trim() || 'Walk-in',
        subtotal,
        tax,
        discount: totalDiscount,
        total: grandTotal,
        items: orderItems,
        table_number: orderType === 'DINE_IN' ? selectedTable : 'Takeaway',
      });

      if (bill) {
        setLastBill(bill);

        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch {}

        // WhatsApp Bill Trigger if customer phone entered
        if (customerPhone.trim() && settings) {
          const url = buildBillWhatsAppUrl({
            restaurant,
            settings,
            bill,
            customerName: customerName.trim() || 'Valued Guest',
            customerPhone: customerPhone.trim(),
            items: orderItems,
          });
          window.open(url, '_blank');
        }

        handleClearTicket();
      }
    } catch (e) {
      console.error('Checkout error:', e);
      alert('Error generating POS bill.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category_id !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
      }
      return true;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C1713] p-5 rounded-3xl border border-[#2B221A]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#241D17] border border-[#352B21] flex items-center justify-center text-[#9BB89E]">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#FAF8F5] tracking-tight">
              Counter POS & Walk-in Billing
            </h1>
            <p className="text-xs text-[#8E7E73] mt-0.5">
              Speedy table & takeaway checkout • Cash, UPI, Cards & WhatsApp receipts • {restaurant?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearTicket}
            className="px-3 py-1.5 rounded-xl bg-[#241D17] hover:bg-[#2C241D] text-[#8E7E73] hover:text-[#EDE7DF] border border-[#352A20] text-xs font-semibold transition-colors"
          >
            Clear Ticket
          </button>
        </div>
      </div>

      {/* POS Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Menu Item Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Categories */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8E7E73] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food item (Burger, Coffee, Pizza...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1C1713] border border-[#2B221A] text-xs sm:text-sm text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72] placeholder:text-[#695B52]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#C29B72] text-[#14110E]'
                    : 'bg-[#1C1713] text-[#8E7E73] border border-[#2B221A] hover:text-[#EDE7DF]'
                }`}
              >
                All Items
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-[#C29B72] text-[#14110E]'
                      : 'bg-[#1C1713] text-[#8E7E73] border border-[#2B221A] hover:text-[#EDE7DF]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Item Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAddItem(item)}
                className="p-3.5 rounded-2xl bg-[#1C1713] border border-[#2B221A] hover:border-[#3E3126] cursor-pointer select-none transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${
                        item.is_veg ? 'bg-[#5F7A62]' : 'bg-[#B35C4A]'
                      }`}
                    />
                    <span className="text-[10px] font-semibold text-[#7A6B60] line-clamp-1">
                      {categories.find((c) => c.id === item.category_id)?.name || 'General'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#FAF8F5] group-hover:text-[#D4AD85] transition-colors line-clamp-2">
                    {item.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#28201A]">
                  <span className="text-xs font-bold text-[#D4AD85]">
                    {formatCurrency(item.price, currency)}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#251E18] group-hover:bg-[#C29B72] group-hover:text-[#14110E] flex items-center justify-center text-[#8E7E73] transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Ticket & Billing (5 Cols) */}
        <div className="lg:col-span-5 bg-[#1C1713] rounded-3xl border border-[#2B221A] p-5 space-y-4 shadow-xl sticky top-4">
          <div className="flex items-center justify-between border-b border-[#28201A] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#FAF8F5] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#C29B72]" />
                Active Ticket
              </h3>
              <span className="text-[10px] text-[#8E7E73]">
                {ticketItems.length} {ticketItems.length === 1 ? 'item' : 'items'} in ticket
              </span>
            </div>

            {/* Dine-in vs Takeaway toggle */}
            <div className="flex bg-[#221A15] p-0.5 rounded-xl border border-[#30251D] text-[11px] font-semibold">
              <button
                onClick={() => setOrderType('DINE_IN')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  orderType === 'DINE_IN' ? 'bg-[#C29B72] text-[#14110E] font-bold' : 'text-[#8E7E73]'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setOrderType('TAKEAWAY')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  orderType === 'TAKEAWAY' ? 'bg-[#C29B72] text-[#14110E] font-bold' : 'text-[#8E7E73]'
                }`}
              >
                Takeaway
              </button>
              <button
                onClick={() => setOrderType('PICKUP')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  orderType === 'PICKUP' ? 'bg-[#C29B72] text-[#14110E] font-bold' : 'text-[#8E7E73]'
                }`}
              >
                Pickup
              </button>
            </div>
          </div>

          {/* Table Selector if Dine In */}
          {orderType === 'DINE_IN' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#8E7E73] whitespace-nowrap">Table:</span>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="flex-1 bg-[#221A15] border border-[#32271F] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#EDE7DF] focus:outline-hidden"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.table_number}>
                    Table {t.table_number}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Customer CRM Capture & Loyalty Lookup */}
          <div className="bg-[#211A15] p-3 rounded-2xl border border-[#2D231B] space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73] block">
              Guest Details (Optional WhatsApp Bill):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Mobile (10 digits)"
                className="bg-[#181310] border border-[#2B211A] rounded-xl px-3 py-1.5 text-xs text-[#EDE7DF] placeholder:text-[#66574D] focus:outline-hidden"
              />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="bg-[#181310] border border-[#2B211A] rounded-xl px-3 py-1.5 text-xs text-[#EDE7DF] placeholder:text-[#66574D] focus:outline-hidden"
              />
            </div>

            {matchedCustomer && (
              <div className="flex items-center justify-between bg-[#261E18] border border-[#3C3026] p-2 rounded-xl text-xs text-[#D8C7B8]">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-[#C29B72]" />
                  <span>
                    <strong>{matchedCustomer.loyalty_tier}</strong>: {matchedCustomer.loyalty_coins || 0} coins
                  </span>
                </div>
                {maxCoinsRedeemable > 0 && (
                  <button
                    onClick={() => setRedeemCoins(!redeemCoins)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      redeemCoins
                        ? 'bg-[#C29B72] border-[#C29B72] text-[#14110E]'
                        : 'bg-[#2D231B] border-[#3D3126] text-[#A8988C]'
                    }`}
                  >
                    {redeemCoins ? 'Coins Applied (-₹' + maxCoinsRedeemable + ')' : 'Redeem Coins'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Ticket Items List */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-none">
            {ticketItems.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#7A6B60] font-medium">
                Tap dishes on the left to add to order
              </p>
            ) : (
              ticketItems.map((t) => (
                <div
                  key={t.item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#211B16] border border-[#2D241D] text-xs"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-semibold text-[#FAF8F5] line-clamp-1">{t.item.name}</p>
                    <p className="text-[10px] text-[#8E7E73]">
                      {formatCurrency(t.item.price, currency)} × {t.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleUpdateQty(t.item.id, -1)}
                      className="w-5 h-5 rounded bg-[#2A211B] hover:bg-[#342B23] text-[#EDE7DF] flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-[#FAF8F5]">{t.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(t.item.id, 1)}
                      className="w-5 h-5 rounded bg-[#2A211B] hover:bg-[#342B23] text-[#EDE7DF] flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="w-16 text-right font-bold text-[#D4AD85]">
                      {formatCurrency(t.item.price * t.quantity, currency)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discounts & Payment Modes */}
          <div className="border-t border-[#28201A] pt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8E7E73]">Discount:</span>
              <div className="flex items-center gap-1">
                {[0, 5, 10, 15].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      discountPercent === pct ? 'bg-[#C29B72] text-[#14110E]' : 'bg-[#221A15] text-[#8E7E73]'
                    }`}
                  >
                    {pct === 0 ? 'None' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1 text-xs border-t border-[#28201A] pt-2">
              <div className="flex justify-between text-[#8E7E73]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-[#9BB89E] font-semibold">
                  <span>Discount</span>
                  <span>-{formatCurrency(totalDiscount, currency)}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between text-[#8E7E73]">
                  <span>GST ({taxRate}%)</span>
                  <span>{formatCurrency(tax, currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[#FAF8F5] text-base pt-1 border-t border-[#28201A]">
                <span>Total Due</span>
                <span className="text-[#D4AD85]">{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2">
              <span className="text-[10px] font-semibold uppercase text-[#8E7E73] block mb-1.5">
                Payment Method:
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
                {(['CASH', 'UPI', 'CARD', 'SPLIT'] as PaymentMethod[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setPaymentMethod(mode);
                      if (mode === 'UPI') setShowUpiModal(true);
                    }}
                    className={`py-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === mode
                        ? 'bg-[#C29B72] text-[#14110E] font-bold border-[#C29B72]'
                        : 'bg-[#201A16] text-[#8E7E73] border-[#2E241D] hover:text-[#EDE7DF]'
                    }`}
                  >
                    {mode === 'CASH' && <DollarSign className="w-3.5 h-3.5" />}
                    {mode === 'UPI' && <QrCode className="w-3.5 h-3.5" />}
                    {mode === 'CARD' && <CreditCard className="w-3.5 h-3.5" />}
                    {mode === 'SPLIT' && <Receipt className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pay & Print Button */}
            <button
              onClick={handleCheckout}
              disabled={ticketItems.length === 0 || isProcessing}
              className="w-full py-3 rounded-2xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#C29B72]/20 disabled:opacity-50 transition-all mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Complete & Bill {formatCurrency(grandTotal, currency)} ({paymentMethod})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* UPI QR Code Modal for Customer Scanning */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-[#14110E]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#EAE3D8] rounded-3xl p-6 max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 text-[#2A231E]">
            <div className="w-12 h-12 rounded-2xl bg-[#F4ECE1] text-[#7A5A38] border border-[#E2D5C3] flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2A231E]">Scan UPI to Pay</h3>
              <p className="text-xs text-[#7A6B60] mt-0.5">
                Amount: <strong className="text-[#8A5C2B]">{formatCurrency(grandTotal, currency)}</strong>
              </p>
            </div>

            {/* UPI QR Preview Placeholder */}
            <div className="p-4 bg-white rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-xs border border-[#EAE3D8]">
              <div className="text-center text-xs space-y-1">
                <QrCode className="w-24 h-24 mx-auto text-[#2A231E]" />
                <p className="text-[10px] font-semibold text-[#7A6B60]">GPay • PhonePe • Paytm</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F5EFE6] border border-[#E2D6C5] text-xs text-[#694E34] font-mono">
              UPI ID: {settings?.upi_id || `${restaurant?.slug}@upi`}
            </div>

            <button
              onClick={() => setShowUpiModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#241D17] hover:bg-[#30261E] text-[#FAF8F5] font-bold text-xs shadow-xs"
            >
              Payment Confirmed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
