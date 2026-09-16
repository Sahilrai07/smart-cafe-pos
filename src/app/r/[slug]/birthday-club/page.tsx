'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Restaurant, RestaurantSettings } from '@/types';
import { cafeStore, subscribeToStore } from '@/lib/store';
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

  useEffect(() => {
    const r = cafeStore.getRestaurantBySlug(slug) || cafeStore.getAllRestaurants()[0];
    if (r) {
      setRestaurant(r);
      setSettings(cafeStore.getSettings(r.id));
    }
    return subscribeToStore(() => {
      const updated = cafeStore.getRestaurantBySlug(slug);
      if (updated) {
        setRestaurant(updated);
        setSettings(cafeStore.getSettings(updated.id));
      }
    });
  }, [slug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !name || !phone || !birthday) return;

    cafeStore.joinBirthdayClub({
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
  };

  if (!restaurant || !settings) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        <Link
          href={`/r/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Menu
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 p-7 text-white text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Gift className="w-7 h-7 text-amber-200" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {restaurant.name} Birthday Club
            </h1>
            <p className="text-xs text-amber-100 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Tell us your birthday once, and we will treat you to a special surprise every year!
            </p>
          </div>

          <div className="p-6 sm:p-7">
            {isSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  Welcome to the Birthday Club, {name}! 🎉
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                  We have saved your birthday. Seven days before your birthday, you will receive a personalized surprise voucher directly on WhatsApp ({phone})!
                </p>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs text-amber-950">
                  <strong className="flex items-center gap-1 mb-1 text-amber-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Special Birthday Offer:
                  </strong>
                  {settings.birthday_offer_text || 'Complimentary chocolate lava cake or 15% OFF your celebration!'}
                </div>
                <Link
                  href={`/r/${slug}`}
                  className="inline-block w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors mt-2"
                >
                  Return to Menu
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Your Gift:</strong> {settings.birthday_offer_text}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    We will never share your personal information.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 transition-all"
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
