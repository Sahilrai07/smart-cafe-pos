'use client';

import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { MenuItem, MenuCategory, Restaurant, RestaurantSettings } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  X,
  Filter,
  RefreshCw,
} from 'lucide-react';

export default function AdminMenuPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New item form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [isVeg, setIsVeg] = useState(true);

  const refreshData = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const [s, cats, menuList] = await Promise.all([
          supabaseService.getSettings(r.id),
          supabaseService.getCategories(r.id),
          supabaseService.getMenuItems(r.id),
        ]);
        setSettings(s);
        setCategories(cats);
        if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
        setItems(menuList);
      }
    } catch (e) {
      console.error('Error refreshing menu:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleToggleAvailability = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    const currAvailable = item ? item.available : true;
    await supabaseService.toggleItemAvailability(itemId, currAvailable);
    await refreshData();
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !name || !price) return;

    await supabaseService.createMenuItem({
      restaurant_id: restaurant.id,
      category_id: categoryId || null,
      name,
      description: description || null,
      price: parseFloat(price),
      image_url: null,
      available: true,
      is_veg: isVeg,
    });

    setIsAddModalOpen(false);
    setName('');
    setPrice('');
    setDescription('');
    await refreshData();
  };

  const currency = settings?.currency || '₹';
  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q));
  });  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#EDE7DF] tracking-tight">Menu Catalog</h1>
          <p className="text-xs text-[#A89887] mt-1">
            Configure items, prices, and toggle live availability across customer QR menus • {restaurant?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A6B5D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="pl-9 pr-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] placeholder-[#7A6B5D] focus:outline-hidden focus:border-[#C29B72]"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs shadow-md shadow-[#C29B72]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#241D17] text-[#A89887] uppercase text-[10px] font-bold tracking-wider border-b border-[#2B221A]">
              <tr>
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-center">Availability (Live)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B221A]/80 text-[#EDE7DF]">
              {filtered.map((item) => {
                const cat = categories.find((c) => c.id === item.category_id);
                return (
                  <tr key={item.id} className="hover:bg-[#241D17] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#EDE7DF] text-sm">{item.name}</div>
                      {item.description && (
                        <div className="text-[11px] text-[#A89887] line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-[#A89887]">{cat?.name || 'General'}</td>
                    <td className="p-4 font-bold text-[#D4AD85] text-sm">
                      {formatCurrency(item.price, currency)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.is_veg
                            ? 'bg-[#5F7A62]/15 text-[#9BB89E] border border-[#5F7A62]/30'
                            : 'bg-[#B35C4A]/15 text-[#DF9182] border border-[#B35C4A]/30'
                        }`}
                      >
                        {item.is_veg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleAvailability(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          item.available
                            ? 'bg-[#5F7A62]/20 text-[#9BB89E] border border-[#5F7A62]/30 hover:bg-[#5F7A62]/30'
                            : 'bg-[#241D17] text-[#7A6B5D] border border-[#2B221A] hover:bg-[#2B221A]'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.available ? 'bg-[#5F7A62]' : 'bg-[#7A6B5D]'
                          }`}
                        />
                        <span>{item.available ? 'Available' : 'Sold Out'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-[#14110E]/70 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-[#1C1713] border border-[#2B221A] p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#2B221A]">
                <h3 className="text-base font-bold text-[#EDE7DF]">Add New Menu Item</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#241D17] text-[#A89887] hover:text-[#EDE7DF] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A89887] mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Artisanal Cappuccino"
                    className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A89887] mb-1">
                      Price ({currency}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A89887] mb-1">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A89887] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Double shot espresso with silky micro-foam steamed milk..."
                    className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#EDE7DF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVeg}
                      onChange={(e) => setIsVeg(e.target.checked)}
                      className="rounded-sm bg-[#14110E] border-[#2B221A] text-[#C29B72] focus:ring-[#C29B72]"
                    />
                    Vegetarian Item
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs shadow-md shadow-[#C29B72]/20 cursor-pointer transition-colors"
                >
                  Save Item to Menu
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
