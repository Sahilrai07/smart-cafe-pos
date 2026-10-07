'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Restaurant, RestaurantSettings } from '@/types';
import { supabaseService } from '@/lib/services/supabaseService';
import confetti from 'canvas-confetti';
import {
  Gift,
  ArrowLeft,
  Calendar,
  Phone,
  User,
  Mail,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function BirthdayClubJoinPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  const [name, setName] = useState(searchParams.get('name') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const r = (await supabaseService.getRestaurantBySlug(slug)) || (await supabaseService.getAllRestaurants())[0];
        if (r) {
          setRestaurant(r);
          const s = await supabaseService.getSettings(r.id);
          setSettings(s);
        }
      } catch (e) {
        console.error('Error loading restaurant for birthday join:', e);
      }
    }
    loadData();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !name || !phone || !birthday || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await supabaseService.joinBirthdayClub({
        restaurant_id: restaurant.id,
        name,
        phone,
        birthday,
        email: email || undefined,
      });

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Error joining birthday club:', err);
      alert('Could not complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!restaurant || !settings) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        <Link
          href={`/r/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A4D41] hover:text-[#2A231E] mb-4 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE3D8] shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Menu
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#EAE3D8]">
          <div className="bg-[#241D17] p-7 text-white text-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C29B72] via-[#E8D8C4] to-[#C29B72]" />
            <div className="w-14 h-14 rounded-2xl bg-[#342A22] border border-[#4A3C31] flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Gift className="w-7 h-7 text-[#C29B72]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#EDE7DF]">
              {restaurant.name} Birthday Club
            </h1>
            <p className="text-xs text-[#C4B5A5] mt-1.5 max-w-xs mx-auto leading-relaxed">
              Tell us your birthday once, and we will treat you to a special surprise every year!
            </p>
          </div>

          <div className="p-6 sm:p-7 bg-white">
            {isSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#EDF3EE] text-[#5F7A62] border border-[#5F7A62]/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-[#2A231E]">
                  Welcome to the Birthday Club, {name}! ☕
                </h2>
                <p className="text-xs sm:text-sm text-[#5A4D41] leading-relaxed max-w-xs mx-auto">
                  We have saved your birthday. Seven days before your special day, you will receive a personalized surprise voucher directly on WhatsApp ({phone})!
                </p>
                <div className="p-4 bg-[#F5F0E8] border border-[#EAE3D8] rounded-2xl text-left text-xs text-[#2A231E]">
                  <strong className="flex items-center gap-1.5 mb-1 text-[#8A5C2B]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C29B72]" />
                    Special Birthday Offer:
                  </strong>
                  {settings.birthday_offer_text || 'Complimentary artisanal pastry or 15% OFF your celebration!'}
                </div>
                <Link
                  href={`/r/${slug}`}
                  className="inline-block w-full py-3 rounded-xl bg-[#241D17] hover:bg-[#18130F] text-[#FAF8F5] text-xs font-bold transition-colors mt-2"
                >
                  Return to Menu
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3.5 bg-[#F5F0E8] border border-[#EAE3D8] rounded-2xl text-xs text-[#5A4D41] flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#C29B72] shrink-0" />
                  <span>
                    <strong className="text-[#2A231E]">Your Gift:</strong> {settings.birthday_offer_text}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A231E] mb-1.5">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A89887] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EAE3D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/20 focus:border-[#C29B72] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A231E] mb-1.5">
                    WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#A89887] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EAE3D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/20 focus:border-[#C29B72] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A231E] mb-1.5">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#A89887] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EAE3D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/20 focus:border-[#C29B72] transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-[#A89887] mt-1">
                    We will never share your personal information.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A231E] mb-1.5">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A89887] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EAE3D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/20 focus:border-[#C29B72] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#C29B72] hover:bg-[#A88259] text-white font-bold text-sm shadow-md shadow-[#C29B72]/20 transition-all cursor-pointer"
                >
                  Join Birthday Club 🎂
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
