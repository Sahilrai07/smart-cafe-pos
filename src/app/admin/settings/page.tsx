'use client';

import React, { useState, useEffect } from 'react';
import { cafeStore, subscribeToStore } from '@/lib/store';
import { Restaurant, RestaurantSettings } from '@/types';
import {
  Settings,
  Building2,
  Receipt,
  Cake,
  CheckCircle2,
  Save,
  RotateCcw,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxPercentage, setTaxPercentage] = useState(5.0);
  const [billTemplate, setBillTemplate] = useState('');
  const [birthdayTemplate, setBirthdayTemplate] = useState('');
  const [birthdayOffer, setBirthdayOffer] = useState('');
  const [birthdayDays, setBirthdayDays] = useState(7);

  const refreshData = () => {
    const rId = cafeStore.getActiveRestaurantId();
    const r = cafeStore.getRestaurantById(rId);
    setRestaurant(r || null);
    if (r) {
      setName(r.name);
      setPhone(r.phone);
      setWhatsapp(r.whatsapp_number);
      setAddress(r.address || '');

      const s = cafeStore.getSettings(r.id);
      setSettings(s);
      setCurrency(s.currency || '₹');
      setTaxEnabled(s.tax_enabled);
      setTaxPercentage(s.tax_percentage || 5);
      setBillTemplate(s.bill_message_template);
      setBirthdayTemplate(s.birthday_message_template);
      setBirthdayOffer(s.birthday_offer_text);
      setBirthdayDays(s.birthday_days_before || 7);
    }
  };

  useEffect(() => {
    refreshData();
    return subscribeToStore(refreshData);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    cafeStore.updateSettings(restaurant.id, {
      currency,
      tax_enabled: taxEnabled,
      tax_percentage: taxPercentage,
      bill_message_template: billTemplate,
      birthday_message_template: birthdayTemplate,
      birthday_offer_text: birthdayOffer,
      birthday_days_before: birthdayDays,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!restaurant || !settings) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Restaurant Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tailor restaurant branding, tax rates, currency, and WhatsApp message templates
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Cafe Profile */}
        <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            Cafe Details & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Cafe Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Restaurant Slug (URL identifier)
              </label>
              <input
                type="text"
                disabled
                value={restaurant.slug}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Display Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Cafe WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax Calculation */}
        <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            Billing, Currency & Tax
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tax (GST) Percentage (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="rounded-sm bg-slate-900 border-slate-700 text-amber-500"
                />
                Enable Tax Calculation on Bills
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              WhatsApp Bill Message Template
            </label>
            <p className="text-[10px] text-slate-500 mb-1.5">
              Variables: {'{customer_name}'}, {'{restaurant_name}'}, {'{bill_number}'}, {'{table_number}'}, {'{items_list}'}, {'{subtotal}'}, {'{tax}'}, {'{total}'}, {'{currency}'}, {'{birthday_club_link}'}
            </p>
            <textarea
              rows={6}
              value={billTemplate}
              onChange={(e) => setBillTemplate(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200"
            />
          </div>
        </div>

        {/* Birthday Club Settings */}
        <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Cake className="w-4 h-4 text-rose-400" />
            Birthday Club & Reminder Configuration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Reminder Window (Days Before Birthday)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={birthdayDays}
                onChange={(e) => setBirthdayDays(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Special Birthday Offer Text
              </label>
              <input
                type="text"
                value={birthdayOffer}
                onChange={(e) => setBirthdayOffer(e.target.value)}
                placeholder="e.g. Free Chocolate Lava Cake or 15% OFF!"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Birthday WhatsApp Greeting Template
            </label>
            <p className="text-[10px] text-slate-500 mb-1.5">
              Variables: {'{customer_name}'}, {'{restaurant_name}'}, {'{days_before}'}, {'{birthday_offer}'}
            </p>
            <textarea
              rows={5}
              value={birthdayTemplate}
              onChange={(e) => setBirthdayTemplate(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200"
            />
          </div>
        </div>

        <button
          type="submit"
          className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}
