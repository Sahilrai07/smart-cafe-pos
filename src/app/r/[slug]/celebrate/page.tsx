'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Restaurant } from '@/types';
import { cafeStore, subscribeToStore } from '@/lib/store';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Gift,
  PartyPopper,
  MessageSquare,
} from 'lucide-react';

export default function BirthdayCelebratePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('7:00 PM');
  const [guests, setGuests] = useState(6);
  const [pkg, setPkg] = useState<'Basic' | 'Premium' | 'Custom'>('Premium');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const r = cafeStore.getRestaurantBySlug(slug) || cafeStore.getAllRestaurants()[0];
    setRestaurant(r || null);
    return subscribeToStore(() => {
      const updated = cafeStore.getRestaurantBySlug(slug);
      setRestaurant(updated || null);
    });
  }, [slug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !name || !phone || !date) return;

    cafeStore.createBooking({
      restaurant_id: restaurant.id,
      customer_name: name,
      phone,
      date,
      time,
      guests,
      package: pkg,
      special_request: notes || null,
      status: 'NEW',
    });

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setSubmitted(true);
  };

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Back Link */}
        <Link
          href={`/r/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Menu
        </Link>

        {/* Hero Card */}
        <div className="rounded-3xl bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <PartyPopper className="w-6 h-6 text-amber-200" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Celebrate at {restaurant.name} 🎉
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-2 max-w-md leading-relaxed">
            Planning a birthday party, anniversary, or special celebration? Let our team handle the decorations, cake, and music!
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Celebration Request Sent!</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Thank you, <strong>{name}</strong>. Our staff at {restaurant.name} has received your {pkg} celebration inquiry for {guests} guests on {date} at {time}. We will message you on WhatsApp ({phone}) to confirm package details.
            </p>
            <Link
              href={`/r/${slug}`}
              className="inline-block px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Return to Menu
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Party Reservation & Decoration
            </h2>

            {/* Package Choice */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Choose Celebration Package
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Basic', 'Premium', 'Custom'] as const).map((p) => (
                  <div
                    key={p}
                    onClick={() => setPkg(p)}
                    className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                      pkg === p
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 text-amber-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{p}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {p === 'Basic' && 'Balloons & Table setup'}
                      {p === 'Premium' && 'Fairy lights, Cake, Music'}
                      {p === 'Custom' && 'Full custom theme'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Simran Kaur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Celebration Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 7:30 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Number of Guests
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={2}
                  max={40}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                  className="flex-1 accent-amber-500"
                />
                <span className="text-xs font-extrabold px-3 py-1 bg-slate-100 rounded-lg text-slate-800">
                  {guests} Guests
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Requests / Cake Preferences
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Chocolate truffle cake with name 'Aarav', photo corner..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 transition-all"
            >
              Submit Celebration Inquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
