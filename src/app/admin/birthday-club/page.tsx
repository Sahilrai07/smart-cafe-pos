'use client';

import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
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

  const refreshData = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const s = await supabaseService.getSettings(r.id);
        setSettings(s);
        const days = s.birthday_days_before || 7;
        setReminderDays(days);

        // Get upcoming birthdays calculated annually from real Supabase DB
        const [upcoming, customers] = await Promise.all([
          supabaseService.getUpcomingBirthdays(r.id, days),
          supabaseService.getCustomers(r.id),
        ]);
        setUpcomingBirthdays(upcoming);
        setAllClubMembers(customers.filter((c) => c.birthday_club_member));
      }
    } catch (e) {
      console.error('Error refreshing birthday data:', e);
    }
  };

  useEffect(() => {
    refreshData();
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

  const handleUpdateReminderDays = async (days: number) => {
    if (!restaurant) return;
    setReminderDays(days);
    await supabaseService.updateSettings(restaurant.id, { birthday_days_before: days });
    await refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#EDE7DF] tracking-tight">
              Birthday Club Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B35C4A]/15 text-[#DF9182] border border-[#B35C4A]/30">
              Recurring Annual Automation
            </span>
          </div>
          <p className="text-xs text-[#A89887] mt-1">
            Detects upcoming birthdays automatically every year • WhatsApp Click-to-Chat greetings • {restaurant?.name}
          </p>
        </div>

        {/* Reminder Days Selector */}
        <div className="flex items-center gap-2 bg-[#1C1713] p-1.5 rounded-2xl border border-[#2B221A]">
          <Clock className="w-4 h-4 text-[#D4AD85] ml-2" />
          <span className="text-xs text-[#A89887] font-semibold">Reminder Window:</span>
          <select
            value={reminderDays}
            onChange={(e) => handleUpdateReminderDays(parseInt(e.target.value, 10))}
            className="bg-[#14110E] text-[#D4AD85] border border-[#2B221A] rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-hidden focus:border-[#C29B72]"
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
        <div className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A] flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs font-semibold text-[#A89887]">Upcoming Birthdays</span>
            <div className="text-3xl font-bold text-[#DF9182] mt-1">
              {upcomingBirthdays.length}
            </div>
            <span className="text-[10px] text-[#7A6B5D]">In the next {reminderDays} days</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#B35C4A]/15 text-[#DF9182] border border-[#B35C4A]/30 flex items-center justify-center font-bold">
            <Cake className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A] flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs font-semibold text-[#A89887]">Total Club Members</span>
            <div className="text-3xl font-bold text-[#EDE7DF] mt-1">{allClubMembers.length}</div>
            <span className="text-[10px] text-[#7A6B5D]">Enrolled customers with DOB</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#C29B72]/15 text-[#D4AD85] border border-[#C29B72]/30 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A] flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs font-semibold text-[#A89887]">Active Birthday Offer</span>
            <div className="text-xs font-semibold text-[#D4AD85] line-clamp-2 mt-1.5">
              {settings?.birthday_offer_text || 'Complimentary dessert or 15% OFF'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#5F7A62]/15 text-[#9BB89E] border border-[#5F7A62]/30 flex items-center justify-center font-bold shrink-0">
            <Gift className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Upcoming Birthdays Section */}
      <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AD85]" />
            <h2 className="text-base font-bold text-[#EDE7DF]">
              Upcoming Celebrations (Next {reminderDays} Days)
            </h2>
          </div>
          <span className="text-xs text-[#A89887]">
            {upcomingBirthdays.length} guest(s) eligible today
          </span>
        </div>

        {upcomingBirthdays.length === 0 ? (
          <div className="py-10 text-center bg-[#241D17] rounded-2xl border border-[#2B221A]">
            <Cake className="w-8 h-8 text-[#7A6B5D] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#EDE7DF]">No birthdays in the next {reminderDays} days</p>
            <p className="text-[11px] text-[#A89887] mt-0.5">
              Tip: When testing, set guest birthday within {reminderDays} days to see them appear here instantly!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBirthdays.map((bday) => (
              <div
                key={bday.customer_id}
                className="p-5 rounded-2xl bg-[#241D17] border border-[#2B221A] hover:border-[#C29B72]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#EDE7DF] flex items-center gap-2">
                        {bday.name}
                        <span className="text-lg">🎂</span>
                      </h3>
                      <p className="text-xs text-[#A89887] font-mono mt-0.5">{bday.phone}</p>
                    </div>

                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B35C4A]/20 text-[#DF9182] border border-[#B35C4A]/30">
                        {bday.days_until === 0
                          ? 'Today!'
                          : bday.days_until === 1
                          ? 'Tomorrow!'
                          : `${bday.days_until} days away`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-[#1C1713] rounded-xl border border-[#2B221A] flex items-center justify-between text-xs">
                    <span className="text-[#A89887] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#DF9182]" />
                      Birthday Date:
                    </span>
                    <span className="font-semibold text-[#EDE7DF]">
                      {formatBirthdayDisplay(bday.birthday)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSendBirthdayGreeting(bday)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#C29B72]/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Birthday WhatsApp Greeting</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Birthday Club Members List */}
      <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-[#EDE7DF] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#D4AD85]" />
          All Birthday Club Members ({allClubMembers.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#241D17] text-[#A89887] uppercase text-[10px] font-bold tracking-wider border-b border-[#2B221A]">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Birthday</th>
                <th className="p-3">Total Visits</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B221A]/80 text-[#EDE7DF]">
              {allClubMembers.map((m) => (
                <tr key={m.id} className="hover:bg-[#241D17]">
                  <td className="p-3 font-semibold text-[#EDE7DF]">{m.name}</td>
                  <td className="p-3 font-mono text-[#A89887]">{m.phone}</td>
                  <td className="p-3">{m.birthday ? formatBirthdayDisplay(m.birthday) : '—'}</td>
                  <td className="p-3 font-bold">{m.total_visits || 1}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        const clean = m.phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
                        window.open(`https://wa.me/${clean}`, '_blank');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#241D17] hover:bg-[#2B221A] text-[#9BB89E] border border-[#2B221A] font-semibold text-xs cursor-pointer"
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
