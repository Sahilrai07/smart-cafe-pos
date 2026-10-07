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
  onPlaceOrder: (specialInstructions: string, orderType?: 'DINE_IN' | 'PICKUP') => Promise<void>;
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
  const [orderType, setOrderType] = useState<'DINE_IN' | 'PICKUP'>('DINE_IN');
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
      await onPlaceOrder(instructions, orderType);
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
        className="fixed inset-0 bg-[#14110E]/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-x-0 bottom-0 max-h-[90vh] bg-[#FAF8F5] rounded-t-3xl shadow-2xl flex flex-col z-50 max-w-lg mx-auto overflow-hidden animate-in slide-in-from-bottom duration-250 border-t border-[#EAE3D8]">
        {/* Drawer Handle */}
        <div className="w-10 h-1 bg-[#DDD3C4] rounded-full mx-auto my-3" />

        {/* Header */}
        <div className="px-5 pb-3 border-b border-[#EAE3D8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F2ECE1] text-[#7A5A38] border border-[#E2D6C5] flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2A231E] leading-tight">Your Order</h2>
              <p className="text-xs text-[#8A796D]">
                {table ? `Table ${table.table_number}` : 'Self-Pickup'} • {restaurant.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFE8DE] hover:bg-[#E4DCCE] text-[#6A5A4E] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-[#EAE3D8]">
          {cartItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[#8A796D] font-medium text-sm">Your order is empty</p>
              <button
                onClick={onClose}
                className="mt-3 text-xs text-[#8A5C2B] font-bold hover:underline"
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
                          ? 'border-[#5F7A62] bg-[#EDF3EE]'
                          : 'border-[#B35C4A] bg-[#F9EFEB]'
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${
                          menu_item.is_veg ? 'bg-[#5F7A62]' : 'bg-[#B35C4A]'
                        }`}
                      />
                    </span>
                    <h4 className="text-sm font-semibold text-[#2A231E] truncate">
                      {menu_item.name}
                    </h4>
                  </div>
                  <p className="text-xs text-[#8A796D] mt-0.5">
                    {formatCurrency(menu_item.price, currency)} each
                  </p>
                </div>

                {/* Quantity Buttons */}
                <div className="flex items-center gap-2 bg-[#F2ECE1] px-2 py-1 rounded-full border border-[#DDD1C0]">
                  <button
                    onClick={() => onUpdateQuantity(menu_item.id, -1)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-[#4A3D32] hover:bg-[#FAF8F5] shadow-xs text-xs font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-4 text-center text-xs font-bold text-[#2A231E]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(menu_item.id, 1)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-[#4A3D32] hover:bg-[#FAF8F5] shadow-xs text-xs font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right w-16">
                  <span className="text-sm font-bold text-[#2A231E]">
                    {formatCurrency(menu_item.price * quantity, currency)}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Cooking Instructions */}
          {cartItems.length > 0 && (
            <div className="pt-4 pb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#5A4B40] mb-1.5">
                <ChefHat className="w-3.5 h-3.5 text-[#C29B72]" />
                Special Preparation Notes (Optional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Oat milk if available, extra hot, less sugar..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E0D7C9] focus:outline-hidden focus:border-[#C29B72] text-[#2A231E] bg-white placeholder:text-[#A8988C]"
              />
            </div>
          )}
        </div>

        {/* Bill Summary & Order Button */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-white border-t border-[#EAE3D8]">
            {/* Service Type Option */}
            <div className="flex items-center justify-between mb-3 bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE3D8] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setOrderType('DINE_IN')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                  orderType === 'DINE_IN'
                    ? 'bg-[#241D17] text-[#FAF8F5] font-bold shadow-xs'
                    : 'text-[#6A5A4E] hover:text-[#2A231E]'
                }`}
              >
                🍽️ Table Service
              </button>
              <button
                type="button"
                onClick={() => setOrderType('PICKUP')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                  orderType === 'PICKUP'
                    ? 'bg-[#241D17] text-[#FAF8F5] font-bold shadow-xs'
                    : 'text-[#6A5A4E] hover:text-[#2A231E]'
                }`}
              >
                🛍️ Self-Pickup Counter
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-[#6A5A4E] mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({totalItemsCount} items)</span>
                <span className="font-semibold text-[#2A231E]">{formatCurrency(subtotal, currency)}</span>
              </div>
              {settings.tax_enabled && (
                <div className="flex justify-between">
                  <span>Taxes / GST ({settings.tax_percentage}%)</span>
                  <span className="font-semibold text-[#2A231E]">{formatCurrency(tax, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#2A231E] pt-2 border-t border-[#EAE3D8]">
                <span>Total Due</span>
                <span className="text-base text-[#8A5C2B]">
                  {formatCurrency(grandTotal, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={handleOrderSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#C29B72] hover:bg-[#B58D64] active:scale-[0.99] text-[#14110E] font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#C29B72]/20 transition-all disabled:opacity-60"
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
            <p className="text-[11px] text-center text-[#8A796D] mt-2">
              Instant kitchen ticket • Fast & contactless
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
