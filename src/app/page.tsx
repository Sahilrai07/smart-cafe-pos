'use client';

import React from 'react';
import Link from 'next/link';
import { ClientQRCode } from '@/components/common/ClientQRCode';
import { useClientOrigin } from '@/lib/useClientOrigin';
import {
  QrCode,
  UtensilsCrossed,
  Receipt,
  Users,
  Cake,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  const origin = useClientOrigin();
  const table01Path = '/r/quick-bite/t/01';
  const table01DisplayUrl = origin ? `${origin}${table01Path}` : table01Path;

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-2 px-4 text-center text-slate-950 text-xs font-black tracking-wide">
        🚀 Zero Infrastructure Cost Demo • Vercel Free + Supabase Free + WhatsApp Click-to-Chat ($0/mo)
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-extrabold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Reusable Multi-Tenant Restaurant SaaS
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Frictionless QR Ordering + Digital Billing +{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              WhatsApp Birthday Club
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Customers order from their table in seconds with <strong>zero app downloads, no accounts, and no registration forms</strong>. Cafe staff receive orders live, generate bills, capture phone numbers, and send receipts via WhatsApp Click-to-Chat.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/orders"
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Open Admin Kitchen Portal</span>
            </Link>

            <Link
              href="/r/quick-bite/t/01"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all"
            >
              <span>Customer Table 01 Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Live Pitch Demonstration Box */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left QR Code Scan Box */}
            <div className="lg:col-span-5 flex flex-col items-center text-center p-6 bg-slate-950 rounded-3xl border border-slate-800/80 shadow-inner">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-2 font-black text-lg">
                ☕
              </div>
              <h2 className="text-base font-black text-white">Scan from your Phone</h2>
              <p className="text-xs text-slate-400 mt-0.5">Quick Bite Cafe • Table 01</p>

              <div className="my-4 p-4 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
                <ClientQRCode path={table01Path} size={180} level="M" />
              </div>

              <span className="text-xs font-bold text-amber-400">
                Point phone camera at screen to test
              </span>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs font-mono break-all">
                {table01DisplayUrl}
              </p>

              <a
                href={table01Path}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Launch Table 01 on Web</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Right Flow Description */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                How The 2-Minute Live Pitch Works
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                End-to-End Live Transaction Flow
              </h3>

              <div className="space-y-3 pt-2">
                {[
                  {
                    step: '1',
                    title: 'Customer Scans Table QR Code',
                    desc: 'Menu opens instantly with veg filter, food photos, and prices. No login required.',
                  },
                  {
                    step: '2',
                    title: 'Customer Places Order',
                    desc: 'Cart items are submitted. Live order appears in Admin Kitchen with an audio chime.',
                  },
                  {
                    step: '3',
                    title: 'Staff Generates Digital Bill',
                    desc: 'Staff asks customer for Name + WhatsApp number. Customer is automatically saved to CRM database.',
                  },
                  {
                    step: '4',
                    title: '1-Click WhatsApp Bill Dispatch',
                    desc: 'Staff clicks "Send WhatsApp Bill". WhatsApp opens with formatted itemized receipt pre-filled!',
                  },
                  {
                    step: '5',
                    title: 'Birthday Club 7-Day Automatic Detection',
                    desc: 'Customer joins Birthday Club. System automatically flags upcoming birthdays every year.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Tenant Demo Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Pilot 1: Quick Bite Cafe</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400">
                Primary Demo
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fast-casual menu with Burgers, Pizzas, Fries, Shakes, and Desserts. Configured with 5% GST and WhatsApp templates.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/r/quick-bite/t/01"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                Table 01 Menu →
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Admin Portal
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Pilot 2: Urban Brew Co.</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400">
                Multi-Tenant Proof
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Second cafe on the exact same codebase. Proves strict data isolation between restaurants without rebuilding!
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/r/urban-brew/t/01"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Urban Brew Menu →
              </Link>
            </div>
          </div>
        </div>

        {/* Free Tier Guarantees Footer */}
        <div className="pt-8 border-t border-slate-800/80 text-center space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Vercel Free Tier ($0/mo)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Supabase Free Tier ($0/mo)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> WhatsApp Click-to-Chat ($0/mo)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Open-Source QR Generation ($0/mo)
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Pitch freely to hundreds of cafes without incurring monthly software subscriptions.
          </p>
        </div>
      </div>
    </main>
  );
}
