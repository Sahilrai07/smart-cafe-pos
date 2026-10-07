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
  Activity,
  Boxes,
  Bell,
  Clock,
  ChevronRight,
  Flame,
  Check,
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
    <div className="min-h-screen bg-[#08090D] text-[#EDE7DF] selection:bg-[#F59E0B]/30 selection:text-[#EDE7DF] font-sans antialiased overflow-x-hidden">
      {/* Background Ambient Glows (Option 1 Signature Neon & Amber Accents) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Amber Central Core Glow */}
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[650px] bg-gradient-to-b from-[#F59E0B]/18 via-[#D97706]/8 to-transparent rounded-full blur-[160px]" />
        {/* Secondary Indigo/Purple Accent Glows */}
        <div className="absolute top-[35%] left-[-10%] w-[550px] h-[550px] bg-[#6366F1]/8 rounded-full blur-[170px]" />
        <div className="absolute top-[45%] right-[-10%] w-[600px] h-[600px] bg-[#F59E0B]/10 rounded-full blur-[180px]" />
        {/* Subtle Geometric Grid Matrix */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #EDE7DF 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Modern High-Tech Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#090A0F]/80 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E170E] to-[#2E2012] border border-[#F59E0B]/40 group-hover:border-[#F59E0B] flex items-center justify-center text-[#F59E0B] shadow-[0_0_25px_rgba(245,158,11,0.25)] transition-all">
              <Coffee className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-black tracking-tight text-white">
                Restro<span className="text-[#F59E0B]">OS</span>
              </span>
              <span className="hidden sm:inline-flex text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/25">
                v2.4 Cloud
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#9CA3AF]">
            <a href="#demo" className="hover:text-white transition-colors">
              Platform Demo
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              KDS & POS Suite
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Order Workflow
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Data Isolation
            </a>
          </nav>

          {/* Top Right: Glowing Cafe Owner Login Button */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] text-[#090A0F] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Dashboard ({currentUser.username})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] text-[#090A0F] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.03] cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cafe Owner Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION: Option 1 High-Tech Glassmorphism Showcase */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Headline & Value Prop */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-md text-[#FBBF24] text-xs font-bold shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Next-Gen Operating System for Modern Cafes</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Next-Gen Operating System for{' '}
            <span className="bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#EA580C] bg-clip-text text-transparent">
              Modern Cafes
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
            Optimize operations, delight customers, and scale your business with the ultimate cloud-based platform for cafes, bistros, and small restaurants.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link
              href="/admin/login"
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] text-[#090A0F] font-black text-sm uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_35px_rgba(245,158,11,0.45)] transition-all hover:scale-105 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to Cafe Portal</span>
            </Link>

            <a
              href="#demo"
              className="px-7 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-sm border border-white/[0.12] backdrop-blur-xl flex items-center gap-2 transition-all hover:border-white/[0.25] cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#F59E0B]" />
              <span>Explore Live Demo</span>
            </a>
          </div>
        </div>

        {/* FLOATING GLASSMORPHISM PREVIEW CARDS (The visual heart of Option 1) */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Card 1: Contactless QR Table Ordering (Left Column - 4 cols) */}
          <div className="md:col-span-4 rounded-3xl bg-white/[0.03] border border-white/[0.09] hover:border-[#F59E0B]/40 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">
                    Contactless QR Ordering
                  </h3>
                  <p className="text-[10px] text-[#9CA3AF]">Table Standee Scanner</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-white border border-white/[0.1]">
                Table 01
              </span>
            </div>

            {/* Live QR Code Box */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-[#0C0E14] border border-white/[0.06] shadow-inner mb-4">
              <div className="p-3 bg-white rounded-xl shadow-md inline-block">
                <ClientQRCode path={demoQrPath} size={130} level="M" />
              </div>
              <p className="text-[11px] font-medium text-[#9CA3AF] mt-2.5 text-center">
                Scan with any smartphone camera
              </p>
            </div>

            {/* Sample Quick Action Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs">
                <span className="font-semibold text-white">Cold Brew Coffee</span>
                <span className="text-[#F59E0B] font-bold">₹180</span>
              </div>
              <a
                href={demoQrPath}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#090A0F] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Open Digital Menu</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: Instant Billing & Financial Metrics (Center Column - 4 cols) */}
          <div className="md:col-span-4 rounded-3xl bg-white/[0.03] border border-white/[0.09] hover:border-[#F59E0B]/40 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">
                    Instant Billing Metrics
                  </h3>
                  <p className="text-[10px] text-[#9CA3AF]">Live Financial Telemetry</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 text-center mb-5">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">Today</p>
                <p className="text-sm font-black text-white mt-0.5">₹18,450</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">Orders</p>
                <p className="text-sm font-black text-white mt-0.5">89</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">Avg Ticket</p>
                <p className="text-sm font-black text-white mt-0.5">₹207</p>
              </div>
            </div>

            {/* Glowing SVG Wave Chart */}
            <div className="p-3 rounded-2xl bg-[#0C0E14] border border-white/[0.06]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#9CA3AF] mb-2">
                <span>Peak Hour Velocity</span>
                <span className="text-emerald-400">+24% vs yesterday</span>
              </div>
              <div className="h-20 w-full relative">
                <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Fill Area */}
                  <path
                    d="M 0,65 Q 40,20 80,45 T 160,25 T 240,15 T 300,30 L 300,80 L 0,80 Z"
                    fill="url(#chartGradient)"
                  />
                  {/* Stroke Line */}
                  <path
                    d="M 0,65 Q 40,20 80,45 T 160,25 T 240,15 T 300,30"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Glowing Pulse Dot */}
                  <circle cx="240" cy="15" r="4.5" fill="#F59E0B" className="animate-ping" />
                  <circle cx="240" cy="15" r="4" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Live Kitchen Display KDS (Right Column - 4 cols) */}
          <div className="md:col-span-4 rounded-3xl bg-white/[0.03] border border-white/[0.09] hover:border-[#F59E0B]/40 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">
                    Live Kitchen Display
                  </h3>
                  <p className="text-[10px] text-[#9CA3AF]">Chimes & Prep Status</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25">
                KDS Queue (3)
              </span>
            </div>

            {/* Live Kitchen Order Tickets */}
            <div className="space-y-2.5">
              {/* Ticket 1 */}
              <div className="p-3 rounded-2xl bg-[#0E1118] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-xs">#1041</span>
                    <span className="text-[10px] text-[#9CA3AF]">• Table 04</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Preparing (8m)
                  </span>
                </div>
                <p className="text-xs text-[#D1D5DB] leading-tight font-medium">
                  1x Classic Veg Burger, 2x Chilled Coke
                </p>
              </div>

              {/* Ticket 2 */}
              <div className="p-3 rounded-2xl bg-[#0E1118] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-xs">#1042</span>
                    <span className="text-[10px] text-[#9CA3AF]">• Table 02</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-[#D1D5DB] leading-tight font-medium">
                  1x Farmhouse Veggie Pizza, 1x Lava Cake
                </p>
              </div>

              {/* Ticket 3 */}
              <div className="p-3 rounded-2xl bg-[#0E1118] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-xs">#1043</span>
                    <span className="text-[10px] text-[#9CA3AF]">• Table 06</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    New Just In
                  </span>
                </div>
                <p className="text-xs text-[#D1D5DB] leading-tight font-medium">
                  2x Belgian Chocolate Shake
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE SUITE MODULES: Sleek Dark Glass Grid */}
      <section id="features" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
            Unified Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Six Critical Modules Built for Hospitality Excellence
          </h2>
          <p className="text-sm text-[#9CA3AF]">
            Everything from touchless table ordering to backoffice accounting operates seamlessly in sync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: QrCode,
              title: 'Contactless QR Ordering',
              desc: 'High-speed digital menus with appetizing food photography, veg/non-veg toggles, and instant table service bell alerts.',
              tag: 'Guest Facing',
            },
            {
              icon: ChefHat,
              title: 'Live Kitchen Display (KDS)',
              desc: 'Audio chime alerts, urgency color-coding, item prep checklists, and order completion notifications directly on kitchen tablets.',
              tag: 'Operations',
            },
            {
              icon: CreditCard,
              title: 'Counter POS & Fast Billing',
              desc: 'Punch express takeaway orders, handle split payments (Cash, UPI, Card), and print thermal receipts with GST tax compliance.',
              tag: 'Cashier POS',
            },
            {
              icon: Cake,
              title: 'WhatsApp Birthday Club',
              desc: 'Automated 7-day birthday celebration trigger engine that sends personalized invitation deals to recurring diners.',
              tag: 'Retention CRM',
            },
            {
              icon: Coins,
              title: 'Loyalty Coins & Rewards',
              desc: 'Automatic loyalty coin credit on every completed bill with Silver, Gold, and Platinum status tier progressions.',
              tag: 'Gamification',
            },
            {
              icon: Boxes,
              title: 'Stock & Inventory Control',
              desc: 'Real-time ingredient tracking with automatic low-stock notifications, unit cost modeling, and supplier replenishment logs.',
              tag: 'Supply Chain',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-white/[0.02] border border-white/[0.07] hover:border-[#F59E0B]/50 p-7 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/25 group-hover:border-[#F59E0B]/50 flex items-center justify-center text-[#F59E0B] shadow-sm transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/[0.05] text-[#9CA3AF] border border-white/[0.08]">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SERVICE WORKFLOW: Step by Step */}
      <section id="workflow" className="relative z-10 py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.08]">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
            Effortless Flow
          </span>
          <h2 className="text-3xl font-black text-white">From Standee Scan to Repeat Visit</h2>
          <p className="text-xs sm:text-sm text-[#9CA3AF]">
            How an order travels seamlessly through your staff and back to the customer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Scan QR Standee',
              desc: 'Guest opens menu on their phone without installing any application.',
            },
            {
              step: '02',
              title: 'Kitchen Ticket Chimes',
              desc: 'Orders display immediately on KDS screens with live preparation timers.',
            },
            {
              step: '03',
              title: 'Food Served Fresh',
              desc: 'Waitstaff delivers prepared dishes directly to the designated table number.',
            },
            {
              step: '04',
              title: 'Instant WhatsApp Bill',
              desc: 'Itemized invoice sent via WhatsApp Click-to-Chat in one touch.',
            },
            {
              step: '05',
              title: 'Annual Birthday Treats',
              desc: 'Diners receive automatic birthday invitation offers every year.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-md space-y-2 text-center relative"
            >
              <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-black text-xs flex items-center justify-center mx-auto border border-[#F59E0B]/30">
                {item.step}
              </div>
              <h4 className="text-xs font-bold text-white">{item.title}</h4>
              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STRICT MULTI-TENANT ISOLATION GUARANTEE (Competitor-Proof) */}
      <section id="security" className="relative z-10 py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.1] backdrop-blur-2xl text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Bank-Grade Tenant Privacy & Complete Confidentiality
          </h2>

          <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
            Every restaurant operating on RestroOS is strictly isolated in its own encrypted workspace. Your revenue, active orders, customer databases, and menu pricing are 100% confidential. No other cafe or competitor can ever view, search, or access your store records.
          </p>

          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.15] text-xs font-bold text-[#FBBF24] transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In with Your Scoped Cafe Credentials</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="relative z-10 py-20 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Ready to Modernize Your Cafe Operations?
        </h2>
        <p className="text-sm text-[#9CA3AF] max-w-xl mx-auto mt-3">
          Sign into your private backoffice to access your live POS, Kitchen Display, and customer engine.
        </p>

        <div className="pt-7">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] text-[#090A0F] font-black text-sm uppercase tracking-wider shadow-[0_0_40px_rgba(245,158,11,0.45)] transition-all hover:scale-105 cursor-pointer"
          >
            <span>Open Cafe Owner Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Minimal Tech Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] py-10 bg-[#06070A] text-center text-xs text-[#6B7280] space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Coffee className="w-4 h-4 text-[#F59E0B]" />
          <span className="font-bold text-white">RestroOS</span>
          <span>• Contactless Hospitality & Multi-Tenant Cloud</span>
        </div>
        <p className="text-[11px] text-[#4B5563]">
          © {new Date().getFullYear()} RestroOS. All cafe tenant workspaces encrypted & strictly isolated.
        </p>
      </footer>
    </div>
  );
}
