'use client';

import React, { useState, useEffect } from 'react';
import { cafeStore, subscribeToStore } from '@/lib/store';
import { Offer, Restaurant, Customer, TargetAudience } from '@/types';
import { buildPromoWhatsAppUrl } from '@/lib/whatsapp';
import {
  Tag,
  Plus,
  Send,
  Users,
  Calendar,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('ALL');

  const refreshData = () => {
    const rId = cafeStore.getActiveRestaurantId();
    const r = cafeStore.getRestaurantById(rId);
    setRestaurant(r || null);
    if (r) {
      setOffers(cafeStore.getOffers(r.id));
      setCustomers(cafeStore.getCustomers(r.id));
    }
  };

  useEffect(() => {
    refreshData();
    return subscribeToStore(refreshData);
  }, []);

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !title || !message) return;

    cafeStore.createOffer({
      restaurant_id: restaurant.id,
      title,
      message,
      start_date: new Date().toISOString().split('T')[0],
      target_audience: targetAudience,
      active: true,
    });

    setTitle('');
    setMessage('');
    setIsCreateOpen(false);
    refreshData();
  };

  const handleSendToCustomer = (customer: Customer, offerText: string) => {
    if (!restaurant) return;
    const url = buildPromoWhatsAppUrl({
      customerName: customer.name,
      customerPhone: customer.phone,
      messageText: offerText,
      restaurant,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Offers & WhatsApp Campaigns
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Broadcast promotional deals directly through 1-click WhatsApp Click-to-Chat (Zero paid API)
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(!isCreateOpen)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Offer Campaign</span>
        </button>
      </div>

      {/* Create Offer Drawer */}
      {isCreateOpen && (
        <form onSubmit={handleCreateOffer} className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4 animate-in zoom-in-95">
          <h3 className="text-base font-black text-white">Create New Promo Campaign</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Offer Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekend BOGO on Shakes! 🥤"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="ALL">All Customers</option>
                <option value="BIRTHDAY_CLUB">Birthday Club Members Only</option>
                <option value="REPEAT">Repeat Visitors (2+ visits)</option>
                <option value="INACTIVE_30">Inactive 30+ Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              WhatsApp Message Template ({'{customer_name}'} and {'{restaurant_name}'} placeholders)
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hey {customer_name}! Enjoy Buy-1-Get-1 on all beverages this weekend at {restaurant_name}!"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs"
            >
              Launch Offer
            </button>
          </div>
        </form>
      )}

      {/* Active Offers */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-400" />
          Active Offers & Direct WhatsApp Broadcast
        </h2>

        {offers.map((offer) => {
          // Filter customers by audience
          const targetList = customers.filter((c) => {
            if (offer.target_audience === 'BIRTHDAY_CLUB') return c.birthday_club_member;
            if (offer.target_audience === 'REPEAT') return (c.total_visits || 1) >= 2;
            return true;
          });

          return (
            <div key={offer.id} className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black text-white">{offer.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{offer.message}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Target: {offer.target_audience}
                </span>
              </div>

              {/* Target Customer Quick Send List */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  Eligible Customers ({targetList.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {targetList.map((cust) => (
                    <div
                      key={cust.id}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{cust.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{cust.phone}</div>
                      </div>
                      <button
                        onClick={() => handleSendToCustomer(cust, offer.message)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
