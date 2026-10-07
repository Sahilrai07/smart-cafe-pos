'use client';

import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { BirthdayBooking, BookingStatus, Restaurant } from '@/types';
import {
  PartyPopper,
  Calendar,
  Clock,
  Users,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Sparkles,
  Send,
} from 'lucide-react';

export default function AdminBirthdayBookingsPage() {
  const [bookings, setBookings] = useState<BirthdayBooking[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const refresh = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const list = await supabaseService.getBookings(r.id);
        setBookings(list);
      }
    } catch (e) {
      console.error('Error loading party bookings:', e);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    await supabaseService.updateBookingStatus(id, status);
    await refresh();
  };

  const handleWhatsAppCustomer = (booking: BirthdayBooking) => {
    const clean = booking.phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
    const message = `Hey ${booking.customer_name}! 👋 This is from ${restaurant?.name || 'Quick Bite Cafe'}. We received your celebration inquiry for ${booking.guests} guests on ${booking.date}. We would love to finalize your ${booking.package} party setup! 🎉`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#EDE7DF] tracking-tight">
            Celebration & Party Bookings
          </h1>
          <p className="text-xs text-[#A89887] mt-1">
            Customer inquiries for private celebrations, decor packages, and custom cakes • {restaurant?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-[#1C1713] rounded-3xl border border-[#2B221A] shadow-xl">
            <PartyPopper className="w-10 h-10 text-[#7A6B5D] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#EDE7DF]">No celebration inquiries yet</p>
            <p className="text-xs text-[#A89887] mt-1">
              Customers can book celebrations directly through the cafe digital menu.
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-6 rounded-3xl bg-[#1C1713] border border-[#2B221A] space-y-4 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#EDE7DF]">
                      {booking.customer_name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                        booking.package === 'Premium'
                          ? 'bg-[#C29B72]/15 text-[#D4AD85] border border-[#C29B72]/30'
                          : booking.package === 'Custom'
                          ? 'bg-[#9E784C]/20 text-[#E0C09B] border border-[#9E784C]/30'
                          : 'bg-[#7A6B5D]/20 text-[#EDE7DF] border border-[#7A6B5D]/30'
                      }`}
                    >
                      {booking.package} Package
                    </span>
                  </div>
                  <p className="text-xs text-[#A89887] font-mono mt-0.5">{booking.phone}</p>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    booking.status === 'NEW'
                      ? 'bg-[#B35C4A]/20 text-[#DF9182] border border-[#B35C4A]/30'
                      : booking.status === 'CONFIRMED'
                      ? 'bg-[#5F7A62]/20 text-[#9BB89E] border border-[#5F7A62]/30'
                      : 'bg-[#241D17] text-[#7A6B5D] border border-[#2B221A]'
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-[#241D17] rounded-xl border border-[#2B221A]">
                  <span className="text-[10px] text-[#A89887] font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#7A6B5D]" />
                    Date
                  </span>
                  <div className="font-semibold text-[#EDE7DF] mt-0.5">{booking.date}</div>
                </div>

                <div className="p-2.5 bg-[#241D17] rounded-xl border border-[#2B221A]">
                  <span className="text-[10px] text-[#A89887] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#7A6B5D]" />
                    Time
                  </span>
                  <div className="font-semibold text-[#EDE7DF] mt-0.5">{booking.time}</div>
                </div>

                <div className="p-2.5 bg-[#241D17] rounded-xl border border-[#2B221A]">
                  <span className="text-[10px] text-[#A89887] font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#7A6B5D]" />
                    Guests
                  </span>
                  <div className="font-semibold text-[#EDE7DF] mt-0.5">{booking.guests} Guests</div>
                </div>
              </div>

              {booking.special_request && (
                <div className="p-3 bg-[#241D17] rounded-xl border border-[#2B221A] text-xs text-[#EDE7DF]">
                  <span className="font-semibold text-[#D4AD85] block mb-0.5">Special Requests:</span>
                  {booking.special_request}
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleWhatsAppCustomer(booking)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#5F7A62] hover:bg-[#4E6751] text-[#FAF8F5] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#5F7A62]/20 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp Customer</span>
                </button>

                {booking.status === 'NEW' && (
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                    className="py-2 px-3 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs cursor-pointer shadow-md shadow-[#C29B72]/20 transition-colors"
                  >
                    Confirm
                  </button>
                )}

                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                    className="py-2 px-3 rounded-xl bg-[#241D17] hover:bg-[#2B221A] text-[#EDE7DF] border border-[#2B221A] font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
