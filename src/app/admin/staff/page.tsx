'use client';

import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { Restaurant, StaffMember, StaffRole } from '@/types';
import {
  ShieldCheck,
  UserCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  X,
  ChefHat,
  CreditCard,
  Crown,
  Utensils,
  Lock,
} from 'lucide-react';

export default function StaffManagementPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('CASHIER');

  const refreshData = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const list = await supabaseService.getStaffMembers(r.id);
        setStaffList(list);
      }
    } catch (e) {
      console.error('Error refreshing staff data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !name.trim()) return;

    await supabaseService.addStaffMember({
      restaurant_id: restaurant.id,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@cafe.demo`,
      phone,
      role,
      active: true,
    });

    setName('');
    setEmail('');
    setPhone('');
    setIsAddStaffOpen(false);
    refreshData();
  };

  const handleToggleStatus = async (id: string) => {
    await supabaseService.toggleStaffStatus(id);
    refreshData();
  };

  const handleDeleteStaff = async (id: string) => {
    if (confirm('Remove this staff account?')) {
      await supabaseService.deleteStaffMember(id);
      refreshData();
    }
  };

  const filteredStaff = staffList.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.role.toLowerCase().includes(q);
    }
    return true;
  });

  const getRoleBadge = (r: StaffRole) => {
    switch (r) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B35C4A]/15 text-[#DF9182] border border-[#B35C4A]/30">
            <Crown className="w-3 h-3" />
            ADMIN
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C29B72]/15 text-[#D4AD85] border border-[#C29B72]/30">
            <ShieldCheck className="w-3 h-3" />
            MANAGER
          </span>
        );
      case 'CASHIER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5F7A62]/15 text-[#9BB89E] border border-[#5F7A62]/30">
            <CreditCard className="w-3 h-3" />
            CASHIER
          </span>
        );
      case 'CHEF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#9E784C]/20 text-[#E0C09B] border border-[#9E784C]/30">
            <ChefHat className="w-3 h-3" />
            CHEF / KDS
          </span>
        );
      case 'WAITER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7A6B5D]/20 text-[#EDE7DF] border border-[#7A6B5D]/30">
            <Utensils className="w-3 h-3" />
            WAITER / FLOOR
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C1713] p-5 rounded-3xl border border-[#2B221A]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C29B72]/15 border border-[#C29B72]/30 flex items-center justify-center text-[#D4AD85]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#EDE7DF] tracking-tight">
              Staff Accounts & Permissions
            </h1>
            <p className="text-xs text-[#A89887]">
              Manage team access for cashier, chef, and table servers • {restaurant?.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddStaffOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#C29B72]/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2B221A] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#EDE7DF]">Active Team Members ({staffList.length})</h3>
            <p className="text-xs text-[#A89887]">Role-based accounts with protected module permissions</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#A89887] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by name/role..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] placeholder:text-[#7A6B5D] focus:outline-hidden focus:border-[#C29B72]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2B221A] text-[10px] font-bold uppercase tracking-wider text-[#A89887]">
                <th className="pb-3">Name & Contact</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Access Level</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B221A]/60">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-[#241D17] transition-colors">
                  <td className="py-3">
                    <span className="font-bold text-[#EDE7DF] block">{staff.name}</span>
                    <span className="text-[10px] text-[#A89887]">{staff.phone || staff.email}</span>
                  </td>
                  <td className="py-3">{getRoleBadge(staff.role)}</td>
                  <td className="py-3 text-[#A89887] font-medium">
                    {staff.role === 'ADMIN'
                      ? 'Full Backoffice Access'
                      : staff.role === 'CHEF'
                      ? 'Kitchen Display (KDS) Only'
                      : staff.role === 'CASHIER'
                      ? 'Counter POS & Billing'
                      : staff.role === 'MANAGER'
                      ? 'Menu, Tables & Orders'
                      : 'Live Orders & Tables'}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleStatus(staff.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                        staff.active
                          ? 'bg-[#5F7A62]/20 text-[#9BB89E] border border-[#5F7A62]/30'
                          : 'bg-[#241D17] text-[#7A6B5D] border border-[#2B221A]'
                      }`}
                    >
                      {staff.active ? 'Active' : 'Suspended'}
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="p-1.5 rounded-lg hover:bg-[#B35C4A]/20 text-[#7A6B5D] hover:text-[#DF9182] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Matrix */}
      <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] p-5 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-[#EDE7DF] flex items-center gap-2 border-b border-[#2B221A] pb-3">
          <Lock className="w-4 h-4 text-[#D4AD85]" />
          Role Permissions Matrix
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#2B221A] text-[10px] font-bold uppercase tracking-wider text-[#A89887]">
                <th className="pb-3">Permission Feature</th>
                <th className="pb-3">Admin</th>
                <th className="pb-3">Manager</th>
                <th className="pb-3">Cashier</th>
                <th className="pb-3">Chef</th>
                <th className="pb-3">Waiter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B221A]/60 text-[#A89887]">
              <tr>
                <td className="py-2.5 font-bold text-[#EDE7DF]">Live Kitchen Display (KDS)</td>
                <td className="text-[#9BB89E] font-semibold">✓ Full</td>
                <td className="text-[#9BB89E] font-semibold">✓ Full</td>
                <td className="text-[#5A4D41]">—</td>
                <td className="text-[#9BB89E] font-bold">✓ Primary</td>
                <td className="text-[#A89887] font-medium">✓ View</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#EDE7DF]">Counter POS & Billing</td>
                <td className="text-[#9BB89E] font-semibold">✓ Full</td>
                <td className="text-[#9BB89E] font-semibold">✓ Full</td>
                <td className="text-[#9BB89E] font-bold">✓ Primary</td>
                <td className="text-[#5A4D41]">—</td>
                <td className="text-[#5A4D41]">—</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#EDE7DF]">Menu & Availability Toggles</td>
                <td className="text-[#9BB89E] font-semibold">✓ Full</td>
                <td className="text-[#9BB89E] font-semibold">✓ Full</td>
                <td className="text-[#5A4D41]">—</td>
                <td className="text-[#D4AD85] font-medium">Toggle Only</td>
                <td className="text-[#5A4D41]">—</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#EDE7DF]">Finance & P&L Statements</td>
                <td className="text-[#9BB89E] font-semibold">✓ Full</td>
                <td className="text-[#5A4D41]">—</td>
                <td className="text-[#5A4D41]">—</td>
                <td className="text-[#5A4D41]">—</td>
                <td className="text-[#5A4D41]">—</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#EDE7DF]">Cafe Settings & Taxes</td>
                <td className="text-[#9BB89E] font-semibold">✓ Full</td>
                <td className="text-[#5A4D41]">—</td>
                <td className="text-[#5A4D41]">—</td>
                <td className="text-[#5A4D41]">—</td>
                <td className="text-[#5A4D41]">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Staff Member */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-[#14110E]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1713] border border-[#2B221A] rounded-3xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2B221A] pb-3">
              <h3 className="text-base font-bold text-[#EDE7DF] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#D4AD85]" />
                Add Staff Member
              </h3>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="w-7 h-7 rounded-full bg-[#241D17] text-[#A89887] hover:text-[#EDE7DF] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#A89887] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sanjay Roy"
                  className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A89887] mb-1">Role Permission *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                >
                  <option value="CASHIER">Cashier (POS & Billing)</option>
                  <option value="CHEF">Chef / Kitchen (KDS Ticket Screen)</option>
                  <option value="WAITER">Waiter (Order taking & Table service)</option>
                  <option value="MANAGER">Manager (Menu, Orders & Inventory)</option>
                  <option value="ADMIN">Admin (Full Access & Finance)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A89887] mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A89887] mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@cafe.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#14110E] border border-[#2B221A] text-xs text-[#EDE7DF] focus:outline-hidden focus:border-[#C29B72]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#C29B72] hover:bg-[#B38A5F] text-[#14110E] font-bold text-xs transition-colors mt-2 cursor-pointer shadow-md shadow-[#C29B72]/20"
              >
                Create Staff Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
