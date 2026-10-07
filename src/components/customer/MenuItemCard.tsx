import React from 'react';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  currency?: string;
  onAdd: () => void;
  onRemove: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  quantity,
  currency = '₹',
  onAdd,
  onRemove,
}) => {
  return (
    <div
      className={`group relative flex items-start justify-between gap-4 p-4 rounded-2xl bg-white border transition-all duration-200 shadow-[0_2px_10px_-2px_rgba(40,32,24,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(40,32,24,0.08)] ${
        item.available
          ? 'border-[#EAE3D8] hover:border-[#D4C0A7]'
          : 'border-[#EAE3D8] bg-[#F8F5F0]/60 opacity-60 pointer-events-none'
      }`}
    >
      <div className="flex-1 min-w-0">
        {/* Calm Veg/Non-Veg Badge */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span
            className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center border ${
              item.is_veg
                ? 'border-[#5F7A62] bg-[#EDF3EE]'
                : 'border-[#B35C4A] bg-[#F9EFEB]'
            }`}
            title={item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.is_veg ? 'bg-[#5F7A62]' : 'bg-[#B35C4A]'
              }`}
            />
          </span>
          <span className="text-[11px] font-medium text-[#8A796D]">
            {item.is_veg ? 'Vegetarian' : 'Non-Veg'}
          </span>
        </div>

        {/* Item Title & Price */}
        <h3 className="text-[15px] font-semibold text-[#2A231E] tracking-tight leading-snug group-hover:text-[#694F36] transition-colors">
          {item.name}
        </h3>
        <p className="text-sm font-bold text-[#8A5C2B] mt-1">
          {formatCurrency(item.price, currency)}
        </p>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-[#7A6B60] mt-1.5 line-clamp-2 leading-relaxed font-normal">
            {item.description}
          </p>
        )}
      </div>

      {/* Item Image & Action Button */}
      <div className="relative flex flex-col items-center shrink-0 w-24 sm:w-28">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#F5F0E8] border border-[#EBE3D7] shadow-xs">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#B0A195] text-xs font-medium">
              Cafe Special
            </div>
          )}
          {!item.available && (
            <div className="absolute inset-0 bg-[#1A1512]/60 backdrop-blur-2xs flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#FAF8F5] px-2 py-0.5 rounded-full bg-[#B35C4A]/90">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Quantity Controls - Soft Caramel Stepper */}
        <div className="absolute -bottom-2.5 z-10">
          {item.available && (
            <>
              {quantity === 0 ? (
                <button
                  type="button"
                  onClick={onAdd}
                  className="flex items-center gap-1 px-3.5 py-1 rounded-full bg-[#FAF7F2] hover:bg-[#C29B72] text-[#69533C] hover:text-[#14110E] text-xs font-bold uppercase tracking-wider border border-[#DDD1C0] hover:border-[#C29B72] shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#C29B72] text-[#14110E] text-xs font-bold shadow-md ring-2 ring-white">
                  <button
                    type="button"
                    onClick={onRemove}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-[#A88057] text-[#14110E] hover:bg-[#977149] active:scale-90 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-4 text-center font-bold text-xs">{quantity}</span>
                  <button
                    type="button"
                    onClick={onAdd}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-[#A88057] text-[#14110E] hover:bg-[#977149] active:scale-90 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
