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
  BarChart3,
  ShoppingBag,
  Bell,
  Clock,
  ChevronDown,
  MoreHorizontal,
  Flame,
  Check,
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
                className="px-6 py-2.5 rounded-full bg-[#10121A] hover:bg-[#161924] border-2 border-[#F59E0B] text-[#F59E0B] hover:text-[#FBBF24] font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cafe Owner Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION: THE TRUE MOCKUP COMPOSITION
          (Centered Title Flanked by 3D Floating Glass Cards: Card 1, Card 2, Card 3)
         ========================================================================= */}
      <section className="relative z-10 pt-10 sm:pt-16 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DESKTOP LAYOUT (1024px+): Exact Mockup Arrangement */}
        <div className="hidden lg:grid grid-cols-12 gap-6 items-center min-h-[580px]">
          
          {/* LEFT WING: Card 1 (Top Left) & Card 2 (Bottom Left) */}
          <div className="col-span-4 flex flex-col gap-6 justify-between">
            
            {/* CARD 1: Contactless QR Table Ordering */}
            <div className="rounded-3xl bg-[#11131C]/85 border border-white/[0.12] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),_0_0_20px_rgba(245,158,11,0.08)] backdrop-blur-2xl -rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Contactless QR Table Ordering
                </h3>
                <MoreHorizontal className="w-4 h-4 text-[#71717A]" />
              </div>

              {/* QR Code and Food Selection Items */}
              <div className="grid grid-cols-12 gap-3 items-center">
                {/* Left: Working QR Code Box */}
                <div className="col-span-5 p-2 bg-[#0A0C12] rounded-2xl border border-white/[0.08] flex flex-col items-center">
                  <div className="p-1.5 bg-white rounded-xl shadow-md">
                    <ClientQRCode path={demoQrPath} size={90} level="M" />
                  </div>
                  <span className="text-[9px] font-bold text-[#A1A1AA] mt-1.5">Table 5</span>
                </div>

                {/* Right: Food Item Badges Grid */}
                <div className="col-span-7 space-y-2">
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
                      <span className="text-base">☕</span>
                      <span className="text-[8px] font-semibold text-[#D4D4D8] mt-0.5">Latte</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
                      <span className="text-base">🥐</span>
                      <span className="text-[8px] font-semibold text-[#D4D4D8] mt-0.5">Pastry</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
                      <span className="text-base">🥪</span>
                      <span className="text-[8px] font-semibold text-[#D4D4D8] mt-0.5">Sandwich</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
                      <span className="text-base">🧋</span>
                      <span className="text-[8px] font-semibold text-[#D4D4D8] mt-0.5">Shake</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center">
                      <span className="text-base">🍔</span>
                      <span className="text-[8px] font-semibold text-[#D4D4D8] mt-0.5">Burger</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#A1A1AA] text-xs font-bold">
                      +
                    </div>
                  </div>

                  {/* Order Button */}
                  <a
                    href={demoQrPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#090A0F] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
                  >
                    <span>Order</span>
                  </a>
                </div>
              </div>
            </div>

            {/* CARD 2: Instant Billing Metrics (With Undulating Wave Chart) */}
            <div className="rounded-3xl bg-[#11131C]/85 border border-white/[0.12] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),_0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-2xl -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B]">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Instant Billing Metrics</h3>
                </div>
                <MoreHorizontal className="w-4 h-4 text-[#71717A]" />
              </div>

              {/* Metric Counter Headers */}
              <div className="flex items-center justify-between px-1 mb-2 text-xs">
                <div>
                  <span className="text-[9px] text-[#A1A1AA] uppercase font-bold block">Revenue Today</span>
                  <span className="text-sm font-black text-white">$1,250.00</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#A1A1AA] uppercase font-bold block">Orders</span>
                  <span className="text-sm font-black text-white">89</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#A1A1AA] uppercase font-bold block">Average Ticket</span>
                  <span className="text-sm font-black text-white">$14.00</span>
                </div>
              </div>

              {/* Undulating Orange/Purple Wave Sparkline Chart */}
              <div className="p-2.5 rounded-2xl bg-[#090A0F] border border-white/[0.06] relative overflow-hidden">
                <div className="flex items-center justify-end mb-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    Live
                  </span>
                </div>
                <div className="h-16 w-full">
                  <svg viewBox="0 0 300 70" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,55 Q 35,15 75,40 T 150,20 T 225,12 T 300,35 L 300,70 L 0,70 Z"
                      fill="url(#waveFill)"
                    />
                    <path
                      d="M 0,55 Q 35,15 75,40 T 150,20 T 225,12 T 300,35"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="225" cy="12" r="4.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER HERO: HEADLINE, SUBTITLE, CTAS */}
          <div className="col-span-4 text-center px-2 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.12]">
              Next-Gen Operating System for{' '}
              <span className="block text-white">Modern Cafes</span>
            </h1>

            <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-md mx-auto">
              Optimize operations, delight customers, and scale your business with the ultimate cloud-based platform for cafes and small restaurants.
            </p>

            {/* Glowing CTAs (Request Free Demo & Explore Platform) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                href="/admin/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#F59E0B] hover:bg-[#FBBF24] text-[#090A0F] font-black text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all hover:scale-105 cursor-pointer"
              >
                Request Free Demo
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#11131C] hover:bg-[#181B28] text-white font-bold text-xs uppercase tracking-wider border border-white/[0.15] shadow-lg transition-all cursor-pointer"
              >
                Explore Platform
              </a>
            </div>
          </div>

          {/* RIGHT WING: Card 3 (Live Kitchen Display KDS Tablet) */}
          <div className="col-span-4 flex justify-end">
            <div className="w-full rounded-3xl bg-[#11131C]/90 border border-white/[0.12] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),_0_0_25px_rgba(16,185,129,0.08)] backdrop-blur-2xl rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Live Kitchen Display
                </h3>
                <MoreHorizontal className="w-4 h-4 text-[#71717A]" />
              </div>

              {/* Sub-nav in KDS */}
              <div className="flex items-center justify-between mb-3 text-[10px] text-[#A1A1AA] pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">KDS</span>
                  <span>Chimes</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[#D4D4D8]">
                  <span>Preparing</span>
                  <ChevronDown className="w-3 h-3 text-[#A1A1AA]" />
                </div>
              </div>

              {/* Two Column Section inside KDS */}
              <div className="grid grid-cols-12 gap-3 mb-2">
                {/* Left Mini Tab */}
                <div className="col-span-4 space-y-2">
                  <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-center">
                    <span className="text-[10px] font-bold block">🟢 Active</span>
                    <span className="text-[9px] text-emerald-300/80">Tickets</span>
                  </div>
                </div>

                {/* Right Tickets Feed */}
                <div className="col-span-8 space-y-2.5">
                  {/* Order #12 */}
                  <div className="p-3 rounded-2xl bg-[#090B10] border border-white/[0.08]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">Order #12</span>
                      <span className="text-[9px] text-[#71717A]">5m ago</span>
                    </div>
                    <p className="text-[11px] text-[#D4D4D8] leading-tight">• Burger</p>
                    <p className="text-[11px] text-[#D4D4D8] leading-tight">• Fries</p>
                    <div className="flex justify-end mt-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Ready
                      </span>
                    </div>
                  </div>

                  {/* Order #13 */}
                  <div className="p-3 rounded-2xl bg-[#090B10] border border-white/[0.08]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">Order #13</span>
                      <span className="text-[9px] text-[#71717A]">3m ago</span>
                    </div>
                    <p className="text-[11px] text-[#D4D4D8] leading-tight">• Pizza</p>
                    <p className="text-[11px] text-[#D4D4D8] leading-tight">• Coke</p>
                    <div className="flex justify-end mt-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE & TABLET LAYOUT (<1024px): Stacked Gracefully */}
        <div className="lg:hidden space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Next-Gen Operating System for{' '}
              <span className="bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#EA580C] bg-clip-text text-transparent">
                Modern Cafes
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-lg mx-auto">
              Optimize operations, delight customers, and scale your business with the ultimate cloud-based platform for cafes and small restaurants.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/admin/login"
                className="px-6 py-3 rounded-full bg-[#F59E0B] text-[#090A0F] font-black text-xs uppercase tracking-wider shadow-lg"
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

          {/* Cards Stream on Mobile */}
          <div className="space-y-4">
            {/* Mobile Card 1 */}
            <div className="p-5 rounded-3xl bg-[#11131C] border border-white/10 shadow-xl">
              <h3 className="text-xs font-bold text-white mb-2">Contactless QR Table Ordering</h3>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shrink-0">
                  <ClientQRCode path={demoQrPath} size={90} level="M" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <p className="text-xs text-[#A1A1AA]">Scan with phone to view real digital menu.</p>
                  <a
                    href={demoQrPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F59E0B] text-[#090A0F] font-bold text-xs"
                  >
                    <span>Launch Table Menu</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Mobile Card 2 */}
            <div className="p-5 rounded-3xl bg-[#11131C] border border-white/10 shadow-xl">
              <h3 className="text-xs font-bold text-white mb-2">Live Kitchen Display (KDS)</h3>
              <div className="p-3 rounded-xl bg-[#090B10] border border-white/10 space-y-1">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Order #12</span>
                  <span className="text-emerald-400">Ready</span>
                </div>
                <p className="text-xs text-[#A1A1AA]">• Burger, Fries (5m ago)</p>
              </div>
            </div>
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
    </div>
  );
}
