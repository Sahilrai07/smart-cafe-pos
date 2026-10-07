import React from 'react';
import Link from 'next/link';
import { Restaurant, Table } from '@/types';
import { Coffee, MapPin, Phone } from 'lucide-react';

interface MenuHeaderProps {
  restaurant: Restaurant;
  table?: Table | null;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({ restaurant, table }) => {
  return (
    <header className="relative bg-[#FAF8F5] border-b border-[#EAE3D8] shadow-[0_2px_12px_-4px_rgba(40,32,24,0.04)]">
      {/* Top Accent Line - Warm Caramel */}
      <div className="h-1 w-full bg-[#C29B72]" />

      <div className="max-w-3xl mx-auto px-4 py-3.5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt={restaurant.name}
                className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl object-cover border border-[#E4DCCE] shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-[#F0E8DC] text-[#7A5A38] flex items-center justify-center font-bold text-lg border border-[#E2D6C5]">
                <Coffee className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#2A231E] leading-tight">
                  {restaurant.name}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDF3EE] text-[#48634C] border border-[#D3E0D5]">
                  Open Now
                </span>
              </div>
              {restaurant.address && (
                <p className="text-xs text-[#7A6B60] flex items-center gap-1 mt-0.5 line-clamp-1">
                  <MapPin className="w-3 h-3 text-[#A8988C] shrink-0" />
                  {restaurant.address}
                </p>
              )}
              {restaurant.phone && (
                <p className="text-xs text-[#948477] flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-[#A8988C] shrink-0" />
                  {restaurant.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {table ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F2ECE1] text-[#6E4E2C] border border-[#E2D5C3]">
                <span className="w-2 h-2 rounded-full bg-[#C29B72]" />
                Table {table.table_number}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFE9DF] text-[#695A4E]">
                Takeaway / Pickup
              </div>
            )}
            <Link
              href={`/r/${restaurant.slug}/birthday-club`}
              className="text-[11px] text-[#9A6D3E] hover:text-[#7A5228] font-semibold transition-colors underline decoration-[#C29B72]/40 underline-offset-2"
            >
              🎂 Birthday Club
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
