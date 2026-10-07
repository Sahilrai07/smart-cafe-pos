'use client';

import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { Restaurant, RestaurantSettings } from '@/types';
import {
  Settings,
  Store,
  Building2,
  Receipt,
  Cake,
  Save,
  CheckCircle2,
  Sparkles,
  Percent,
  Clock,
  QrCode,
  Coins,
  ShieldCheck,
  CreditCard,
  ChefHat,
  BellRing,
  Coffee,
  Star,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Form State - Cafe Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');

  // Operations & Timings
  const [openingTime, setOpeningTime] = useState('09:00 AM');
  const [closingTime, setClosingTime] = useState('11:00 PM');
  const [defaultPrepTime, setDefaultPrepTime] = useState(15);
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [enableSelfPickup, setEnableSelfPickup] = useState(true);
  const [enableTableOrdering, setEnableTableOrdering] = useState(true);

  // Billing, Tax & Payments
  const [currency, setCurrency] = useState('₹');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxPercentage, setTaxPercentage] = useState(5.0);
  const [upiId, setUpiId] = useState('');

  // Loyalty Engine
  const [coinsEarnRate, setCoinsEarnRate] = useState(10);
  const [coinValue, setCoinValue] = useState(1);

  // WhatsApp & Birthday Club
  const [billTemplate, setBillTemplate] = useState('');
  const [birthdayTemplate, setBirthdayTemplate] = useState('');
  const [birthdayOffer, setBirthdayOffer] = useState('');
  const [birthdayDays, setBirthdayDays] = useState(7);
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');

  const refreshData = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        setName(r.name);
        setPhone(r.phone);
        setWhatsapp(r.whatsapp_number);
        setAddress(r.address || '');

        const s = await supabaseService.getSettings(r.id);
        setSettings(s);
        setCurrency(s.currency || '₹');
        setTaxEnabled(s.tax_enabled ?? true);
        setTaxPercentage(s.tax_percentage || 5);
        setBillTemplate(s.bill_message_template || '');
        setBirthdayTemplate(s.birthday_message_template || '');
        setBirthdayOffer(s.birthday_offer_text || '');
        setBirthdayDays(s.birthday_days_before || 7);

        // Extended fields
        setOpeningTime(s.opening_time || '09:00 AM');
        setClosingTime(s.closing_time || '11:00 PM');
        setDefaultPrepTime(s.default_prep_time_minutes || 15);
        setAutoAcceptOrders(s.auto_accept_orders ?? false);
        setEnableSelfPickup(s.enable_self_pickup ?? true);
        setEnableTableOrdering(s.enable_table_ordering ?? true);
        setUpiId(s.upi_id || 'royale@upi');
        setCoinsEarnRate(s.coins_earn_rate_percent || 10);
        setCoinValue(s.coin_value_in_currency || 1);
        setGoogleReviewUrl(s.google_review_url || '');
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    // Update restaurant info
    await supabaseService.updateRestaurant(restaurant.id, {
      name,
      phone,
      whatsapp_number: whatsapp,
      address,
    });

    // Update restaurant settings
    await supabaseService.updateSettings(restaurant.id, {
      currency,
      tax_enabled: taxEnabled,
      tax_percentage: taxPercentage,
      bill_message_template: billTemplate,
      birthday_message_template: birthdayTemplate,
      birthday_offer_text: birthdayOffer,
      birthday_days_before: birthdayDays,
      opening_time: openingTime,
      closing_time: closingTime,
      default_prep_time_minutes: defaultPrepTime,
      auto_accept_orders: autoAcceptOrders,
      enable_self_pickup: enableSelfPickup,
      enable_table_ordering: enableTableOrdering,
      upi_id: upiId,
      coins_earn_rate_percent: coinsEarnRate,
      coin_value_in_currency: coinValue,
      google_review_url: googleReviewUrl,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!restaurant || !settings) return null;

  return (
    <div className="space-y-6 max-w-5xl pb-12 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#FAF8F5] tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#C29B72]" />
            Restaurant & Store Configuration
          </h1>
          <p className="text-xs text-[#8E7E73] mt-0.5">
            Configure cafe branding, operating hours, kitchen dispatch, digital UPI, loyalty rewards & WhatsApp templates.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5F7A62]/15 text-[#9BB89E] text-xs font-semibold border border-[#5F7A62]/30 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#5F7A62]" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Cafe Profile */}
        <div className="p-6 bg-[#1C1713] rounded-3xl border border-[#2B221A] space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-[#FAF8F5] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C29B72]" />
            Cafe Details & Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Cafe / Brand Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
                Restaurant Slug (Customer URL ID)
              </label>
              <input
                type="text"
                disabled
                value={restaurant.slug}
                className="w-full px-3 py-2 rounded-xl bg-[#1A1410] border border-[#281F18] text-xs text-[#6E5F55] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
                Support Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
                Official WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours & Kitchen Settings */}
        <div className="p-6 bg-[#1C1713] rounded-3xl border border-[#2B221A] space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-[#FAF8F5] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C29B72]" />
            Cafe Timings & Order Dispatch Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Opening Time</label>
              <input
                type="text"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Closing Time</label>
              <input
                type="text"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                placeholder="11:00 PM"
                className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
                Default Kitchen Prep Time (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={90}
                value={defaultPrepTime}
                onChange={(e) => setDefaultPrepTime(parseInt(e.target.value, 10) || 15)}
                className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
              />
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#261E18]">
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#211A15] border border-[#2E241D] cursor-pointer hover:border-[#3D3026] transition-colors">
              <input
                type="checkbox"
                checked={autoAcceptOrders}
                onChange={(e) => setAutoAcceptOrders(e.target.checked)}
                className="w-4 h-4 rounded-md bg-[#181310] border-[#382E25] text-[#C29B72] focus:ring-0"
              />
              <div>
                <p className="text-xs font-semibold text-[#FAF8F5]">Auto-Accept Orders</p>
                <p className="text-[10px] text-[#8E7E73]">Directly forward to Kitchen KDS</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#211A15] border border-[#2E241D] cursor-pointer hover:border-[#3D3026] transition-colors">
              <input
                type="checkbox"
                checked={enableSelfPickup}
                onChange={(e) => setEnableSelfPickup(e.target.checked)}
                className="w-4 h-4 rounded-md bg-[#181310] border-[#382E25] text-[#C29B72] focus:ring-0"
              />
              <div>
                <p className="text-xs font-semibold text-[#FAF8F5]">Self-Pickup Counter</p>
                <p className="text-[10px] text-[#8E7E73]">Generates pickup tokens (#PK)</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#211A15] border border-[#2E241D] cursor-pointer hover:border-[#3D3026] transition-colors">
              <input
                type="checkbox"
                checked={enableTableOrdering}
                onChange={(e) => setEnableTableOrdering(e.target.checked)}
                className="w-4 h-4 rounded-md bg-[#181310] border-[#382E25] text-[#C29B72] focus:ring-0"
              />
              <div>
                <p className="text-xs font-semibold text-[#FAF8F5]">Table QR Dine-In</p>
                <p className="text-[10px] text-[#8E7E73]">Guests order from tables</p>
              </div>
            </label>
          </div>
        </div>

        {/* Currency, Tax & Digital UPI */}
        <div className="p-6 bg-[#1C1713] rounded-3xl border border-[#2B221A] space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-[#FAF8F5] flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#C29B72]" />
            Billing, Taxes & Digital Payments (UPI)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
                Tax (GST / VAT) %
              </label>
              <input
                type="number"
                step="0.1"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
                Cafe UPI ID (for POS QR)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. cafe@okaxis"
                className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF]"
              />
            </div>
          </div>

          <div className="flex items-center pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#EDE7DF] cursor-pointer">
              <input
                type="checkbox"
                checked={taxEnabled}
                onChange={(e) => setTaxEnabled(e.target.checked)}
                className="w-4 h-4 rounded-md bg-[#181310] border-[#382E25] text-[#C29B72]"
              />
              Enable Tax Calculation on Customer Bills
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
              WhatsApp Digital Bill Message Template
            </label>
            <p className="text-[10px] text-[#7A6B60] mb-1.5">
              Available tags: {'{customer_name}'}, {'{restaurant_name}'}, {'{bill_number}'}, {'{table_number}'}, {'{items_list}'}, {'{subtotal}'}, {'{tax}'}, {'{total}'}, {'{currency}'}, {'{birthday_club_link}'}
            </p>
            <textarea
              rows={4}
              value={billTemplate}
              onChange={(e) => setBillTemplate(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs font-mono text-[#D8C7B8] focus:outline-hidden focus:border-[#C29B72]"
            />
          </div>
        </div>

        {/* Loyalty Engine Settings */}
        <div className="p-6 bg-[#1C1713] rounded-3xl border border-[#2B221A] space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-[#FAF8F5] flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#C29B72]" />
            Loyalty Coins & Reward Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
                Coins Earn Rate (% of Bill Awarded)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={coinsEarnRate}
                  onChange={(e) => setCoinsEarnRate(parseInt(e.target.value, 10) || 10)}
                  className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] pr-8"
                />
                <span className="absolute right-3 top-2 text-xs text-[#8E7E73] font-bold">%</span>
              </div>
              <p className="text-[10px] text-[#7A6B60] mt-1">
                E.g. at 10%, a guest spending ₹500 earns 50 loyalty coins.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
                Redemption Value (1 Coin in {currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min={0.1}
                  value={coinValue}
                  onChange={(e) => setCoinValue(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF]"
                />
              </div>
              <p className="text-[10px] text-[#7A6B60] mt-1">
                Value applied when customers redeem coins at Counter POS.
              </p>
            </div>
          </div>
        </div>

        {/* Google 5-Star Reviews & Online Growth */}
        <div className="p-6 bg-[#1C1713] rounded-3xl border border-[#2B221A] space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-[#FAF8F5] flex items-center gap-2">
            <Star className="w-4 h-4 text-[#D4AD85]" />
            Google 5-Star Reviews & Reputation Booster
          </h2>
          <p className="text-xs text-[#8E7E73]">
            When customers view their digital bill and tap 4 or 5 stars, they are automatically routed to your Google Maps review page. 1-3 star ratings are kept private to protect your public rating.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
              Google Maps Review Link / Place URL
            </label>
            <input
              type="url"
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              placeholder="e.g. https://g.page/r/your-cafe/review or https://maps.google.com/..."
              className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
            />
            <p className="text-[10px] text-[#7A6B60] mt-1">
              Get this from your Google Business Profile (Click "Ask for reviews" in Google Maps).
            </p>
          </div>
        </div>

        {/* Birthday Club & Reminders */}
        <div className="p-6 bg-[#1C1713] rounded-3xl border border-[#2B221A] space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-[#FAF8F5] flex items-center gap-2">
            <Cake className="w-4 h-4 text-[#C29B72]" />
            Birthday Membership Club & Automated Reminders
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
                Reminder Window (Days in Advance)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={birthdayDays}
                onChange={(e) => setBirthdayDays(parseInt(e.target.value, 10) || 7)}
                className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
                Birthday Offer / Perk Description
              </label>
              <input
                type="text"
                value={birthdayOffer}
                onChange={(e) => setBirthdayOffer(e.target.value)}
                placeholder="Complimentary Birthday Dessert + 15% OFF"
                className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
              Automated Birthday Greeting WhatsApp Template
            </label>
            <p className="text-[10px] text-[#7A6B60] mb-1.5">
              Available tags: {'{customer_name}'}, {'{restaurant_name}'}, {'{days_before}'}, {'{birthday_offer}'}
            </p>
            <textarea
              rows={3}
              value={birthdayTemplate}
              onChange={(e) => setBirthdayTemplate(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs font-mono text-[#D8C7B8] focus:outline-hidden focus:border-[#C29B72]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="py-3 px-8 rounded-2xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-xs flex items-center gap-2 shadow-md shadow-[#C29B72]/20 transition-all active:scale-[0.98]"
        >
          <Save className="w-4 h-4" />
          <span>Save All Settings</span>
        </button>
      </form>
    </div>
  );
}
