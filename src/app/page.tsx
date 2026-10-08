'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredUser, CafeUser } from '@/lib/auth';
import { DEFAULT_HERO_LAYOUT, HeroLayoutConfig } from '@/lib/heroLayout';
import {
  QrCode,
  UtensilsCrossed,
  Cake,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Lock,
  ChefHat,
  CreditCard,
  Coins,
  BarChart3,
  ChevronDown,
  Boxes,
  Sliders,
} from 'lucide-react';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<CafeUser | null>(null);
  const [layout, setLayout] = useState<HeroLayoutConfig>(DEFAULT_HERO_LAYOUT);

  useEffect(() => {
    setCurrentUser(getStoredUser());

    async function fetchLayout() {
      try {
        const res = await fetch('/api/hero-layout');
        if (res.ok) {
          const data = await res.json();
          setLayout(data);
        }
      } catch {
        // fallback to DEFAULT_HERO_LAYOUT
      }
    }
    fetchLayout();
  }, []);

  const demoQrPath = '/r/quick-bite/t/01';

  return (
    <div className="min-h-screen bg-[#08090D] text-[#EDE7DF] selection:bg-[#F59E0B]/30 selection:text-[#EDE7DF] font-sans antialiased overflow-x-hidden relative">
      {/* =========================================================================
          BACKGROUND AMBIENT ATMOSPHERE & CONSTELLATION NETWORK
          (Matches Generated Mockup: Neon Amber Core Glow, Purple Hue & Hex Nodes)
         ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Core Top/Center Amber Glow */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-[#F59E0B]/18 via-[#EA580C]/8 to-transparent rounded-full blur-[140px]" />
        
        {/* Left Side Violet/Purple Accent Aura */}
        <div className="absolute top-[28%] left-[-8%] w-[500px] h-[500px] bg-[#8B5CF6]/10 rounded-full blur-[160px]" />
        
        {/* Right Side Warm Amber Flare */}
        <div className="absolute top-[32%] right-[-8%] w-[550px] h-[550px] bg-[#F59E0B]/12 rounded-full blur-[160px]" />

        {/* Constellation Network Lines & Hexagons SVG (Direct match to Image 2) */}
        <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="netGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Subtle network lines */}
          <line x1="8%" y1="20%" x2="25%" y2="12%" stroke="url(#netGrad)" strokeWidth="1" />
          <line x1="25%" y1="12%" x2="35%" y2="28%" stroke="url(#netGrad)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="70%" y1="18%" x2="88%" y2="24%" stroke="url(#netGrad)" strokeWidth="1" />
          <line x1="88%" y1="24%" x2="80%" y2="40%" stroke="url(#netGrad)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="12%" y1="55%" x2="28%" y2="68%" stroke="url(#netGrad)" strokeWidth="1" />
          <line x1="72%" y1="62%" x2="86%" y2="78%" stroke="url(#netGrad)" strokeWidth="1" />
          
          {/* Glowing polygon nodes */}
          <polygon points="120,180 135,170 150,180 150,198 135,208 120,198" fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.3" />
          <polygon points="980,240 995,230 1010,240 1010,258 995,268 980,258" fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.4" />
          <polygon points="820,580 835,570 850,580 850,598 835,608 820,598" fill="none" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.3" />
          <circle cx="280" cy="180" r="3" fill="#F59E0B" opacity="0.6" />
          <circle cx="920" cy="220" r="3" fill="#F59E0B" opacity="0.6" />
          <circle cx="180" cy="480" r="2.5" fill="#8B5CF6" opacity="0.5" />
          <circle cx="860" cy="420" r="2.5" fill="#F59E0B" opacity="0.5" />
        </svg>
      </div>

      {/* =========================================================================
          TOP NAVIGATION BAR (Direct Match to Mockup)
         ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090A0F]/75 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo with Utensil / Fork-Knife Icon */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1C150E] to-[#2B1D11] border border-[#F59E0B]/50 flex items-center justify-center text-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-all">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Restro<span className="text-[#F59E0B]">OS</span>
            </span>
          </Link>

          {/* Centered Navigation Links with Dropdown Arrows */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#A1A1AA]">
            <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <span>Platform</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
            </div>
            <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <span>Features</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
            </div>
            <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <span>Solutions</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
            </div>
            <a href="#demo" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Demo
            </a>
          </nav>

          {/* Right Action: Glowing Rounded Pill "Cafe Owner Login" */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                href="/admin"
                className="px-6 py-2.5 rounded-full bg-[#12141F] hover:bg-[#1A1D2D] border border-[#F59E0B] text-[#F59E0B] hover:text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Dashboard ({currentUser.username})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="px-6 py-2.5 rounded-full bg-[#0C0E15] hover:bg-[#141724] border border-[#F59E0B] text-[#F59E0B] hover:text-[#FBBF24] font-bold text-xs tracking-wider shadow-[0_0_22px_rgba(245,158,11,0.35)] transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cafe Owner Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION: DYNAMICALLY CONFIGURED FROM /editor
         ========================================================================= */}
      <section className="relative z-10 pt-4 sm:pt-8 pb-16 sm:pb-24 max-w-[1440px] mx-auto px-4 sm:px-6">
        
        {/* DESKTOP CANVAS (1024px+): Exact Coordinates from Visual Editor */}
        <div
          style={{ height: `${layout.canvasHeight}px` }}
          className="hidden lg:block relative w-full overflow-visible"
        >
          {/* CARD 1: Contactless QR Table Ordering */}
          <div
            style={{
              position: 'absolute',
              left: `${layout.card1.x}px`,
              top: `${layout.card1.y}px`,
              width: `${layout.card1.width}px`,
              transform: `scale(${layout.card1.scale}) rotate(${layout.card1.rotation}deg)`,
              transformOrigin: 'center center',
              zIndex: layout.card1.zIndex,
            }}
            className="transition-transform duration-300 hover:rotate-0 hover:scale-[1.03]"
          >
            <Link
              href={demoQrPath}
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative cursor-pointer focus:outline-none"
              title="Click to launch Table 5 Live Digital Menu"
            >
              <div className="relative rounded-2xl xl:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85),_0_0_25px_rgba(245,158,11,0.12)] border border-white/[0.08] group-hover:border-[#F59E0B]/50 group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.95),_0_0_35px_rgba(245,158,11,0.3)] transition-all duration-300">
                <img
                  src="/designs/card1-qr.png"
                  alt="Contactless QR Table Ordering"
                  className="w-full h-auto block select-none"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B] text-black text-[10px] font-black uppercase tracking-wider shadow-lg">
                    <span>Test QR Order Menu</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* CARD 2: Instant Billing Metrics */}
          <div
            style={{
              position: 'absolute',
              left: `${layout.card2.x}px`,
              top: `${layout.card2.y}px`,
              width: `${layout.card2.width}px`,
              transform: `scale(${layout.card2.scale}) rotate(${layout.card2.rotation}deg)`,
              transformOrigin: 'center center',
              zIndex: layout.card2.zIndex,
            }}
            className="transition-transform duration-300 hover:rotate-0 hover:scale-[1.03]"
          >
            <Link
              href="/admin/login"
              className="group block relative cursor-pointer focus:outline-none"
              title="Click to view live analytics in admin portal"
            >
              <div className="relative rounded-2xl xl:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85),_0_0_25px_rgba(139,92,246,0.12)] border border-white/[0.08] group-hover:border-[#8B5CF6]/50 group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.95),_0_0_35px_rgba(139,92,246,0.3)] transition-all duration-300">
                <img
                  src="/designs/card2-metrics.png"
                  alt="Instant Billing Metrics"
                  className="w-full h-auto block select-none"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181B28] text-white border border-[#8B5CF6]/60 text-[10px] font-bold tracking-wider shadow-lg">
                    <BarChart3 className="w-3 h-3 text-[#F59E0B]" />
                    <span>View Live Revenue POS</span>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* CENTER HERO: HEADLINE & CTAS (Dynamic Width & Position from Editor) */}
          <div
            style={{
              position: 'absolute',
              left: `${layout.heroText.x}px`,
              top: `${layout.heroText.y}px`,
              width: `${layout.heroText.width}px`,
              transform: `scale(${layout.heroText.scale}) rotate(${layout.heroText.rotation}deg)`,
              transformOrigin: 'center center',
              zIndex: layout.heroText.zIndex,
            }}
            className="text-center transition-all duration-300"
          >
            <h1
              style={{
                fontSize: `${layout.heroText.fontSize}px`,
                lineHeight: 1.12,
              }}
              className="font-black tracking-tight text-white select-none text-center"
            >
              Next-Gen Operating System for Modern Cafes
            </h1>

            <p className="text-sm sm:text-base xl:text-lg text-[#A1A1AA] max-w-xl mx-auto leading-relaxed mt-4 font-normal">
              {layout.heroText.subtitleText}
            </p>

            <div className="flex items-center justify-center gap-4 pt-6">
              <Link
                href="/admin/login"
                className="px-8 py-3.5 rounded-full bg-[#F59E0B] hover:bg-[#FBBF24] text-[#090A0F] font-black text-xs uppercase tracking-wider shadow-[0_0_35px_rgba(245,158,11,0.55)] transition-all hover:scale-105 active:scale-95 cursor-pointer text-center"
              >
                Request Free Demo
              </Link>
              <a
                href="#features"
                className="px-7 py-3.5 rounded-full bg-[#11131C] hover:bg-[#181B28] text-white font-bold text-xs uppercase tracking-wider border border-white/[0.18] shadow-lg transition-all hover:border-white/40 active:scale-95 cursor-pointer text-center"
              >
                Explore Platform
              </a>
            </div>
          </div>

          {/* RIGHT WING: Card 3 (Live Kitchen Display KDS Tablet) */}
          <div
            style={{
              position: 'absolute',
              left: `${layout.card3.x}px`,
              top: `${layout.card3.y}px`,
              width: `${layout.card3.width}px`,
              transform: `scale(${layout.card3.scale}) rotate(${layout.card3.rotation}deg)`,
              transformOrigin: 'center center',
              zIndex: layout.card3.zIndex,
            }}
            className="transition-transform duration-300 hover:rotate-0 hover:scale-[1.03]"
          >
            <Link
              href="/admin/login"
              className="group block relative cursor-pointer w-full focus:outline-none"
              title="Click to launch Live Kitchen Display System (KDS)"
            >
              <div className="relative rounded-2xl xl:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85),_0_0_25px_rgba(16,185,129,0.12)] border border-white/[0.08] group-hover:border-emerald-500/50 group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.95),_0_0_35px_rgba(16,185,129,0.3)] transition-all duration-300">
                <img
                  src="/designs/card3-kitchen.png"
                  alt="Live Kitchen Display (KDS)"
                  className="w-full h-auto block select-none"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181B28] text-emerald-400 border border-emerald-500/60 text-[10px] font-bold tracking-wider shadow-lg">
                    <ChefHat className="w-3 h-3 text-emerald-400" />
                    <span>Open Kitchen KDS</span>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* MOBILE & TABLET LAYOUT (<1024px): Stacked Gracefully */}
        <div className="lg:hidden space-y-10">
          <div className="text-center space-y-4 px-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.14]">
              Next-Gen Operating<br className="hidden sm:inline" />
              {' '}System for Modern<br className="hidden sm:inline" />
              {' '}Cafes
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-lg mx-auto leading-relaxed">
              Optimize operations, delight customers, and scale your business with the ultimate cloud-based platform for cafes and small restaurants.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/admin/login"
                className="px-7 py-3 rounded-full bg-[#F59E0B] text-[#090A0F] font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.5)]"
              >
                Request Free Demo
              </Link>
              <a
                href="#features"
                className="px-6 py-3 rounded-full bg-[#11131C] text-white font-bold text-xs uppercase tracking-wider border border-white/10"
              >
                Explore Platform
              </a>
            </div>
          </div>

          {/* Exact Image Cards on Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto px-2">
            <Link
              href={demoQrPath}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl overflow-hidden border border-white/10 shadow-xl block"
            >
              <img
                src="/designs/card1-qr.png"
                alt="Contactless QR Table Ordering"
                className="w-full h-auto block"
              />
            </Link>

            <Link
              href="/admin/login"
              className="rounded-2xl overflow-hidden border border-white/10 shadow-xl block"
            >
              <img
                src="/designs/card3-kitchen.png"
                alt="Live Kitchen Display (KDS)"
                className="w-full h-auto block"
              />
            </Link>

            <Link
              href="/admin/login"
              className="sm:col-span-2 max-w-md mx-auto w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl block"
            >
              <img
                src="/designs/card2-metrics.png"
                alt="Instant Billing Metrics"
                className="w-full h-auto block"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SUITE OF CAPABILITIES: Detailed Modular Grid
         ========================================================================= */}
      <section id="features" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
            Unified Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Six Powerful Modules Built for Hospitality Excellence
          </h2>
          <p className="text-sm text-[#A1A1AA]">
            From touchless QR table ordering to backoffice accounting, all modules stay seamlessly in sync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: QrCode,
              title: 'Contactless QR Ordering',
              desc: 'High-speed digital menus with food photography, veg/non-veg toggles, and instant table service bell alerts.',
              tag: 'Guest Facing',
            },
            {
              icon: ChefHat,
              title: 'Live Kitchen Display (KDS)',
              desc: 'Audio chime alerts, urgency color-coding, item prep checklists, and order completion notifications directly on kitchen screens.',
              tag: 'Operations',
            },
            {
              icon: CreditCard,
              title: 'Counter POS & Fast Billing',
              desc: 'Punch express takeaway orders, handle split payments (Cash, UPI, Card), and print thermal receipts with GST compliance.',
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
                className="rounded-3xl bg-[#11131C]/70 border border-white/[0.08] hover:border-[#F59E0B]/50 p-7 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/25 group-hover:border-[#F59E0B]/50 flex items-center justify-center text-[#F59E0B] shadow-sm transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/[0.05] text-[#A1A1AA] border border-white/[0.08]">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          CONFIDENTIAL MULTI-TENANT ISOLATION GUARANTEE (Zero Competitor Exposure)
         ========================================================================= */}
      <section id="security" className="relative z-10 py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#11131C]/90 to-[#0A0C12]/90 border border-white/[0.1] backdrop-blur-2xl text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Enterprise-Grade Multi-Tenant Isolation & Privacy
          </h2>

          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            Every restaurant operating on RestroOS is strictly isolated in its own encrypted workspace. Your revenue, active orders, customer databases, and menu pricing are 100% confidential. No other cafe or competitor can ever view, search, or access your store records.
          </p>

          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#181B28] hover:bg-[#202538] border border-[#F59E0B]/50 text-xs font-bold text-[#F59E0B] transition-all hover:scale-[1.02] cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In with Your Scoped Cafe Credentials</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CTA & MINIMAL FOOTER
         ========================================================================= */}
      <section className="relative z-10 py-20 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Ready to Modernize Your Cafe Operations?
        </h2>
        <p className="text-sm text-[#A1A1AA] max-w-xl mx-auto mt-3">
          Sign into your private backoffice to access your live POS, Kitchen Display, and customer engine.
        </p>

        <div className="pt-7">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-[#F59E0B] hover:bg-[#FBBF24] text-[#090A0F] font-black text-sm uppercase tracking-wider shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all hover:scale-105 cursor-pointer"
          >
            <span>Open Cafe Owner Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.08] py-10 bg-[#06070A] text-center text-xs text-[#71717A] space-y-2">
        <div className="flex items-center justify-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-[#F59E0B]" />
          <span className="font-bold text-white">RestroOS</span>
          <span>• Contactless Hospitality & Multi-Tenant Cloud</span>
        </div>
        <p className="text-[11px] text-[#52525B]">
          © {new Date().getFullYear()} RestroOS. All cafe tenant workspaces encrypted & strictly isolated.
        </p>
      </footer>

      {/* Floating Quick Action: Open Visual Drag & Drop Editor */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/editor"
          className="group flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#0F111A]/90 hover:bg-[#181B28] border border-[#F59E0B] text-[#F59E0B] font-bold text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.45)] backdrop-blur-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Open Visual Drag & Drop Hero Editor"
        >
          <Sliders className="w-4 h-4 text-[#F59E0B] group-hover:rotate-45 transition-transform" />
          <span>Customize Hero in Editor</span>
        </Link>
      </div>
    </div>
  );
}
