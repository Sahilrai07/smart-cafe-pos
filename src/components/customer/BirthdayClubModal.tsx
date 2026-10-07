'use client';

import React, { useState } from 'react';
import { Restaurant, RestaurantSettings } from '@/types';
import { supabaseService } from '@/lib/services/supabaseService';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !birthday || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Save to Supabase
      await supabaseService.joinBirthdayClub({
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
    } catch (err) {
      console.error('Error joining birthday club:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#14110E]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-[#FAF8F5] shadow-2xl transition-all border border-[#EAE3D8] animate-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#EDE7DF] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Banner Accent */}
          <div className="bg-gradient-to-br from-[#241D17] to-[#1C1713] px-6 pt-8 pb-7 text-[#EDE7DF] text-center relative overflow-hidden border-b border-[#2E241C]">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#C29B72]/10 rounded-full blur-xl" />
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C29B72]/15 border border-[#C29B72]/30 mb-3 shadow-inner">
              <Gift className="w-7 h-7 text-[#D4AD85]" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[#EDE7DF]">
              Join {restaurant.name} Birthday Club
            </h3>
            <p className="text-xs text-[#A89887] mt-1 max-w-xs mx-auto leading-relaxed">
              Celebrate your special day with an exclusive curated treat on us.
            </p>
          </div>

          <div className="p-6">
            {isSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#EDF3EE] text-[#5F7A62] border border-[#5F7A62]/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-[#2A231E]">
                  You&apos;re in the Birthday Club!
                </h4>
                <p className="text-xs text-[#7A6B5D] max-w-xs mx-auto leading-relaxed">
                  We&apos;ve saved your birthday. Look out for a special surprise on WhatsApp 7 days before your celebration!
                </p>
                <div className="p-3.5 bg-[#F5F0E8] border border-[#EAE3D8] rounded-2xl text-left text-xs text-[#5A4D41] mt-3">
                  <span className="font-semibold text-[#2A231E] flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#C29B72]" />
                    Your Upcoming Surprise:
                  </span>
                  {settings.birthday_offer_text || 'Complimentary specialty dessert or beverage on your celebration!'}
                </div>
                <button
                  onClick={onClose}
                  className="w-full mt-4 py-3 rounded-xl bg-[#2A231E] hover:bg-[#3D322B] text-[#FAF8F5] text-sm font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-[#F5F0E8] border border-[#EAE3D8] rounded-2xl text-xs text-[#5A4D41] flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#C29B72] shrink-0" />
                  <span>
                    <strong className="text-[#2A231E]">Birthday Treat:</strong> {settings.birthday_offer_text || 'Complimentary treat during your birthday week!'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D41] mb-1">
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
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EAE3D8] bg-white text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/30 focus:border-[#C29B72]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D41] mb-1">
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
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EAE3D8] bg-white text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/30 focus:border-[#C29B72]"
                    />
                  </div>
                  <p className="text-[10px] text-[#A89887] mt-1">
                    Your birthday gift voucher will be delivered here.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D41] mb-1">
                    Your Birthday *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#A89887] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EAE3D8] bg-white text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/30 focus:border-[#C29B72]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D41] mb-1">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A89887] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EAE3D8] bg-white text-sm text-[#2A231E] focus:outline-hidden focus:ring-2 focus:ring-[#C29B72]/30 focus:border-[#C29B72]"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded-sm border-[#EAE3D8] text-[#C29B72] focus:ring-[#C29B72]"
                  />
                  <label htmlFor="consent" className="text-[11px] text-[#7A6B5D] leading-tight">
                    I agree to receive a friendly birthday greeting & cafe voucher once a year.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-sm shadow-md shadow-[#C29B72]/20 transition-all cursor-pointer"
                >
                  Join Birthday Club
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
