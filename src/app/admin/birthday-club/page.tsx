'use client';

import React, { useState, useEffect } from 'react';
import { cafeStore, subscribeToStore } from '@/lib/store';
import { Customer, Restaurant, RestaurantSettings, UpcomingBirthday } from '@/types';
import { formatBirthdayDisplay } from '@/lib/birthday';
import { buildBirthdayWhatsAppUrl } from '@/lib/whatsapp';
import {
  Cake,
  Calendar,
  Send,
  Sparkles,
  Gift,
  Clock,
  Settings2,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function AdminBirthdayClubPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<UpcomingBirthday[]>([]);
  const [allClubMembers, setAllClubMembers] = useState<Customer[]>([]);
  const [reminderDays, setReminderDays] = useState(7);

  const refreshData = () => {
    const rId = cafeStore.getActiveRestaurantId();
    const r = cafeStore.getRestaurantById(rId);
    setRestaurant(r || null);
    if (r) {
      const s = cafeStore.getSettings(r.id);
      setSettings(s);
      setReminderDays(s.birthday_days_before || 7);

      // Get upcoming birthdays calculated annually
      const upcoming = cafeStore.getUpcomingBirthdays(r.id, s.birthday_days_before || 7);
      setUpcomingBirthdays(upcoming);

      const all = cafeStore.getCustomers(r.id).filter((c) => c.birthday_club_member);
      setAllClubMembers(all);
    }
  };

  useEffect(() => {
    refreshData();
    return subscribeToStore(refreshData);
  }, []);

  const handleSendBirthdayGreeting = (bday: UpcomingBirthday) => {
    if (!restaurant || !settings) return;
    const url = buildBirthdayWhatsAppUrl({
      customerName: bday.name,
      customerPhone: bday.phone,
      daysRemaining: bday.days_until,
      restaurant,
      settings,
    });
    window.open(url, '_blank');
  };

  const handleUpdateReminderDays = (days: number) => {
    if (!restaurant) return;
    setReminderDays(days);
    cafeStore.updateSettings(restaurant.id, { birthday_days_before: days });
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Birthday Club Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Recurring Annual Automation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detects upcoming birthdays automatically every year • WhatsApp Click-to-Chat greetings
          </p>
        </div>

        {/* Reminder Days Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <Clock className="w-4 h-4 text-amber-400 ml-2" />
          <span className="text-xs text-slate-300 font-bold">Reminder Window:</span>
          <select
            value={reminderDays}
            onChange={(e) => handleUpdateReminderDays(parseInt(e.target.value, 10))}
            className="bg-slate-900 text-amber-400 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-black focus:outline-hidden"
          >
            <option value={3}>3 Days Ahead</option>
            <option value={5}>5 Days Ahead</option>
            <option value={7}>7 Days Ahead (Default)</option>
            <option value={10}>10 Days Ahead</option>
            <option value={14}>14 Days Ahead</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Upcoming Birthdays</span>
            <div className="text-3xl font-black text-rose-400 mt-1">
              {upcomingBirthdays.length}
            </div>
            <span className="text-[10px] text-slate-500">In the next {reminderDays} days</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold">
            <Cake className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Total Club Members</span>
            <div className="text-3xl font-black text-white mt-1">{allClubMembers.length}</div>
            <span className="text-[10px] text-slate-500">Enrolled customers with DOB</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">Active Birthday Offer</span>
            <div className="text-xs font-black text-amber-400 line-clamp-2 mt-1.5">
              {settings?.birthday_offer_text || 'Complimentary dessert or 15% OFF'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold shrink-0">
            <Gift className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Upcoming Birthdays Section (THE CORE PITCH DEMO!) */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-white">
              Upcoming Birthdays (Next {reminderDays} Days)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {upcomingBirthdays.length} customer(s) eligible today
          </span>
        </div>

        {upcomingBirthdays.length === 0 ? (
          <div className="py-10 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <Cake className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">No birthdays in the next {reminderDays} days</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tip: When testing, set customer birthday to 7 days from today to see them appear here instantly!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBirthdays.map((bday) => (
              <div
                key={bday.customer_id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        {bday.name}
                        <span className="text-lg">🎂</span>
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{bday.phone}</p>
                    </div>

                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-xs">
                        {bday.days_until === 0
                          ? '🎉 Today!'
                          : bday.days_until === 1
                          ? 'Tomorrow!'
                          : `${bday.days_until} days away`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      Birthday Date:
                    </span>
                    <span className="font-bold text-white">
                      {formatBirthdayDisplay(bday.birthday)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSendBirthdayGreeting(bday)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Birthday WhatsApp Offer</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Birthday Club Members List */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          All Birthday Club Members ({allClubMembers.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Birthday</th>
                <th className="p-3">Total Visits</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {allClubMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">{m.name}</td>
                  <td className="p-3 font-mono">{m.phone}</td>
                  <td className="p-3">{m.birthday ? formatBirthdayDisplay(m.birthday) : '—'}</td>
                  <td className="p-3 font-bold">{m.total_visits || 1}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        const clean = m.phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
                        window.open(`https://wa.me/${clean}`, '_blank');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs"
                    >
                      Chat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
