'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { Restaurant, ServiceRequest } from '@/types';
import {
  Bell,
  LayoutDashboard,
  UtensilsCrossed,
  Receipt,
  Users,
  Cake,
  PartyPopper,
  BookOpen,
  QrCode,
  Tag,
  Settings,
  ExternalLink,
  ChevronDown,
  Building2,
  Building,
  Menu,
  X,
  ChefHat,
  CreditCard,
  Coins,
  Boxes,
  TrendingUp,
  ShieldCheck,
  Crown,
  Coffee,
} from 'lucide-react';

interface NavLinkItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
  highlight?: boolean;
  special?: boolean;
}

interface NavSection {
  title: string;
  links: NavLinkItem[];
}

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState('');
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [upcomingBdayCount, setUpcomingBdayCount] = useState(0);
  const [pendingServiceRequests, setPendingServiceRequests] = useState<ServiceRequest[]>([]);

  const refreshData = async () => {
    try {
      const all = await supabaseService.getAllRestaurants();
      setRestaurants(all);
      const activeId = cafeStore.getActiveRestaurantId();
      setActiveRestaurantId(activeId);
      const curr = all.find((r) => r.id === activeId) || all[0];
      setActiveRestaurant(curr || null);

      if (curr) {
        const [orders, bdays, srvReqs] = await Promise.all([
          supabaseService.getOrders(curr.id),
          supabaseService.getUpcomingBirthdays(curr.id, 7),
          supabaseService.getServiceRequests(curr.id),
        ]);
        const newOrders = orders.filter((o) => o.status === 'NEW');
        setNewOrderCount(newOrders.length);
        setUpcomingBdayCount(bdays.length);
        setPendingServiceRequests(srvReqs.filter((r) => r.status === 'PENDING'));
      }
    } catch (e) {
      console.error('Error refreshing sidebar data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleRestaurantSwitch = (id: string) => {
    cafeStore.setActiveRestaurantId(id);
    refreshData();
  };

  const navSections: NavSection[] = [
    {
      title: 'Operations',
      links: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Live Orders', href: '/admin/orders', icon: UtensilsCrossed, badge: newOrderCount, badgeColor: 'bg-[#B35C4A]' },
        { name: 'Kitchen KDS', href: '/admin/kitchen', icon: ChefHat },
        { name: 'Counter POS', href: '/admin/pos', icon: CreditCard, highlight: true },
        { name: 'Bills & Receipts', href: '/admin/bills', icon: Receipt },
      ],
    },
    {
      title: 'Guest Experience',
      links: [
        { name: 'Customer Database', href: '/admin/customers', icon: Users },
        { name: 'Loyalty & Rewards', href: '/admin/loyalty', icon: Coins },
        { name: 'Birthday Club', href: '/admin/birthday-club', icon: Cake, badge: upcomingBdayCount, badgeColor: 'bg-[#C29B72]' },
        { name: 'Event Bookings', href: '/admin/birthday-bookings', icon: PartyPopper },
        { name: 'Special Offers', href: '/admin/offers', icon: Tag },
      ],
    },
    {
      title: 'Cafe Management',
      links: [
        { name: 'Menu Catalog', href: '/admin/menu', icon: BookOpen },
        {
          name: 'Tables & QR Codes',
          href: '/admin/tables',
          icon: QrCode,
          badge: pendingServiceRequests.length > 0 ? pendingServiceRequests.length : undefined,
          badgeColor: 'bg-[#C29B72]',
        },
        { name: 'Inventory & Stock', href: '/admin/inventory', icon: Boxes },
        { name: 'Finance & P&L', href: '/admin/finance', icon: TrendingUp },
        { name: 'Staff & Roles', href: '/admin/staff', icon: ShieldCheck },
        { name: 'Cafe Outlets', href: '/admin/branches', icon: Building },
        { name: 'Store Settings', href: '/admin/settings', icon: Settings },
      ],
    },
    {
      title: 'Platform SaaS',
      links: [
        { name: 'Multi-Cafe Platform', href: '/admin/saas', icon: Crown, special: true },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#181411] text-[#EDE7DF] border-b border-[#28211B] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#28211B] border border-[#382E25] flex items-center justify-center text-[#C29B72]">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold leading-tight text-[#EDE7DF]">{activeRestaurant?.name || 'Cafe Admin'}</h1>
            <p className="text-[10px] text-[#8C7C70]">Management Suite</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl bg-[#221B17] text-[#A4968B] hover:text-[#EDE7DF] border border-[#30261F]"
        >
          {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar Overlay on Mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[#0E0C0A]/70 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#181411] text-[#EDE7DF] border-r border-[#28211B] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#28211B]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-2xl bg-[#261E19] border border-[#3C3026] flex items-center justify-center text-[#C29B72] shadow-sm">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#EDE7DF] tracking-wide leading-tight">
                RESTRO OS
              </h2>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#C29B72]/15 text-[#D4AD85] border border-[#C29B72]/25 mt-0.5">
                Modern Hospitality
              </span>
            </div>
          </div>

          {/* Restaurant Switcher */}
          <div>
            <label className="block text-[9px] font-semibold uppercase tracking-wider text-[#8A796D] mb-1">
              Active Outlet
            </label>
            <div className="relative">
              <select
                value={activeRestaurantId}
                onChange={(e) => handleRestaurantSwitch(e.target.value)}
                className="w-full appearance-none bg-[#201A16] border border-[#322820] text-[#EDE7DF] rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-hidden focus:border-[#C29B72] cursor-pointer transition-colors"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#201A16] text-[#EDE7DF]">
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8A796D] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Pending Service Requests Alert */}
        {pendingServiceRequests.length > 0 && (
          <div className="mx-2.5 my-2 p-2.5 rounded-2xl bg-[#2E2016] border border-[#C29B72]/40 text-[#EDE7DF] space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-[#D4AD85]">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                Table Service ({pendingServiceRequests.length})
              </span>
            </div>
            {pendingServiceRequests.slice(0, 2).map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-2 rounded-xl bg-[#1C1713] text-[11px] border border-[#3D2D20]"
              >
                <div>
                  <span className="font-bold text-[#FAF8F5]">T-{req.table_number}:</span>{' '}
                  <span className="text-[#C29B72]">{req.type.replace('_', ' ')}</span>
                </div>
                <button
                  onClick={async () => {
                    await supabaseService.resolveServiceRequest(req.id);
                    refreshData();
                  }}
                  className="px-2 py-0.5 rounded-md bg-[#5F7A62]/30 text-[#9BB89E] hover:bg-[#5F7A62] hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-4 text-xs scrollbar-none">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              <div className="px-3 text-[9px] font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                {section.title}
              </div>
              {section.links.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#C29B72] text-[#14110E] font-bold shadow-sm'
                        : item.special
                        ? 'text-[#D4AD85] hover:text-[#EDE7DF] bg-[#C29B72]/10 hover:bg-[#C29B72]/15 border border-[#C29B72]/20'
                        : item.highlight
                        ? 'text-[#9BB89E] hover:text-[#EDE7DF] bg-[#5F7A62]/10 hover:bg-[#5F7A62]/15 border border-[#5F7A62]/20'
                        : 'text-[#9B8C81] hover:text-[#EDE7DF] hover:bg-[#221B17]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isActive
                            ? 'text-[#14110E]'
                            : item.special
                            ? 'text-[#D4AD85]'
                            : item.highlight
                            ? 'text-[#9BB89E]'
                            : 'text-[#8A796D]'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                          item.badgeColor || 'bg-[#B35C4A]'
                        } text-white`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-[#28211B] bg-[#16120F] space-y-2">
          {activeRestaurant && (
            <a
              href={`/r/${activeRestaurant.slug}/t/01`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-[#201A16] hover:bg-[#28201B] text-[#C29B72] border border-[#322820] text-xs font-semibold transition-colors"
            >
              <span>View Table 01 Menu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <div className="text-[10px] text-center text-[#75665B]">
            RestroOS • Hospitality Tech
          </div>
        </div>
      </aside>
    </>
  );
};
