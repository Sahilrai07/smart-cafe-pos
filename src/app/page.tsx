'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClientQRCode } from '@/components/common/ClientQRCode';
import { useClientOrigin } from '@/lib/useClientOrigin';
import { getStoredUser, CafeUser } from '@/lib/auth';
import {
  Coffee,
  QrCode,
  UtensilsCrossed,
  Receipt,
  Users,
  Cake,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Lock,
  ChefHat,
  CreditCard,
  Coins,
  TrendingUp,
  Layers,
  ChevronRight,
  Boxes,
} from 'lucide-react';

export default function HomePage() {
  const origin = useClientOrigin();
  const [currentUser, setCurrentUser] = useState<CafeUser | null>(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  const demoQrPath = '/r/quick-bite/t/01';
  const demoDisplayUrl = origin ? `${origin}${demoQrPath}` : demoQrPath;

  return (
    <div className="min-h-screen bg-[#120F0D] text-[#EDE7DF] selection:bg-[#C29B72]/30 selection:text-[#EDE7DF]">
      {/* Top Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#C29B72]/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-[#B35C4A]/10 rounded-full blur-[140px]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#14110E]/85 border-b border-[#28211B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-[#221B17] border border-[#3A2E25] group-hover:border-[#C29B72]/50 flex items-center justify-center text-[#C29B72] shadow-md transition-colors">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#FAF8F5]">
                RestroOS
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C29B72]/15 text-[#D4AD85] border border-[#C29B72]/25">
                Hospitality Platform
              </span>
            </div>
          </Link>

          {/* Center Nav Links (Hidden on small screens) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#A4968B]">
            <a href="#features" className="hover:text-[#EDE7DF] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#EDE7DF] transition-colors">
              How It Works
            </a>
            <a href="#demo" className="hover:text-[#EDE7DF] transition-colors">
              Interactive Demo
            </a>
            <a href="#security" className="hover:text-[#EDE7DF] transition-colors">
              Tenant Privacy
            </a>
          </nav>

          {/* Top Right Action Button: Cafe Owner Login */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#C29B72]/20 transition-all cursor-pointer"
              >
                <span>My Dashboard ({currentUser.username})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#C29B72] to-[#B38758] hover:from-[#B89066] hover:to-[#A77B4D] text-[#14110E] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#C29B72]/20 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cafe Owner Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F1813] border border-[#32271E] text-[#D4AD85] text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C29B72]" />
          <span>Multi-Tenant Intelligent Restaurant Operating System</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-[#FAF8F5]">
          Frictionless Table QR Ordering, Live Kitchen KDS &{' '}
          <span className="bg-gradient-to-r from-[#EDE7DF] via-[#D4AD85] to-[#C29B72] bg-clip-text text-transparent">
            Automated WhatsApp Loyalty
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#9E8E81] leading-relaxed max-w-2xl mx-auto font-medium">
          Transform your cafe with zero-contact digital table menus, instant kitchen tickets, express counter POS billing, and high-retention WhatsApp Birthday marketing.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          <Link
            href="/admin/login"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#C29B72] to-[#B38758] hover:from-[#B89066] hover:to-[#A77B4D] text-[#14110E] font-black text-sm flex items-center gap-2.5 shadow-xl shadow-[#C29B72]/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Sign In to Your Cafe Portal</span>
          </Link>

          <a
            href="#demo"
            className="px-6 py-3.5 rounded-2xl bg-[#1C1713] hover:bg-[#251E18] text-[#EDE7DF] font-bold text-sm border border-[#30261F] flex items-center gap-2 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#C29B72]" />
            <span>Try Customer Live Demo</span>
          </a>
        </div>

        {/* Feature Highlights Pills */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#8C7C70] font-semibold">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Isolated Cafe Databases
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero App Downloads Required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant Kitchen Ticket Chimes
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1-Click WhatsApp Invoicing
          </span>
        </div>
      </section>

      {/* Interactive Demonstration Box */}
      <section id="demo" className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-3xl bg-[#181310] border border-[#2D231B] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left QR Code Scan Box */}
            <div className="lg:col-span-5 flex flex-col items-center text-center p-6 bg-[#130F0D] rounded-3xl border border-[#2A2119] shadow-inner">
              <div className="w-10 h-10 rounded-2xl bg-[#C29B72]/15 border border-[#C29B72]/30 text-[#D4AD85] flex items-center justify-center mb-2 font-bold text-lg">
                📱
              </div>
              <h2 className="text-base font-bold text-[#FAF8F5]">Scan with your Phone</h2>
              <p className="text-xs text-[#8C7C70] mt-0.5">Sample Digital Table 01 Standee</p>

              <div className="my-4 p-4 bg-white rounded-2xl shadow-lg border border-[#EDE7DF] inline-block">
                <ClientQRCode path={demoQrPath} size={180} level="M" />
              </div>

              <span className="text-xs font-semibold text-[#D4AD85]">
                Point camera at QR code to test
              </span>
              <p className="text-[11px] text-[#7A6B60] mt-1 max-w-xs font-mono break-all">
                {demoDisplayUrl}
              </p>

              <a
                href={demoQrPath}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 px-4 py-2 rounded-xl bg-[#201A16] hover:bg-[#28201B] text-[#EDE7DF] text-xs font-semibold border border-[#322820] flex items-center gap-1.5 transition-colors"
              >
                <span>Launch Table 01 in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Right Flow Description */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AD85]">
                Guest & Staff Workflow
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#FAF8F5] tracking-tight">
                How Modern Cafes Operate with RestroOS
              </h3>

              <div className="space-y-3.5 pt-2">
                {[
                  {
                    step: '1',
                    title: 'Guest Scans Acrylic Table Standee',
                    desc: 'Menu opens instantly with rich food imagery, dietary tags, chef pairings, and pricing. Zero app install or registration barrier.',
                  },
                  {
                    step: '2',
                    title: 'Order Dispatches Instantly to Kitchen (KDS)',
                    desc: 'Selected items chime directly onto the Kitchen Display Screen with order timer and table identification.',
                  },
                  {
                    step: '3',
                    title: 'Cashier Express POS Billing',
                    desc: 'Counter cashier punches orders, accepts UPI/Cash/Card payments, and generates GST-compliant bills in 2 seconds.',
                  },
                  {
                    step: '4',
                    title: 'WhatsApp Click-to-Chat Digital Receipt',
                    desc: 'System generates formatted WhatsApp bill text. Customer automatically enrolls into your recurring VIP CRM.',
                  },
                  {
                    step: '5',
                    title: '7-Day Automated Birthday Celebration Club',
                    desc: 'System flags upcoming customer birthdays 7 days ahead for annual treats, driving guaranteed repeat footfall.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-lg bg-[#C29B72]/15 text-[#D4AD85] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#C29B72]/30">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#FAF8F5]">{item.title}</h4>
                      <p className="text-[11px] text-[#9E8E81] leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Modules Grid */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C29B72]">
            Comprehensive Suite
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#FAF8F5]">
            Everything Your Restaurant Needs Under One Roof
          </h2>
          <p className="text-xs sm:text-sm text-[#8C7C70]">
            Modular tools built specifically for cafes, restrobars, bakeries, and quick-service diners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: QrCode,
              title: 'QR Table Ordering',
              desc: 'High-speed digital menu with instant cart, category filters, and live table service bell requests.',
            },
            {
              icon: ChefHat,
              title: 'Kitchen KDS Display',
              desc: 'Real-time kitchen order tickets with urgency color coding, dish checklists, and completion bells.',
            },
            {
              icon: CreditCard,
              title: 'Express Counter POS',
              desc: 'Fast touch billing with split payments, bill merging, dynamic discounts, and thermal print formats.',
            },
            {
              icon: Cake,
              title: 'WhatsApp Birthday Club',
              desc: 'Automated 7-day birthday reminder engine that sends personalized invitation offers to loyal guests.',
            },
            {
              icon: Coins,
              title: 'Loyalty & Reward Coins',
              desc: 'Reward repeat diners with loyalty points automatically credited on every visit with tier upgrades.',
            },
            {
              icon: Boxes,
              title: 'Inventory & Stock Tracker',
              desc: 'Ingredient level tracking with low-stock warnings, cost per unit calculations, and supplier logs.',
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#181310] border border-[#2B221B] hover:border-[#3D2F24] transition-all space-y-3 shadow-lg"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#221B17] border border-[#34271E] flex items-center justify-center text-[#C29B72]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#FAF8F5]">{feature.title}</h3>
                <p className="text-xs text-[#8C7C70] leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security & Multi-Tenant Isolation Guarantee Section */}
      <section id="security" className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="p-8 rounded-3xl bg-[#16120F] border border-[#2B2119] text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#FAF8F5]">
            Enterprise-Grade Multi-Tenant Isolation & Privacy
          </h3>
          <p className="text-xs sm:text-sm text-[#9E8E81] max-w-2xl mx-auto leading-relaxed">
            Every cafe on RestroOS operates in a strictly isolated, encrypted silo. Cafe owners only have access to their own dashboard, orders, inventory, staff, and customer records. No competitor can ever see or access your restaurant details.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#221B17] hover:bg-[#2C231E] border border-[#3A2E25] text-xs font-bold text-[#C29B72] transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In with Your Scoped Cafe Credentials</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center space-y-5">
        <h2 className="text-2xl sm:text-4xl font-black text-[#FAF8F5]">
          Ready to Elevate Your Dining Operations?
        </h2>
        <p className="text-xs sm:text-sm text-[#8C7C70] max-w-xl mx-auto">
          Log into your cafe control room or test with credentials (e.g. Cafe 1 or Cafe 2).
        </p>
        <div className="pt-2">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C29B72] to-[#B38758] hover:from-[#B89066] hover:to-[#A77B4D] text-[#14110E] font-black text-sm uppercase tracking-wider shadow-xl shadow-[#C29B72]/20 transition-all hover:scale-105 cursor-pointer"
          >
            <span>Open Cafe Owner Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#241D17] py-8 text-center text-xs text-[#6B5C51] space-y-2">
        <p>RestroOS • Cloud POS, Kitchen Display & Contactless Hospitality</p>
        <p className="text-[11px] text-[#55483F]">
          © {new Date().getFullYear()} RestroOS. All restaurant tenant records encrypted & strictly confidential.
        </p>
      </footer>
    </div>
  );
}
