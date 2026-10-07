'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Bill, Restaurant, RestaurantSettings } from '@/types';
import { supabaseService } from '@/lib/services/supabaseService';
import { formatCurrency } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, CheckCircle2, Gift, Utensils, Star, Users, MessageSquare, ExternalLink, X } from 'lucide-react';

export default function PublicBillPage() {
  const params = useParams();
  const slug = params.slug as string;
  const billId = params.billId as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);

  // Standout Feature 1: "Secret 5-Star" Google Review Funnel
  const [rating, setRating] = useState<number | null>(null);
  const [privateFeedback, setPrivateFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Standout Feature 2: Group "Split the Bill" with Individual UPI QRs
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitCount, setSplitCount] = useState<number>(2);

  useEffect(() => {
    async function loadBillData() {
      try {
        const r = (await supabaseService.getRestaurantBySlug(slug)) || (await supabaseService.getAllRestaurants())[0];
        if (r) {
          setRestaurant(r);
          const [s, foundBill] = await Promise.all([
            supabaseService.getSettings(r.id),
            supabaseService.getBillById(r.id, billId),
          ]);
          setSettings(s);
          if (foundBill) {
            setBill(foundBill);
          } else {
            const allBills = await supabaseService.getBills(r.id);
            if (allBills.length > 0) setBill(allBills[0]);
          }
        }
      } catch (e) {
        console.error('Error loading bill from Supabase:', e);
      }
    }
    loadBillData();
  }, [slug, billId]);

  if (!restaurant || !settings) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 print:bg-white print:p-0">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <Link
            href={`/r/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#5A4D41] hover:text-[#2A231E] px-3.5 py-1.5 rounded-full bg-white border border-[#EAE3D8] shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Menu
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A4D41] bg-white hover:bg-[#F5F0E8] px-3.5 py-1.5 rounded-full border border-[#EAE3D8] shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>

        {/* Paper Receipt Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#EAE3D8] relative overflow-hidden print:shadow-none print:border-none print:p-0">
          {/* Top Bar */}
          <div className="text-center pb-6 border-b-2 border-dashed border-[#EAE3D8]">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt={restaurant.name}
                className="w-16 h-16 rounded-2xl mx-auto mb-2 object-cover border border-[#EAE3D8]"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-[#C29B72]/20 border border-[#C29B72]/40 text-[#2A231E] flex items-center justify-center mx-auto mb-2 font-bold">
                <Utensils className="w-6 h-6" />
              </div>
            )}
            <h1 className="text-xl font-bold text-[#2A231E] tracking-tight">
              {restaurant.name}
            </h1>
            {restaurant.address && (
              <p className="text-xs text-[#7A6B5D] mt-0.5">{restaurant.address}</p>
            )}
            {restaurant.phone && (
              <p className="text-xs text-[#A89887] mt-0.5">Tel: {restaurant.phone}</p>
            )}

            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-[#EDF3EE] text-[#5F7A62] text-xs font-bold border border-[#5F7A62]/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settled / Paid
            </div>
          </div>

          {/* Metadata */}
          <div className="py-4 border-b border-[#EAE3D8] text-xs text-[#5A4D41] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#A89887]">Invoice #:</span>
              <span className="font-mono font-bold text-[#2A231E]">
                #{bill?.bill_number || '1042'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A89887]">Table:</span>
              <span className="font-semibold text-[#2A231E]">
                {bill?.table_number_snapshot ? `Table ${bill.table_number_snapshot}` : 'Takeaway'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A89887]">Customer:</span>
              <span className="font-semibold text-[#2A231E]">
                {bill?.customer_name || 'Guest'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A89887]">Date & Time:</span>
              <span className="font-medium text-[#5A4D41]">
                {new Date(bill?.generated_at || Date.now()).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </div>

          {/* Itemized list */}
          <div className="py-4 border-b-2 border-dashed border-[#EAE3D8]">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#A89887] uppercase tracking-wider text-[10px] text-left">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8] font-medium text-[#5A4D41]">
                {(bill?.items_snapshot && bill.items_snapshot.length > 0
                  ? bill.items_snapshot
                  : [
                      { item_name_snapshot: 'Artisanal Latte', quantity: 1, unit_price_snapshot: 180, total: 180 },
                      { item_name_snapshot: 'Butter Croissant', quantity: 1, unit_price_snapshot: 140, total: 140 },
                    ]
                ).map((item, i) => (
                  <tr key={i} className="py-2">
                    <td className="py-1.5 font-semibold text-[#2A231E]">{item.item_name_snapshot}</td>
                    <td className="py-1.5 text-center">{item.quantity}</td>
                    <td className="py-1.5 text-right">{formatCurrency(item.unit_price_snapshot, settings.currency)}</td>
                    <td className="py-1.5 text-right font-bold text-[#2A231E]">{formatCurrency(item.total, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="py-4 space-y-1.5 text-xs text-[#5A4D41] border-b border-[#EAE3D8]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-[#2A231E]">
                {formatCurrency(bill?.subtotal || 260, settings.currency)}
              </span>
            </div>
            {settings.tax_enabled && (
              <div className="flex justify-between">
                <span>GST ({settings.tax_percentage}%):</span>
                <span className="font-semibold text-[#2A231E]">
                  {formatCurrency(bill?.tax || 13, settings.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#2A231E] pt-2 border-t border-[#EAE3D8]">
              <span>Grand Total:</span>
              <span className="text-[#2A231E] font-bold">
                {formatCurrency(bill?.total || 273, settings.currency)}
              </span>
            </div>
          </div>

          {/* Split Bill CTA */}
          <div className="py-3 print:hidden">
            <button
              onClick={() => setShowSplitModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F5F0E8] hover:bg-[#EFE7DC] border border-[#EAE3D8] text-[#2A231E] font-bold text-xs transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#8A5C2B]" />
              <span>Split Bill with Friends (Individual UPI QRs)</span>
            </button>
          </div>

          {/* Footer Note */}
          <div className="pt-4 text-center">
            <p className="text-xs font-semibold text-[#2A231E]">Thank you for visiting! ☕</p>
            <p className="text-[11px] text-[#A89887] mt-0.5">We look forward to serving you again soon.</p>

            {/* Secret 5-Star Google Review Booster */}
            <div className="mt-4 p-4 rounded-2xl bg-white border border-[#EAE3D8] text-center print:hidden shadow-xs">
              <span className="text-[11px] font-semibold text-[#8A5C2B] uppercase tracking-wider block mb-1">
                Feedback & Reviews
              </span>
              <h4 className="text-xs font-bold text-[#2A231E]">How was your dining experience today?</h4>

              {/* Star Rating Buttons */}
              <div className="flex items-center justify-center gap-2 my-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setRating(s);
                      if (s >= 4) {
                        const googleUrl =
                          settings.google_review_url ||
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}`;
                        window.open(googleUrl, '_blank');
                      }
                    }}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      rating && rating >= s
                        ? 'bg-[#FAF3E8] border-[#C29B72] text-[#C29B72]'
                        : 'bg-[#FAF8F5] border-[#EAE3D8] text-[#C4B5A5] hover:text-[#C29B72]'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                ))}
              </div>

              {/* High Rating Followup */}
              {rating && rating >= 4 && (
                <div className="mt-2 p-2.5 rounded-xl bg-[#EDF3EE] border border-[#5F7A62]/30 text-xs text-[#5F7A62] font-medium text-left flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Thank you for the {rating}-Star rating! 🌟</p>
                    <p className="text-[11px] text-[#48634C] mt-0.5">
                      Your Google review page has opened in a new tab. Supporting small cafes means the world to us!
                    </p>
                    <a
                      href={settings.google_review_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold underline text-[#324C35]"
                    >
                      <span>Open Review Page Again</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Low Rating Private Feedback Trap */}
              {rating && rating < 4 && !feedbackSent && (
                <div className="mt-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D8] text-left text-xs">
                  <p className="font-bold text-[#B35C4A] flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="w-4 h-4" />
                    We are so sorry it was not 5-star perfection!
                  </p>
                  <p className="text-[11px] text-[#5A4D41] mb-2 leading-relaxed">
                    Please tell our management directly what fell short so we can rectify it immediately:
                  </p>
                  <textarea
                    rows={2}
                    value={privateFeedback}
                    onChange={(e) => setPrivateFeedback(e.target.value)}
                    placeholder="e.g. Coffee was lukewarm, service was slow..."
                    className="w-full p-2.5 rounded-xl bg-white border border-[#EAE3D8] text-xs text-[#2A231E] focus:outline-hidden focus:border-[#C29B72]"
                  />
                  <button
                    onClick={() => {
                      if (!privateFeedback.trim()) return;
                      setFeedbackSent(true);
                      if (restaurant.phone) {
                        const waUrl = `https://wa.me/${restaurant.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                          `Feedback for Table ${bill?.table_number_snapshot || '01'} (Bill #${bill?.bill_number || ''}):\n"${privateFeedback}"`
                        )}`;
                        window.open(waUrl, '_blank');
                      }
                    }}
                    className="mt-2 w-full py-2 rounded-xl bg-[#241D17] hover:bg-[#18130F] text-[#FAF8F5] font-bold text-xs transition-colors cursor-pointer"
                  >
                    Send Private Message to Owner 📩
                  </button>
                </div>
              )}

              {feedbackSent && (
                <div className="mt-3 p-2.5 rounded-xl bg-[#EDF3EE] border border-[#5F7A62]/30 text-xs text-[#5F7A62] font-semibold">
                  Thank you! Your private feedback has been logged for the manager.
                </div>
              )}
            </div>

            {/* Birthday Club Prompt */}
            <div className="mt-4 p-4 rounded-2xl bg-[#F5F0E8] border border-[#EAE3D8] text-left print:hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2A231E] mb-1">
                <Gift className="w-4 h-4 text-[#C29B72]" />
                Join our Birthday Club
              </div>
              <p className="text-[11px] text-[#5A4D41] leading-relaxed">
                Receive an exclusive treat & complimentary cafe voucher on your birthday celebration week.
              </p>
              <Link
                href={`/r/${slug}/birthday-club?name=${encodeURIComponent(bill?.customer_name || '')}&phone=${encodeURIComponent(bill?.customer_phone || '')}`}
                className="mt-2 inline-block text-xs font-bold text-[#8A5C2B] hover:text-[#5C3B19] underline"
              >
                Join Birthday Club Now →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Group Split Bill Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#EAE3D8] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F5F0E8] border border-[#EAE3D8] flex items-center justify-center text-[#8A5C2B]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2A231E]">Split the Bill</h3>
                  <p className="text-[11px] text-[#7A6B5D]">Total: {formatCurrency(bill?.total || 273, settings.currency)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSplitModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#EAE3D8] flex items-center justify-center text-[#7A6B5D] hover:text-[#2A231E]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="my-4">
              <label className="block text-xs font-bold text-[#2A231E] mb-2">Split between how many friends?</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSplitCount(num)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      splitCount === num
                        ? 'bg-[#241D17] text-[#FAF8F5] border-[#241D17]'
                        : 'bg-[#FAF8F5] text-[#5A4D41] border-[#EAE3D8] hover:border-[#D4AD85]'
                    }`}
                  >
                    {num}👥
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Share & Dynamic UPI QR */}
            {(() => {
              const perPerson = Math.ceil((bill?.total || 273) / splitCount);
              const upiUri = `upi://pay?pa=${settings.upi_id || 'cafe@upi'}&pn=${encodeURIComponent(
                restaurant.name
              )}&am=${perPerson}&tn=${encodeURIComponent(`Bill #${bill?.bill_number || '1042'} Split ${splitCount} ways`)}`;

              return (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D8] text-center">
                  <div className="text-[11px] text-[#7A6B5D]">Each friend pays:</div>
                  <div className="text-xl font-extrabold text-[#2A231E] my-1">
                    {formatCurrency(perPerson, settings.currency)}
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#EAE3D8] inline-block my-2 shadow-2xs">
                    <QRCodeSVG value={upiUri} size={130} />
                  </div>

                  <p className="text-[10px] text-[#A89887]">Scan with GPay, PhonePe, or Paytm</p>
                  <a
                    href={upiUri}
                    className="mt-3 block w-full py-2.5 rounded-xl bg-[#C29B72] hover:bg-[#A88259] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Pay My Share ({formatCurrency(perPerson, settings.currency)})
                  </a>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
