'use client';

import React, { useState } from 'react';
import { Order, Restaurant, RestaurantSettings, Bill } from '@/types';
import { supabaseService } from '@/lib/services/supabaseService';
import { formatCurrency } from '@/lib/utils';
import { buildBillWhatsAppUrl } from '@/lib/whatsapp';
import {
  Receipt,
  X,
  User,
  Phone,
  Send,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface GenerateBillModalProps {
  order: Order | null;
  restaurant: Restaurant;
  settings: RestaurantSettings;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bill: Bill) => void;
}

export const GenerateBillModal: React.FC<GenerateBillModalProps> = ({
  order,
  restaurant,
  settings,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState(order?.customer_name || 'Rahul Sharma');
  const [customerPhone, setCustomerPhone] = useState(order?.customer_phone || '+91 9876543210');
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const currency = settings.currency || '₹';

  const handleGenerateAndOpenWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Generate real bill in Supabase (this also upserts the customer into Supabase CRM!)
      const bill = await supabaseService.createBill({
        restaurant_id: restaurant.id,
        order_id: order.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        subtotal: order.subtotal,
        tax: order.tax,
        discount: order.discount || 0,
        total: order.total,
        items: order.items || [],
        table_number: order.table_number_snapshot || '01',
      });

      if (!bill) {
        alert('Failed to generate bill. Please check database connection.');
        return;
      }

      // 2. Build personalized WhatsApp click-to-chat URL with real data
      const url = buildBillWhatsAppUrl({
        bill,
        restaurant,
        settings,
        customerName,
        customerPhone,
        items: order.items || [],
      });

      setGeneratedBill(bill);
      setWhatsAppUrl(url);

      // 3. Mark sent & notify parent
      await supabaseService.markBillWhatsAppSent(bill.id);
      onSuccess(bill);

      // 4. Open WhatsApp in new tab/app immediately
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error generating bill:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#14110E]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-3xl bg-[#1C1713] shadow-2xl overflow-hidden border border-[#2B221A] animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-[#241D17] p-6 text-[#EDE7DF] flex items-center justify-between border-b border-[#2B221A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C29B72]/15 border border-[#C29B72]/30 text-[#D4AD85] flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight text-[#EDE7DF]">
                  Generate Bill • Order #{order.order_number}
                </h3>
                <p className="text-xs text-[#A89887]">
                  {order.table_number_snapshot ? `Table ${order.table_number_snapshot}` : 'Takeaway'} • {restaurant.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1C1713] text-[#A89887] hover:text-[#EDE7DF] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            {generatedBill ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#5F7A62]/15 border border-[#5F7A62]/30 text-[#9BB89E] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-[#EDE7DF]">
                  Bill #{generatedBill.bill_number} Generated!
                </h4>
                <p className="text-xs text-[#A89887] max-w-xs mx-auto">
                  Customer <strong className="text-[#EDE7DF]">{customerName}</strong> ({customerPhone}) has been automatically added to your Customer Directory.
                </p>

                <div className="p-4 bg-[#241D17] border border-[#2B221A] rounded-2xl text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#A89887] font-medium">Total Amount:</span>
                    <span className="text-[#D4AD85] font-bold text-sm">
                      {formatCurrency(generatedBill.total, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#A89887]">
                    <span>WhatsApp Dispatch:</span>
                    <span className="text-[#9BB89E] font-semibold">Opened in WhatsApp</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-[#5F7A62] hover:bg-[#4E6751] text-[#FAF8F5] text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#5F7A62]/20 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Re-open WhatsApp Bill Message</span>
                  </a>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-[#241D17] hover:bg-[#2B221A] text-[#EDE7DF] text-xs font-semibold border border-[#2B221A] transition-colors cursor-pointer"
                  >
                    Done & Return to Orders
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateAndOpenWhatsApp} className="space-y-4">
                {/* Items preview */}
                <div className="bg-[#241D17] p-3.5 rounded-2xl border border-[#2B221A] space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase text-[#A89887] tracking-wider">
                    Order Items
                  </span>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[#EDE7DF]">
                      <span>
                        {item.item_name_snapshot} × {item.quantity}
                      </span>
                      <span className="font-semibold text-[#D4AD85]">
                        {formatCurrency(item.total, currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-[#EDE7DF] pt-2 border-t border-[#2B221A] text-sm">
                    <span>Grand Total</span>
                    <span className="text-[#D4AD85]">{formatCurrency(order.total, currency)}</span>
                  </div>
                </div>

                {/* Asking customer for Name & WhatsApp */}
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-[#241D17] border border-[#2B221A] rounded-2xl text-xs text-[#EDE7DF] flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AD85] shrink-0 mt-0.5" />
                    <div className="text-[#A89887]">
                      <strong className="text-[#EDE7DF]">Staff Prompt:</strong> &ldquo;What name should I put on the bill?&rdquo; and &ldquo;Can I have your WhatsApp number for the digital invoice?&rdquo;
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A89887] mb-1">
                      Customer Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#7A6B5D] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#2B221A] bg-[#14110E] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A89887] mb-1">
                      WhatsApp Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#7A6B5D] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. +91 9876543210"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#2B221A] bg-[#14110E] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                      />
                    </div>
                    <p className="text-[10px] text-[#A89887] mt-1">
                      WhatsApp will open with the pre-filled personalized bill receipt.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C29B72]/20 transition-all mt-3 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Generate & Send Bill on WhatsApp</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
