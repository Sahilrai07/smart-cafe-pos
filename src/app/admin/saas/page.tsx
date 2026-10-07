'use client';

import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { Restaurant, SubscriptionPlan, CafeSubscription } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Crown,
  Sparkles,
  Building2,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ExternalLink,
  Shield,
  Check,
  X,
  Clock,
  Layers,
} from 'lucide-react';

export default function SaaSSubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<CafeSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // New Cafe Onboarding Form
  const [cafeName, setCafeName] = useState('');
  const [cafeSlug, setCafeSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [planId, setPlanId] = useState<'STARTER_500' | 'GROWTH_1000' | 'PRO_1500'>('GROWTH_1000');
  const [address, setAddress] = useState('');

  const refreshData = async () => {
    try {
      const [subs, planList] = await Promise.all([
        supabaseService.getSubscriptions(),
        supabaseService.getSaasPlans(),
      ]);
      setSubscriptions(subs);
      setPlans(planList);
    } catch (e) {
      console.error('Error loading SaaS data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleRegisterCafe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafeName.trim() || !cafeSlug.trim()) return;

    await supabaseService.registerNewCafe({
      name: cafeName,
      slug: cafeSlug,
      phone,
      whatsapp_number: whatsapp || phone,
      plan_id: planId,
      address,
    });

    setCafeName('');
    setCafeSlug('');
    setPhone('');
    setWhatsapp('');
    setAddress('');
    setIsRegisterOpen(false);
    refreshData();
    alert(`🎉 Cafe "${cafeName}" registered successfully on ${planId}!`);
  };

  const handleToggleStatus = (subId: string, current: string) => {
    const nextStatus = current === 'ACTIVE' ? 'RENEWAL_DUE' : current === 'RENEWAL_DUE' ? 'EXPIRED' : 'ACTIVE';
    supabaseService.updateSubscriptionStatus(subId, nextStatus as any);
    refreshData();
  };

  // Metrics
  const totalMRR = subscriptions
    .filter((s) => s.status === 'ACTIVE' || s.status === 'RENEWAL_DUE')
    .reduce((sum, s) => sum + s.price_per_month, 0);

  const totalARR = totalMRR * 12;
  const activeCafes = subscriptions.filter((s) => s.status === 'ACTIVE').length;
  const renewalsDue = subscriptions.filter((s) => s.status === 'RENEWAL_DUE').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#241D17] to-[#1C1713] border border-[#2B221A] p-6 sm:p-8 text-[#EDE7DF] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#C29B72]/15 border border-[#C29B72]/30 text-[#D4AD85]">
              <Crown className="w-3.5 h-3.5" />
              Platform Super Admin Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDE7DF] mt-2">
              SaaS Multi-Cafe Platform
            </h1>
            <p className="text-xs sm:text-sm text-[#A89887] mt-1 max-w-xl">
              Host and manage partner cafes on unified infrastructure • Subscription billing ₹500–₹1,500/mo • Instant onboarding
            </p>
          </div>

          <button
            onClick={() => setIsRegisterOpen(true)}
            className="px-5 py-3 rounded-2xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs flex items-center gap-2 shadow-xl shadow-[#C29B72]/20 transition-all self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Cafe</span>
          </button>
        </div>
      </div>

      {/* MRR & SaaS Platform Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A89887]">Monthly Recurring Revenue</span>
          <div className="text-2xl font-bold text-[#9BB89E] mt-1">₹{totalMRR.toLocaleString()}</div>
          <span className="text-[10px] text-[#7A6B5D]">Across {subscriptions.length} registered cafes</span>
        </div>
        <div className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A89887]">Annual Run-Rate</span>
          <div className="text-2xl font-bold text-[#D4AD85] mt-1">₹{totalARR.toLocaleString()}</div>
          <span className="text-[10px] text-[#7A6B5D]">Projected 12-month revenue</span>
        </div>
        <div className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A89887]">Active Paid Cafes</span>
          <div className="text-2xl font-bold text-[#EDE7DF] mt-1">{activeCafes}</div>
          <span className="text-[10px] text-[#7A6B5D]">Live operational accounts</span>
        </div>
        <div className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A89887]">Renewals Due This Month</span>
          <div className="text-2xl font-bold text-[#DF9182] mt-1">{renewalsDue}</div>
          <span className="text-[10px] text-[#7A6B5D]">AutoPay tracking</span>
        </div>
      </div>

      {/* Subscription Pricing Plans (₹500 - ₹1,500/mo) */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#EDE7DF] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D4AD85]" />
          SaaS Monthly Subscription Tiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between relative transition-all shadow-xl ${
                p.popular
                  ? 'bg-[#241D17] border-[#C29B72] ring-1 ring-[#C29B72]/30'
                  : 'bg-[#1C1713] border-[#2B221A]'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C29B72] text-[#14110E] shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <h4 className="text-base font-bold text-[#EDE7DF]">{p.name}</h4>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-[#EDE7DF]">₹{p.price_per_month}</span>
                  <span className="text-xs text-[#A89887]">/ month</span>
                </div>
                <p className="text-xs text-[#A89887] mt-1">
                  {p.max_tables > 50 ? 'Unlimited QR Tables' : `Up to ${p.max_tables} QR Tables`} • {p.multi_branch ? 'Multi-Branch Enabled' : 'Single Outlet'}
                </p>

                <div className="mt-4 pt-4 border-t border-[#2B221A] space-y-2 text-xs">
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-[#A89887]">
                      <Check className="w-3.5 h-3.5 text-[#9BB89E] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setPlanId(p.id);
                  setIsRegisterOpen(true);
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs mt-6 transition-all cursor-pointer ${
                  p.popular
                    ? 'bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] shadow-md shadow-[#C29B72]/20'
                    : 'bg-[#241D17] hover:bg-[#2B221A] text-[#EDE7DF] border border-[#2B221A]'
                }`}
              >
                Onboard on {p.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Registered Cafes & Subscriptions Table */}
      <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#2B221A] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#EDE7DF] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#D4AD85]" />
              Registered Cafes on Platform ({subscriptions.length})
            </h3>
            <p className="text-xs text-[#A89887]">Manage cafe billing cycle, renewal status, and isolated dashboards</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2B221A] text-[10px] font-bold uppercase tracking-wider text-[#A89887]">
                <th className="pb-3">Cafe Name</th>
                <th className="pb-3">Subscribed Plan</th>
                <th className="pb-3">Monthly Fee</th>
                <th className="pb-3">Billing Status</th>
                <th className="pb-3">Next Renewal</th>
                <th className="pb-3">Payment Method</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B221A]/60">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#241D17] transition-colors">
                  <td className="py-3 font-bold text-[#EDE7DF]">
                    <span className="block text-sm">{sub.restaurant_name}</span>
                    <span className="text-[10px] text-[#7A6B5D]">ID: {sub.restaurant_id.slice(0, 8)}...</span>
                  </td>
                  <td className="py-3 font-semibold text-[#EDE7DF]">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#241D17] border border-[#2B221A] text-[#D4AD85]">
                      {sub.plan_name}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-[#EDE7DF] text-sm">
                    ₹{sub.price_per_month} <span className="text-[10px] font-normal text-[#A89887]">/mo</span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleStatus(sub.id, sub.status)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                        sub.status === 'ACTIVE'
                          ? 'bg-[#5F7A62]/20 text-[#9BB89E] border border-[#5F7A62]/30'
                          : sub.status === 'RENEWAL_DUE'
                          ? 'bg-[#C29B72]/20 text-[#D4AD85] border border-[#C29B72]/30'
                          : 'bg-[#B35C4A]/20 text-[#DF9182] border border-[#B35C4A]/30'
                      }`}
                    >
                      {sub.status === 'ACTIVE' ? 'Active Paid' : sub.status === 'RENEWAL_DUE' ? 'Renewal Due' : 'Expired'}
                    </button>
                  </td>
                  <td className="py-3 text-[#EDE7DF] font-semibold">{sub.renewal_date}</td>
                  <td className="py-3 text-[#A89887] font-medium">{sub.payment_method}</td>
                  <td className="py-3 text-right space-x-1.5">
                    <button
                      onClick={() => {
                        cafeStore.setActiveRestaurantId(sub.restaurant_id);
                        window.location.href = '/admin';
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      Open Admin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Onboard New Cafe */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-[#14110E]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1713] border border-[#2B221A] rounded-3xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2B221A] pb-3">
              <h3 className="text-base font-bold text-[#EDE7DF] flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#D4AD85]" />
                Onboard New Cafe Client
              </h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="w-7 h-7 rounded-full bg-[#241D17] text-[#A89887] hover:text-[#EDE7DF] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterCafe} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#A89887] mb-1">Cafe / Restaurant Name *</label>
                <input
                  type="text"
                  required
                  value={cafeName}
                  onChange={(e) => {
                    setCafeName(e.target.value);
                    if (!cafeSlug) setCafeSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="e.g. Artisanal Roasters"
                  className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89887] mb-1">URL Slug * (Unique)</label>
                <div className="flex items-center bg-[#14110E] border border-[#2B221A] rounded-xl px-3 py-1.5 text-xs text-[#A89887]">
                  <span>.../r/</span>
                  <input
                    type="text"
                    required
                    value={cafeSlug}
                    onChange={(e) => setCafeSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="artisanal-roasters"
                    className="flex-1 bg-transparent text-[#EDE7DF] font-bold focus:outline-hidden ml-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89887] mb-1">Subscription Plan *</label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                >
                  <option value="STARTER_500">Starter Cafe (₹499/mo) — 8 Tables, QR Menu, Live Orders</option>
                  <option value="GROWTH_1000">Growth Restro (₹999/mo) — Unlimited Tables, POS, Loyalty & CRM</option>
                  <option value="PRO_1500">Pro Enterprise (₹1,499/mo) — Multi-Branch, Full Finance P&L, Staff</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A89887] mb-1">Owner Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A89887] mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89887] mb-1">Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot 10, MG Road, Pune"
                  className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs transition-colors mt-2 cursor-pointer shadow-md shadow-[#C29B72]/20"
              >
                Register & Activate Subscription
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
