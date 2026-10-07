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
    <main className="min-h-screen bg-[#14110E] text-[#EDE7DF] selection:bg-[#C29B72] selection:text-[#14110E]">
      {/* Top Banner */}
      <div className="bg-[#241D17] py-2 px-4 text-center text-[#EDE7DF] text-xs font-medium border-b border-[#2E241C]">
        <span className="inline-flex items-center gap-1.5 font-bold text-[#D4AD85]">☕ Artisan Hospitality Tech</span> • Contactless Table QR • Kitchen KDS • WhatsApp Invoicing & Loyalty
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1C1713] border border-[#2B221A] text-[#D4AD85] text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C29B72]" />
            Contemporary Cafe & Restaurant Management
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight text-[#EDE7DF]">
            Frictionless QR Ordering + Live Kitchen +{' '}
            <span className="bg-gradient-to-r from-[#EDE7DF] via-[#D4AD85] to-[#C29B72] bg-clip-text text-transparent">
              WhatsApp Birthday Club
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#A89887] leading-relaxed max-w-2xl mx-auto">
            Guests order from their table in seconds with <strong className="text-[#EDE7DF]">zero app downloads, no accounts, and no friction</strong>. Your team receives orders live in the backoffice, generates bills, captures customer numbers, and sends receipts via WhatsApp Click-to-Chat.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/orders"
              className="px-6 py-3.5 rounded-2xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#C29B72]/20 transition-all cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Open Kitchen Backoffice</span>
            </Link>

            <Link
              href="/r/quick-bite/t/01"
              className="px-6 py-3.5 rounded-2xl bg-[#1C1713] hover:bg-[#241D17] text-[#EDE7DF] font-semibold text-sm border border-[#2B221A] flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Guest Table 01 Menu</span>
              <ArrowRight className="w-4 h-4 text-[#A89887]" />
            </Link>
          </div>
        </div>

        {/* Live Pitch Demonstration Box */}
        <div className="rounded-3xl bg-[#1C1713] border border-[#2B221A] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C29B72]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left QR Code Scan Box */}
            <div className="lg:col-span-5 flex flex-col items-center text-center p-6 bg-[#14110E] rounded-3xl border border-[#2B221A] shadow-inner">
              <div className="w-10 h-10 rounded-2xl bg-[#C29B72]/20 border border-[#C29B72]/40 text-[#D4AD85] flex items-center justify-center mb-2 font-bold text-lg">
                ☕
              </div>
              <h2 className="text-base font-bold text-[#EDE7DF]">Scan with your Phone</h2>
              <p className="text-xs text-[#A89887] mt-0.5">Quick Bite Cafe • Table 01</p>

              <div className="my-4 p-4 bg-white rounded-2xl shadow-md border border-[#EAE3D8] inline-block">
                <ClientQRCode path={table01Path} size={180} level="M" />
              </div>

              <span className="text-xs font-semibold text-[#D4AD85]">
                Point camera at screen to test
              </span>
              <p className="text-[11px] text-[#A89887] mt-1 max-w-xs font-mono break-all">
                {table01DisplayUrl}
              </p>

              <a
                href={table01Path}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 px-4 py-2 rounded-xl bg-[#241D17] hover:bg-[#2B221A] text-[#EDE7DF] text-xs font-semibold border border-[#2B221A] flex items-center gap-1.5 transition-colors"
              >
                <span>Launch Table 01 in Browser</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Right Flow Description */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AD85]">
                Hospitality Experience Workflow
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#EDE7DF] tracking-tight">
                End-to-End Service Flow
              </h3>

              <div className="space-y-3 pt-2">
                {[
                  {
                    step: '1',
                    title: 'Guest Scans Table QR Standee',
                    desc: 'Menu opens instantly with warm photography, veg filters, and clear pricing. Zero app install or registration.',
                  },
                  {
                    step: '2',
                    title: 'Guest Submits Table Order',
                    desc: 'Selected dishes are sent directly to the Kitchen KDS with soft chime and live table identification.',
                  },
                  {
                    step: '3',
                    title: 'Staff Generates Digital Bill',
                    desc: 'Cashier prompts for guest name and WhatsApp. Guest details automatically save to your recurring CRM.',
                  },
                  {
                    step: '4',
                    title: 'WhatsApp Invoice Dispatch',
                    desc: 'Click "Send WhatsApp Bill". WhatsApp opens with itemized digital bill and cafe branding pre-filled.',
                  },
                  {
                    step: '5',
                    title: 'Birthday Club Recurring Automation',
                    desc: 'Guest enrolls in Birthday Club. System flags upcoming celebrations 7 days ahead for annual treats.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#C29B72]/15 text-[#D4AD85] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#C29B72]/30">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#EDE7DF]">{item.title}</h4>
                      <p className="text-[11px] text-[#A89887] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Tenant Demo Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#1C1713] border border-[#2B221A] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#EDE7DF]">Outlet 1: Quick Bite Cafe</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#C29B72]/15 text-[#D4AD85] border border-[#C29B72]/30">
                Primary Demo
              </span>
            </div>
            <p className="text-xs text-[#A89887] leading-relaxed">
              Fast-casual menu with Burgers, Artisanal Pizzas, Cold Brews, and Pastries. Configured with 5% GST and WhatsApp receipts.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/r/quick-bite/t/01"
                className="px-4 py-2 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs shadow-md shadow-[#C29B72]/20"
              >
                Table 01 Menu →
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-[#241D17] hover:bg-[#2B221A] text-[#EDE7DF] font-semibold text-xs border border-[#2B221A]"
              >
                Backoffice Portal
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#1C1713] border border-[#2B221A] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#EDE7DF]">Outlet 2: Urban Brew Co.</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#5F7A62]/15 text-[#9BB89E] border border-[#5F7A62]/30">
                Multi-Tenant Proof
              </span>
            </div>
            <p className="text-xs text-[#A89887] leading-relaxed">
              Second restaurant on the exact same codebase. Validates strict data isolation between multiple cafe brands.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/r/urban-brew/t/01"
                className="px-4 py-2 rounded-xl bg-[#241D17] hover:bg-[#2B221A] text-[#EDE7DF] font-semibold text-xs border border-[#2B221A]"
              >
                Urban Brew Menu →
              </Link>
            </div>
          </div>
        </div>

        {/* Guarantees Footer */}
        <div className="pt-8 border-t border-[#2B221A] text-center space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#A89887]">
            <span className="flex items-center gap-1.5 text-[#9BB89E]">
              <ShieldCheck className="w-4 h-4" /> Vercel Cloud Architecture
            </span>
            <span className="flex items-center gap-1.5 text-[#9BB89E]">
              <ShieldCheck className="w-4 h-4" /> Supabase Realtime DB
            </span>
            <span className="flex items-center gap-1.5 text-[#9BB89E]">
              <ShieldCheck className="w-4 h-4" /> WhatsApp Click-to-Chat
            </span>
            <span className="flex items-center gap-1.5 text-[#9BB89E]">
              <ShieldCheck className="w-4 h-4" /> Frictionless QR Ordering
            </span>
          </div>
          <p className="text-[11px] text-[#7A6B5D]">
            Contemporary cafe management designed for seamless staff execution and delighted guests.
          </p>
        </div>
      </div>
    </main>
  );
}
