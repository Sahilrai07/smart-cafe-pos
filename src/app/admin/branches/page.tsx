'use client';

import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { Restaurant, CafeBranch } from '@/types';
import {
  Building2,
  Building,
  Plus,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  ExternalLink,
  X,
  Store,
} from 'lucide-react';

export default function BranchesPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [branches, setBranches] = useState<CafeBranch[]>([]);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);

  // Form state
  const [branchName, setBranchName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [tablesCount, setTablesCount] = useState(8);

  const refreshData = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const list = await supabaseService.getBranches(r.id);
        setBranches(list);
      }
    } catch (e) {
      console.error('Error refreshing branches:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !branchName.trim()) return;

    await supabaseService.addBranch({
      restaurant_id: restaurant.id,
      branch_name: branchName,
      address,
      phone,
      manager_name: managerName,
      tables_count: tablesCount,
      active: true,
    });

    setBranchName('');
    setAddress('');
    setPhone('');
    setManagerName('');
    setTablesCount(8);
    setIsAddBranchOpen(false);
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C1713] p-5 rounded-3xl border border-[#2B221A]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C29B72]/15 border border-[#C29B72]/30 flex items-center justify-center text-[#D4AD85]">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#EDE7DF] tracking-tight">
              Multi-Branch Outlets
            </h1>
            <p className="text-xs text-[#A89887]">
              Manage multiple cafe branches, physical locations, and seating capacities • {restaurant?.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddBranchOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#C29B72]/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Outlet</span>
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="p-5 rounded-3xl bg-[#1C1713] border border-[#2B221A] space-y-4 hover:border-[#C29B72]/40 transition-colors shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#241D17] border border-[#2B221A] flex items-center justify-center text-[#D4AD85] font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EDE7DF]">{branch.branch_name}</h3>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#9BB89E]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5F7A62]" />
                    Operational Outlet
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#241D17] border border-[#2B221A] text-[#EDE7DF]">
                {branch.tables_count} Tables
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-[#A89887] pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#7A6B5D] shrink-0" />
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#7A6B5D] shrink-0" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#7A6B5D] shrink-0" />
                <span>Branch Manager: <strong className="text-[#EDE7DF]">{branch.manager_name}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2B221A] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#7A6B5D] font-medium">QR Tables Configured</span>
              <a
                href={`/r/${restaurant?.slug}/t/01`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C29B72] hover:text-[#D4AD85] font-bold flex items-center gap-1 text-xs"
              >
                <span>View Outlet QR Menu</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Branch */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 z-50 bg-[#14110E]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1713] border border-[#2B221A] rounded-3xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2B221A] pb-3">
              <h3 className="text-base font-bold text-[#EDE7DF] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#D4AD85]" />
                Add Outlet Branch
              </h3>
              <button
                onClick={() => setIsAddBranchOpen(false)}
                className="w-7 h-7 rounded-full bg-[#241D17] text-[#A89887] hover:text-[#EDE7DF] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#A89887] mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Airport Kiosk / Boulevard Outlet"
                  className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89887] mb-1">Physical Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop No, Boulevard, Sector..."
                  className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A89887] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A89887] mb-1">Tables Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={tablesCount}
                    onChange={(e) => setTablesCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89887] mb-1">Branch Manager Name</label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="e.g. Vikram Mehta"
                  className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs transition-colors mt-2 cursor-pointer shadow-md shadow-[#C29B72]/20"
              >
                Create Branch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
