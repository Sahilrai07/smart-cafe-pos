'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Restaurant } from '@/types';
import { supabaseService } from '@/lib/services/supabaseService';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadRest() {
      try {
        const r = (await supabaseService.getRestaurantBySlug(slug)) || (await supabaseService.getAllRestaurants())[0];
        setRestaurant(r || null);
      } catch (e) {
        console.error('Error loading restaurant:', e);
      }
    }
    loadRest();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !name || !phone || !date || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await supabaseService.createBooking({
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
    } catch (err) {
      console.error('Error submitting party booking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Back Link */}
        <Link
          href={`/r/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A4D41] hover:text-[#2A231E] mb-4 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE3D8] shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Menu
        </Link>

        {/* Hero Card */}
        <div className="rounded-3xl bg-[#241D17] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-6 border border-[#342A22]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C29B72] via-[#E8D8C4] to-[#C29B72]" />
          <div className="w-12 h-12 rounded-2xl bg-[#342A22] border border-[#4A3C31] flex items-center justify-center mb-3">
            <PartyPopper className="w-6 h-6 text-[#C29B72]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDE7DF] leading-tight">
            Celebrate at {restaurant.name} ☕
          </h1>
          <p className="text-xs sm:text-sm text-[#C4B5A5] mt-2 max-w-md leading-relaxed">
            Planning a birthday party, gathering, or special celebration? Let our team craft the table ambiance, artisanal cake, and music!
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl p-8 border border-[#EAE3D8] shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#EDF3EE] text-[#5F7A62] border border-[#5F7A62]/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#2A231E]">Celebration Request Received!</h2>
            <p className="text-xs sm:text-sm text-[#5A4D41] leading-relaxed max-w-md mx-auto">
              Thank you, <strong>{name}</strong>. Our team at {restaurant.name} has received your {pkg} celebration inquiry for {guests} guests on {date} at {time}. We will message you on WhatsApp ({phone}) shortly to confirm details.
            </p>
            <Link
              href={`/r/${slug}`}
              className="inline-block px-6 py-3 rounded-2xl bg-[#241D17] text-[#FAF8F5] text-xs font-bold hover:bg-[#18130F] transition-colors"
            >
              Return to Menu
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D8] shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-[#2A231E] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C29B72]" />
              Party Reservation & Arrangements
            </h2>

            {/* Package Choice */}
            <div>
              <label className="block text-xs font-bold text-[#2A231E] mb-2">
                Choose Celebration Package
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Basic', 'Premium', 'Custom'] as const).map((p) => (
                  <div
                    key={p}
                    onClick={() => setPkg(p)}
                    className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                      pkg === p
                        ? 'border-[#C29B72] bg-[#F5F0E8] ring-2 ring-[#C29B72]/20 text-[#2A231E]'
                        : 'border-[#EAE3D8] bg-[#FAF8F5] hover:border-[#D4AD85] text-[#5A4D41]'
                    }`}
                  >
                    <div className="text-xs font-bold">{p}</div>
                    <div className="text-[10px] text-[#A89887] mt-1">
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
                <label className="block text-xs font-bold text-[#2A231E] mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Simran Kaur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/20 focus:border-[#C29B72] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A231E] mb-1.5">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/20 focus:border-[#C29B72] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A231E] mb-1.5">
                  Celebration Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/20 focus:border-[#C29B72] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A231E] mb-1.5">
                  Time
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 7:30 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/20 focus:border-[#C29B72] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2A231E] mb-1.5">
                Estimated Number of Guests
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={2}
                  max={40}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                  className="flex-1 accent-[#C29B72]"
                />
                <span className="text-xs font-bold px-3 py-1 bg-[#F5F0E8] border border-[#EAE3D8] rounded-lg text-[#2A231E]">
                  {guests} Guests
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2A231E] mb-1.5">
                Special Requests / Cake Preferences
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Chocolate truffle cake with name 'Aarav', quiet corner table..."
                className="w-full p-3 rounded-xl border border-[#EAE3D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/20 focus:border-[#C29B72] placeholder:text-[#A89887] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#C29B72] hover:bg-[#A88259] text-white font-bold text-sm shadow-md shadow-[#C29B72]/20 transition-all cursor-pointer"
            >
              Submit Celebration Inquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
