'use client';

import React, { useState } from 'react';
import { Restaurant, RestaurantSettings } from '@/types';
import { cafeStore } from '@/lib/store';
import confetti from 'canvas-confetti';
import { Gift, X, Sparkles, CheckCircle2, Calendar, Phone, User, Mail } from 'lucide-react';

interface BirthdayClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  settings: RestaurantSettings;
  initialName?: string;
  initialPhone?: string;
}

export const BirthdayClubModal: React.FC<BirthdayClubModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  settings,
  initialName = '',
  initialPhone = '',
}) => {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [consent, setConsent] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !birthday) return;

    // Save to store
    cafeStore.joinBirthdayClub({
      restaurant_id: restaurant.id,
      name,
      phone,
      birthday,
      email: email || undefined,
    });

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
      });
    } catch {
      // ignore
    }

    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-slate-100 animate-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Banner Accent */}
          <div className="bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 px-6 pt-8 pb-7 text-white text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md mb-3 ring-4 ring-white/20 shadow-inner">
              <Gift className="w-7 h-7 text-amber-200" />
            </div>
            <h3 className="text-xl font-black tracking-tight">
              Join {restaurant.name} Birthday Club! 🎂
            </h3>
            <p className="text-xs text-amber-100 mt-1 max-w-xs mx-auto leading-relaxed">
              Celebrate your special day with us and get an exclusive surprise gift!
            </p>
          </div>

          <div className="p-6">
            {isSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  You&apos;re in the Birthday Club! 🎉
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  We&apos;ve recorded your birthday. Look out for a special surprise on WhatsApp 7 days before your birthday!
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs text-amber-900 mt-3">
                  <span className="font-bold flex items-center gap-1 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Your Upcoming Surprise:
                  </span>
                  {settings.birthday_offer_text || 'Free special dessert or 15% discount on your bill!'}
                </div>
                <button
                  onClick={onClose}
                  className="w-full mt-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-950 flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>
                    <strong>Birthday Treat:</strong> {settings.birthday_offer_text || 'Complimentary treat on your birthday week!'}
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
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
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
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Your birthday gift voucher will be delivered here.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Birthday *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>
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
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded-sm border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <label htmlFor="consent" className="text-[11px] text-slate-500 leading-tight">
                    I agree to receive a friendly WhatsApp birthday greeting & exclusive cafe offer once a year.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 transition-all"
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
};
