'use client';

import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { Restaurant, RestaurantSettings, InventoryItem, MenuItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Boxes,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Package,
  Layers,
  Trash2,
  X,
  Flame,
  Coffee,
} from 'lucide-react';

export default function InventoryPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  // New item form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dairy');
  const [stock, setStock] = useState<number>(10);
  const [unit, setUnit] = useState('kg');
  const [minThreshold, setMinThreshold] = useState<number>(5);
  const [costPerUnit, setCostPerUnit] = useState<number>(100);

  const refreshData = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const [s, invList, items] = await Promise.all([
          supabaseService.getSettings(r.id),
          supabaseService.getInventory(r.id),
          supabaseService.getMenuItems(r.id),
        ]);
        setSettings(s);
        setInventory(invList);
        setMenuItems(items);
      }
    } catch (e) {
      console.error('Error refreshing inventory data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !name.trim()) return;

    await supabaseService.addInventoryItem({
      restaurant_id: restaurant.id,
      name,
      category,
      current_stock: stock,
      unit,
      min_threshold: minThreshold,
      cost_per_unit: costPerUnit,
    });

    setName('');
    setStock(10);
    setMinThreshold(5);
    setCostPerUnit(100);
    setIsAddItemOpen(false);
    refreshData();
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;

    const newStock = restockItem.current_stock + restockQty;
    await supabaseService.updateInventoryStock(restockItem.id, newStock);
    setRestockItem(null);
    refreshData();
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Delete this inventory item?')) {
      await supabaseService.deleteInventoryItem(id);
      refreshData();
    }
  };

  const currency = settings?.currency || '₹';
  const lowStockItems = inventory.filter((i) => i.current_stock <= i.min_threshold);
  const totalStockValue = inventory.reduce((sum, i) => sum + i.current_stock * i.cost_per_unit, 0);

  const filteredInventory = inventory.filter((i) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C1713] p-5 rounded-3xl border border-[#2B221A]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#241D17] border border-[#352B21] flex items-center justify-center text-[#C29B72]">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#FAF8F5] tracking-tight">
              Inventory & Raw Materials Stock
            </h1>
            <p className="text-xs text-[#8E7E73] mt-0.5">
              Ingredient stock levels, low-stock warnings, reorder thresholds & item velocity • {restaurant?.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddItemOpen(true)}
          className="px-4 py-2 rounded-2xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Low Stock Warning Banner if any items low */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#241714] border border-[#44231C] text-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#381F1A] text-[#DF9182] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#FAF8F5]">
                Low-Stock Warning: {lowStockItems.length} items below reorder threshold
              </h4>
              <p className="text-[11px] text-[#A8988C] mt-0.5">
                {lowStockItems.map((i) => `${i.name} (${i.current_stock} ${i.unit})`).join(', ')}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-[#B35C4A] text-white self-start sm:self-auto">
            Action Needed
          </span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73]">Total Tracked Items</span>
          <div className="text-2xl font-bold text-[#FAF8F5] mt-1">{inventory.length}</div>
          <span className="text-[10px] text-[#7A6B60]">Across all categories</span>
        </div>
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73]">Low Stock Alerts</span>
          <div className="text-2xl font-bold text-[#DF9182] mt-1">{lowStockItems.length}</div>
          <span className="text-[10px] text-[#7A6B60]">Items need restock</span>
        </div>
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73]">Total Stock Value</span>
          <div className="text-2xl font-bold text-[#D4AD85] mt-1">
            {formatCurrency(totalStockValue, currency)}
          </div>
          <span className="text-[10px] text-[#7A6B60]">Current warehouse valuation</span>
        </div>
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73]">Stock Health</span>
          <div className="text-2xl font-bold text-[#9BB89E] mt-1">
            {inventory.length > 0 ? Math.round(((inventory.length - lowStockItems.length) / inventory.length) * 100) : 100}%
          </div>
          <span className="text-[10px] text-[#7A6B60]">Items in adequate supply</span>
        </div>
      </div>

      {/* Inventory Stock Table */}
      <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28201A] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#FAF8F5] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C29B72]" />
              Ingredient & Materials Stock
            </h3>
            <p className="text-xs text-[#8E7E73]">Manage reorder levels and update physical counts</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8E7E73] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ingredient..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] placeholder:text-[#66574D] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#28201A] text-[10px] font-semibold uppercase tracking-wider text-[#7A6B60]">
                <th className="pb-3">Ingredient / Item</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Current Stock</th>
                <th className="pb-3">Min Threshold</th>
                <th className="pb-3">Unit Cost</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#241D17]">
              {filteredInventory.map((item) => {
                const isLow = item.current_stock <= item.min_threshold;
                return (
                  <tr key={item.id} className="hover:bg-[#221A15]/60 transition-colors">
                    <td className="py-3 font-semibold text-[#FAF8F5]">
                      <span className="block">{item.name}</span>
                      <span className="text-[10px] text-[#7A6B60]">Restocked: {item.last_restocked || 'Recent'}</span>
                    </td>
                    <td className="py-3 text-[#8E7E73] font-medium">{item.category}</td>
                    <td className="py-3 font-bold text-[#FAF8F5] text-sm">
                      {item.current_stock} <span className="text-xs font-normal text-[#8E7E73]">{item.unit}</span>
                    </td>
                    <td className="py-3 font-semibold text-[#8E7E73]">
                      {item.min_threshold} {item.unit}
                    </td>
                    <td className="py-3 font-semibold text-[#D4AD85]">
                      {formatCurrency(item.cost_per_unit, currency)} / {item.unit}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isLow
                            ? 'bg-[#B35C4A]/15 text-[#DF9182] border border-[#B35C4A]/25'
                            : 'bg-[#5F7A62]/15 text-[#9BB89E] border border-[#5F7A62]/25'
                        }`}
                      >
                        {isLow ? 'Low Stock' : 'Adequate'}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setRestockItem(item);
                          setRestockQty(10);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#C29B72]/15 hover:bg-[#C29B72] text-[#D4AD85] hover:text-[#14110E] font-semibold text-[10px] border border-[#C29B72]/25 transition-colors"
                      >
                        + Restock
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded-lg hover:bg-[#B35C4A]/20 text-[#7A6B60] hover:text-[#DF9182] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best-Selling & Low-Selling Item Velocity Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best-Sellers */}
        <div className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A] space-y-3">
          <div className="flex items-center justify-between border-b border-[#28201A] pb-3">
            <h4 className="text-xs font-bold uppercase text-[#D4AD85] flex items-center gap-1.5 tracking-wider">
              <Flame className="w-4 h-4 text-[#C29B72]" />
              Best-Selling Velocity Leaders
            </h4>
            <span className="text-[10px] text-[#7A6B60]">Live analytics</span>
          </div>

          <div className="space-y-2 text-xs">
            {menuItems.slice(0, 4).map((m, idx) => (
              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#211A15] border border-[#2E241D]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#C29B72]/15 text-[#D4AD85] flex items-center justify-center font-bold text-[10px]">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-[#FAF8F5]">{m.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#D4AD85] block">{formatCurrency(m.price, currency)}</span>
                  <span className="text-[10px] text-[#9BB89E] font-medium">High Turnover</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low-Sellers / Low-Turnover */}
        <div className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A] space-y-3">
          <div className="flex items-center justify-between border-b border-[#28201A] pb-3">
            <h4 className="text-xs font-bold uppercase text-[#8E7E73] flex items-center gap-1.5 tracking-wider">
              <TrendingDown className="w-4 h-4" />
              Low-Turnover Dishes (Wastage Risk)
            </h4>
            <span className="text-[10px] text-[#7A6B60]">Promotion suggested</span>
          </div>

          <div className="space-y-2 text-xs">
            {menuItems.slice(-3).map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#211A15] border border-[#2E241D]">
                <span className="font-semibold text-[#A8988C]">{m.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2A211B] text-[#8E7E73]">
                  Slow Mover
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Add Stock Item */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 bg-[#14110E]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1713] border border-[#2B221A] rounded-3xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 text-[#EDE7DF]">
            <div className="flex items-center justify-between border-b border-[#28201A] pb-3">
              <h3 className="text-base font-bold text-[#FAF8F5] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C29B72]" />
                Add Stock Item
              </h3>
              <button
                onClick={() => setIsAddItemOpen(false)}
                className="w-7 h-7 rounded-full bg-[#241D17] text-[#8E7E73] hover:text-[#EDE7DF] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Item / Ingredient Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Single Origin Coffee Beans"
                  className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Coffee, Dairy, Bakery..."
                    className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="liters">liters</option>
                    <option value="pieces">pieces</option>
                    <option value="packets">packets</option>
                    <option value="cans">cans</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8E7E73] mb-1">Current Stock</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8E7E73] mb-1">Min Threshold</label>
                  <input
                    type="number"
                    required
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8E7E73] mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-xs transition-colors mt-2 shadow-xs"
              >
                Save Stock Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Restock */}
      {restockItem && (
        <div className="fixed inset-0 z-50 bg-[#14110E]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1713] border border-[#2B221A] rounded-3xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 text-[#EDE7DF]">
            <div className="flex items-center justify-between border-b border-[#28201A] pb-3">
              <h3 className="text-base font-bold text-[#FAF8F5] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#9BB89E]" />
                Restock {restockItem.name}
              </h3>
              <button
                onClick={() => setRestockItem(null)}
                className="w-7 h-7 rounded-full bg-[#241D17] text-[#8E7E73] hover:text-[#EDE7DF] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <p className="text-xs text-[#8E7E73]">
                Current stock: <strong className="text-[#FAF8F5]">{restockItem.current_stock} {restockItem.unit}</strong>
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#8E7E73] mb-1">
                  Add Quantity ({restockItem.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#5F7A62] hover:bg-[#526B55] text-white font-semibold text-xs transition-colors shadow-xs"
              >
                Confirm Restock (+{restockQty} {restockItem.unit})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
