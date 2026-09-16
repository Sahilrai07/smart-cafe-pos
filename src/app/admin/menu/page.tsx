'use client';

import React, { useState, useEffect } from 'react';
import { cafeStore, subscribeToStore } from '@/lib/store';
import { MenuItem, MenuCategory, Restaurant, RestaurantSettings } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  BookOpen,
  Plus,
  Check,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Search,
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

  const refreshData = () => {
    const rId = cafeStore.getActiveRestaurantId();
    const r = cafeStore.getRestaurantById(rId);
    setRestaurant(r || null);
    if (r) {
      setSettings(cafeStore.getSettings(r.id));
      const cats = cafeStore.getCategories(r.id);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
      setItems(cafeStore.getMenuItems(r.id));
    }
  };

  useEffect(() => {
    refreshData();
    return subscribeToStore(refreshData);
  }, []);

  const handleToggleAvailability = (itemId: string) => {
    cafeStore.toggleItemAvailability(itemId);
    refreshData();
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !name || !price) return;

    cafeStore.addMenuItem({
      restaurant_id: restaurant.id,
      category_id: categoryId || categories[0]?.id,
      name,
      description: description || null,
      price: parseFloat(price),
      available: true,
      is_veg: isVeg,
    });

    setName('');
    setPrice('');
    setDescription('');
    setIsAddModalOpen(false);
    refreshData();
  };

  const currency = settings?.currency || '₹';
  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Menu Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure items, prices, and toggle live availability across customer QR menus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-center">Availability (Live)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((item) => {
                const cat = categories.find((c) => c.id === item.category_id);
                return (
                  <tr key={item.id} className="hover:bg-slate-900/40">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{cat?.name || 'General'}</td>
                    <td className="p-4 font-black text-amber-400 text-sm">
                      {formatCurrency(item.price, currency)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.is_veg
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {item.is_veg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleAvailability(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          item.available
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.available ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-lg font-black text-white">Add New Menu Item</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Crispy Paneer Burger"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Price ({currency}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Spiced cottage cheese patty with fresh mint chutney..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVeg}
                      onChange={(e) => setIsVeg(e.target.checked)}
                      className="rounded-sm bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                    Vegetarian Item
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
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
