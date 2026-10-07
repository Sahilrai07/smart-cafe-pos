'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getStoredUser, CafeUser } from '@/lib/auth';
import { Coffee, Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CafeUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsCheckingAuth(false);
      return;
    }

    const user = getStoredUser();
    if (!user) {
      router.replace('/admin/login');
    } else {
      setCurrentUser(user);
      setIsCheckingAuth(false);
    }
  }, [pathname, isLoginPage, router]);

  // If on /admin/login, render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // During auth check, show clean loader
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#14110E] text-[#EDE7DF] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#221B17] border border-[#322820] flex items-center justify-center text-[#C29B72] shadow-xl">
          <Coffee className="w-6 h-6 animate-pulse" />
        </div>
        <p className="text-xs text-[#8C7C70] font-medium tracking-wide">
          Verifying Cafe Session...
        </p>
      </div>
    );
  }

  // If not logged in, wait for router redirect
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#14110E] text-[#EDE7DF] flex flex-col lg:flex-row antialiased selection:bg-[#C29B72]/30 selection:text-[#EDE7DF]">
      <AdminSidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
