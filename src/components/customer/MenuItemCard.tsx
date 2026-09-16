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
      className={`group relative flex items-start justify-between gap-4 p-4 rounded-2xl bg-white border transition-all duration-200 shadow-2xs hover:shadow-md ${
        item.available
          ? 'border-slate-200/90 hover:border-amber-400/50'
          : 'border-slate-200 bg-slate-50/60 opacity-60 pointer-events-none'
      }`}
    >
      <div className="flex-1 min-w-0">
        {/* Veg/Non-Veg Badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center border ${
              item.is_veg
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-red-600 bg-red-50'
            }`}
            title={item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.is_veg ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            />
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {item.is_veg ? 'Vegetarian' : 'Non-Veg'}
          </span>
        </div>

        {/* Item Title & Price */}
        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-amber-950">
          {item.name}
        </h3>
        <p className="text-sm font-bold text-amber-600 mt-1">
          {formatCurrency(item.price, currency)}
        </p>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Item Image & Action Button */}
      <div className="relative flex flex-col items-center shrink-0 w-24 sm:w-28">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-2xs">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-semibold">
              Quick Bite
            </div>
          )}
          {!item.available && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-white px-2 py-0.5 rounded-full bg-red-500/80">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="absolute -bottom-2.5 z-10">
          {item.available && (
            <>
              {quantity === 0 ? (
                <button
                  type="button"
                  onClick={onAdd}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-white hover:bg-amber-500 hover:text-white text-amber-600 text-xs font-extrabold uppercase tracking-wider border-2 border-amber-500 shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              ) : (
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md ring-2 ring-white">
                  <button
                    type="button"
                    onClick={onRemove}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-600/80 hover:bg-amber-700 active:scale-90 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-4 text-center font-extrabold text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={onAdd}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-600/80 hover:bg-amber-700 active:scale-90 transition-colors"
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
