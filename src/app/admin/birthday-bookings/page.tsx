'use client';

import React, { useState, useEffect } from 'react';
import { cafeStore, subscribeToStore } from '@/lib/store';
import { BirthdayBooking, BookingStatus, Restaurant } from '@/types';
import {
  PartyPopper,
  Calendar,
  Clock,
  Users,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function AdminBirthdayBookingsPage() {
  const [bookings, setBookings] = useState<BirthdayBooking[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const refresh = () => {
    const rId = cafeStore.getActiveRestaurantId();
    const r = cafeStore.getRestaurantById(rId);
    setRestaurant(r || null);
    if (r) {
      setBookings(cafeStore.getBookings(r.id));
    }
  };

  useEffect(() => {
    refresh();
    return subscribeToStore(refresh);
  }, []);

  const handleUpdateStatus = (id: string, status: BookingStatus) => {
    cafeStore.updateBookingStatus(id, status);
    refresh();
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
          <h1 className="text-2xl font-black text-white tracking-tight">
            Birthday & Party Reservations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Incoming customer inquiries for party celebrations, balloon setups, and custom cakes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-950 rounded-3xl border border-slate-800">
            <PartyPopper className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">No party bookings yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Customers can book celebrations directly through the &ldquo;Celebrate Birthday&rdquo; page on the QR menu.
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      {booking.customer_name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        booking.package === 'Premium'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : booking.package === 'Custom'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {booking.package} Package
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{booking.phone}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    booking.status === 'NEW'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : booking.status === 'CONFIRMED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Date
                  </span>
                  <div className="font-bold text-slate-200 mt-0.5">{booking.date}</div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Time
                  </span>
                  <div className="font-bold text-slate-200 mt-0.5">{booking.time}</div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    Guests
                  </span>
                  <div className="font-bold text-slate-200 mt-0.5">{booking.guests} People</div>
                </div>
              </div>

              {booking.special_request && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-amber-400 block mb-0.5">Special Requests:</span>
                  {booking.special_request}
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleWhatsAppCustomer(booking)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp Customer</span>
                </button>

                {booking.status === 'NEW' && (
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                    className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                  >
                    Confirm
                  </button>
                )}

                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
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
