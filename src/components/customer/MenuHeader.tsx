import React from 'react';
import Link from 'next/link';
import { Restaurant, Table } from '@/types';
import { Utensils, Sparkles, MapPin, Phone } from 'lucide-react';

interface MenuHeaderProps {
  restaurant: Restaurant;
  table?: Table | null;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({ restaurant, table }) => {
  return (
    <header className="relative bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

      <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt={restaurant.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-sm border border-slate-100 ring-2 ring-amber-500/10"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-500/20">
                <Utensils className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  {restaurant.name}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Open
                </span>
              </div>
              {restaurant.address && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 line-clamp-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {restaurant.address}
                </p>
              )}
              {restaurant.phone && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  {restaurant.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {table ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Table {table.table_number}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                Takeaway / Counter
              </div>
            )}

            <Link
              href={`/r/${restaurant.slug}/celebrate`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100/70 px-2.5 py-1 rounded-full border border-orange-200/60 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-orange-500" />
              Celebrate Birthday
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
