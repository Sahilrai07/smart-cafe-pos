'use client';

import React, { useState } from 'react';
import { CartItem, Restaurant, RestaurantSettings, Table } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, X, Plus, Minus, ChefHat, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  restaurant: Restaurant;
  settings: RestaurantSettings;
  table?: Table | null;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onPlaceOrder: (specialInstructions: string) => Promise<void>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  restaurant,
  settings,
  table,
  onUpdateQuantity,
  onPlaceOrder,
}) => {
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = settings.currency || '₹';
  const totalItemsCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = cartItems.reduce((acc, i) => acc + i.menu_item.price * i.quantity, 0);
  const tax = settings.tax_enabled ? (subtotal * (settings.tax_percentage || 5)) / 100 : 0;
  const grandTotal = subtotal + tax;

  const handleOrderSubmit = async () => {
    if (cartItems.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onPlaceOrder(instructions);
      setInstructions('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-3xl shadow-2xl flex flex-col z-50 max-w-lg mx-auto overflow-hidden animate-in slide-in-from-bottom duration-250">
        {/* Drawer Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3" />

        {/* Header */}
        <div className="px-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Your Order</h2>
              <p className="text-xs text-slate-500">
                {table ? `Table ${table.table_number}` : 'Takeaway'} • {restaurant.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-slate-100">
          {cartItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 font-medium">Your cart is empty</p>
              <button
                onClick={onClose}
                className="mt-3 text-sm text-amber-600 font-bold hover:underline"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cartItems.map(({ menu_item, quantity }) => (
              <div key={menu_item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-xs flex items-center justify-center border ${
                        menu_item.is_veg
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-red-600 bg-red-50'
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${
                          menu_item.is_veg ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      />
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {menu_item.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatCurrency(menu_item.price, currency)} each
                  </p>
                </div>

                {/* Quantity Buttons */}
                <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                  <button
                    onClick={() => onUpdateQuantity(menu_item.id, -1)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-slate-700 hover:bg-slate-200 shadow-2xs text-xs font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-4 text-center text-xs font-extrabold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(menu_item.id, 1)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-slate-700 hover:bg-slate-200 shadow-2xs text-xs font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right w-16">
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(menu_item.price * quantity, currency)}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Cooking Instructions */}
          {cartItems.length > 0 && (
            <div className="pt-4 pb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <ChefHat className="w-3.5 h-3.5 text-amber-500" />
                Special Cooking Instructions (Optional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Less spicy, extra sauce, bring water first..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-800 bg-slate-50 placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* Bill Summary & Order Button */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-slate-50 border-t border-slate-200/80">
            <div className="space-y-1.5 text-xs text-slate-600 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({totalItemsCount} items)</span>
                <span className="font-semibold">{formatCurrency(subtotal, currency)}</span>
              </div>
              {settings.tax_enabled && (
                <div className="flex justify-between">
                  <span>GST ({settings.tax_percentage}%)</span>
                  <span className="font-semibold">{formatCurrency(tax, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-base text-amber-600">
                  {formatCurrency(grandTotal, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={handleOrderSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Sending to Kitchen...</span>
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              No account or app download needed • Instant kitchen receipt
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
