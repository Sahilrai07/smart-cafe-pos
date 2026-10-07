'use client';

import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { Restaurant, RestaurantSettings, Customer, LoyaltyReward } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Coins,
  Award,
  Gift,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
  Users,
  TrendingUp,
  Sliders,
  X,
  Coffee,
} from 'lucide-react';

export default function LoyaltyPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);

  // New reward form
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardDesc, setRewardDesc] = useState('');
  const [rewardCost, setRewardCost] = useState(100);
  const [rewardDiscount, setRewardDiscount] = useState<number | undefined>(undefined);
  const [rewardItem, setRewardItem] = useState('');

  const refreshData = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const [s, rwdList, custList] = await Promise.all([
          supabaseService.getSettings(r.id),
          supabaseService.getLoyaltyRewards(r.id),
          supabaseService.getCustomers(r.id),
        ]);
        setSettings(s);
        setRewards(rwdList);
        setCustomers(custList);
      }
    } catch (e) {
      console.error('Error refreshing loyalty data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !rewardTitle.trim()) return;

    await supabaseService.addLoyaltyReward({
      restaurant_id: restaurant.id,
      title: rewardTitle,
      description: rewardDesc,
      coin_cost: rewardCost,
      discount_amount: rewardDiscount || undefined,
      free_item_name: rewardItem || undefined,
      active: true,
    });

    setRewardTitle('');
    setRewardDesc('');
    setRewardCost(100);
    setRewardDiscount(undefined);
    setRewardItem('');
    setIsAddRewardOpen(false);
    refreshData();
  };

  const handleRedeemRewardForCustomer = async (customerId: string, rewardId: string) => {
    const success = await supabaseService.redeemCustomerReward(customerId, rewardId);
    if (success) {
      alert('Reward redeemed successfully!');
      refreshData();
    } else {
      alert('Insufficient coin balance for this reward.');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (selectedTier !== 'ALL' && c.loyalty_tier !== selectedTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  });

  const totalCoinsInCirculation = customers.reduce((sum, c) => sum + (c.loyalty_coins || 0), 0);
  const totalCoinsRedeemed = customers.reduce((sum, c) => sum + (c.total_coins_redeemed || 0), 0);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C1713] p-5 rounded-3xl border border-[#2B221A]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#241D17] border border-[#352B21] flex items-center justify-center text-[#C29B72]">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#FAF8F5] tracking-tight">
              Loyalty & Coffee Club Rewards
            </h1>
            <p className="text-xs text-[#8E7E73] mt-0.5">
              Reward points for visits • Configurable coin earning & complimentary perk redemptions • {restaurant?.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddRewardOpen(true)}
          className="px-4 py-2 rounded-2xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-xs flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Reward</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73]">Active Rewards</span>
          <div className="text-2xl font-bold text-[#FAF8F5] mt-1">{rewards.length}</div>
          <span className="text-[10px] text-[#7A6B60]">In rewards catalog</span>
        </div>
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73]">Coins in Circulation</span>
          <div className="text-2xl font-bold text-[#D4AD85] mt-1">{totalCoinsInCirculation}</div>
          <span className="text-[10px] text-[#7A6B60]">Across {customers.length} guest wallets</span>
        </div>
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73]">Total Redeemed</span>
          <div className="text-2xl font-bold text-[#9BB89E] mt-1">{totalCoinsRedeemed}</div>
          <span className="text-[10px] text-[#7A6B60]">Used for free food & perks</span>
        </div>
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73]">Earn Rule</span>
          <div className="text-2xl font-bold text-[#D4AD85] mt-1">
            {settings?.coins_earn_rate_percent || 10}%
          </div>
          <span className="text-[10px] text-[#7A6B60]">1 Coin per ₹10 bill amount</span>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#FAF8F5] flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#C29B72]" />
            Perks Catalog (Available for Redemption)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewards.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A] flex flex-col justify-between hover:border-[#3C2E23] transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#C29B72]/15 text-[#D4AD85] border border-[#C29B72]/25 flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    {r.coin_cost} Coins
                  </span>
                  <span className="text-[10px] text-[#7A6B60] font-medium">Active</span>
                </div>
                <h4 className="text-sm font-bold text-[#FAF8F5]">{r.title}</h4>
                <p className="text-xs text-[#8E7E73] mt-1 line-clamp-2 leading-relaxed">{r.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#261E18] flex items-center justify-between text-xs">
                <span className="text-[#8E7E73]">Perk:</span>
                <span className="font-semibold text-[#D4AD85]">
                  {r.discount_amount ? `₹${r.discount_amount} Discount` : r.free_item_name || 'Free Item'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Loyalty Balances & Tier Rankings */}
      <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#261E18] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#FAF8F5] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C29B72]" />
              Guest Loyalty Tiers & Wallet Balances
            </h3>
            <p className="text-xs text-[#8E7E73]">
              Bronze (&lt;100) • Silver (100+) • Gold (250+) • Platinum (500+)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8E7E73] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] placeholder:text-[#66574D] focus:outline-hidden"
              />
            </div>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-[#211A15] border border-[#2F241D] text-[#EDE7DF] rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-hidden"
            >
              <option value="ALL">All Tiers</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#261E18] text-[10px] font-semibold uppercase tracking-wider text-[#7A6B60]">
                <th className="pb-3">Customer</th>
                <th className="pb-3">Tier</th>
                <th className="pb-3">Current Balance</th>
                <th className="pb-3">Lifetime Earned</th>
                <th className="pb-3">Lifetime Redeemed</th>
                <th className="pb-3">Total Spend</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#241D17]">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#221A15]/60 transition-colors">
                  <td className="py-3">
                    <span className="font-semibold text-[#FAF8F5] block">{cust.name}</span>
                    <span className="text-[10px] text-[#8E7E73]">{cust.phone}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        cust.loyalty_tier === 'Platinum'
                          ? 'bg-[#2E241D] text-[#D8C7B8] border border-[#3F3127]'
                          : cust.loyalty_tier === 'Gold'
                          ? 'bg-[#C29B72]/15 text-[#DFBD98] border border-[#C29B72]/25'
                          : cust.loyalty_tier === 'Silver'
                          ? 'bg-[#221B16] text-[#A8988C] border border-[#30261F]'
                          : 'bg-[#1E1713] text-[#8E7E73] border border-[#2A201A]'
                      }`}
                    >
                      {cust.loyalty_tier || 'Bronze'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="font-bold text-[#D4AD85] text-sm flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      {cust.loyalty_coins || 0}
                    </span>
                  </td>
                  <td className="py-3 text-[#A8988C] font-semibold">{cust.total_coins_earned || 0}</td>
                  <td className="py-3 text-[#7A6B60]">{cust.total_coins_redeemed || 0}</td>
                  <td className="py-3 font-semibold text-[#FAF8F5]">
                    {formatCurrency(cust.total_spent || 0, settings?.currency || '₹')}
                  </td>
                  <td className="py-3 text-right">
                    {rewards.length > 0 && (cust.loyalty_coins || 0) >= rewards[0].coin_cost ? (
                      <button
                        onClick={() => handleRedeemRewardForCustomer(cust.id, rewards[0].id)}
                        className="px-2.5 py-1 rounded-lg bg-[#5F7A62] hover:bg-[#526B55] text-white font-semibold text-[10px] transition-colors"
                      >
                        Redeem {rewards[0].coin_cost}c
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#695B52]">Need coins</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Reward */}
      {isAddRewardOpen && (
        <div className="fixed inset-0 z-50 bg-[#14110E]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1713] border border-[#2B221A] rounded-3xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 text-[#EDE7DF]">
            <div className="flex items-center justify-between border-b border-[#28201A] pb-3">
              <h3 className="text-base font-bold text-[#FAF8F5] flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#C29B72]" />
                Add Loyalty Reward
              </h3>
              <button
                onClick={() => setIsAddRewardOpen(false)}
                className="w-7 h-7 rounded-full bg-[#241D17] text-[#8E7E73] hover:text-[#EDE7DF] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Reward Title *</label>
                <input
                  type="text"
                  required
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="e.g. Free Cold Brew Coffee"
                  className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Description</label>
                <textarea
                  value={rewardDesc}
                  onChange={(e) => setRewardDesc(e.target.value)}
                  placeholder="Customer redeems X coins for..."
                  className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Coins Required *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={rewardCost}
                    onChange={(e) => setRewardCost(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Flat ₹ Discount</label>
                  <input
                    type="number"
                    value={rewardDiscount || ''}
                    onChange={(e) => setRewardDiscount(parseFloat(e.target.value) || undefined)}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Or Free Menu Dish</label>
                <input
                  type="text"
                  value={rewardItem}
                  onChange={(e) => setRewardItem(e.target.value)}
                  placeholder="e.g. Fresh Baked Croissant"
                  className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-xs transition-colors mt-2 shadow-xs"
              >
                Create Loyalty Reward
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
