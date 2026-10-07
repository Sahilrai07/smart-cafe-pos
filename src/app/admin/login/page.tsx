'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Coffee,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Building2,
  CheckCircle2,
  Crown,
} from 'lucide-react';
import {
  authenticateCredentials,
  saveUserSession,
  getStoredUser,
  CafeUser,
  CAFE_ACCOUNTS,
} from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('cafe 1');
  const [password, setPassword] = useState('cafe 1');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cafe1' | 'cafe2' | 'admin'>('cafe1');

  useEffect(() => {
    // If already logged in, redirect to admin
    const existing = getStoredUser();
    if (existing) {
      router.replace('/admin');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Authenticate locally / through client auth
      const matched = authenticateCredentials(username, password);

      if (!matched) {
        setError('Invalid Cafe ID or Password. Try "cafe 1" / "cafe 1" or "cafe 2" / "cafe 2".');
        setIsLoading(false);
        return;
      }

      // 2. Also call backend route handler to set server-side cookie
      try {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: username, password }),
        });
      } catch (apiErr) {
        console.warn('API cookie set fallback to client storage:', apiErr);
      }

      // 3. Save local session & sync store active restaurant
      saveUserSession(matched);

      // 4. Redirect to admin dashboard
      setTimeout(() => {
        router.replace('/admin');
      }, 300);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check credentials.');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (type: 'cafe1' | 'cafe2' | 'admin') => {
    setError(null);
    setIsLoading(true);

    let targetId = 'cafe 1';
    let targetPass = 'cafe 1';

    if (type === 'cafe2') {
      targetId = 'cafe 2';
      targetPass = 'cafe 2';
    } else if (type === 'admin') {
      targetId = 'admin';
      targetPass = 'admin';
    }

    setUsername(targetId);
    setPassword(targetPass);

    const user = authenticateCredentials(targetId, targetPass);
    if (user) {
      // Set backend cookie
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetId, password: targetPass }),
      }).catch(() => {});

      saveUserSession(user);
      setTimeout(() => {
        router.replace('/admin');
      }, 350);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#120F0D] text-[#EDE7DF] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#C29B72]/30 selection:text-[#EDE7DF]">
      {/* Background Decorative Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C29B72]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#B35C4A]/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#201A16] border border-[#3C3026] text-[#C29B72] shadow-xl shadow-black/40 mb-3.5">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#FAF8F5]">
            RestroOS
          </h1>
          <p className="text-xs text-[#9B8C81] mt-1 font-medium">
            Multi-Tenant Cafe Owner & POS Portal
          </p>
        </div>

        {/* Quick Demo Switcher Card */}
        <div className="bg-[#181411] border border-[#2B231C] rounded-3xl p-5 shadow-2xl backdrop-blur-md mb-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#A4968B] pb-1">
            <span className="flex items-center gap-1.5 text-[#C29B72]">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Fast Login for Testing:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Cafe 1 Quick Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('cafe1')}
              className="p-3 rounded-2xl bg-[#221B17] hover:bg-[#2C231E] border border-[#3A2E25] hover:border-[#C29B72]/50 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-[#C29B72] uppercase tracking-wider">
                  Cafe 1
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-[#FAF8F5] truncate">Quick Bite Cafe</p>
              <p className="text-[10px] text-[#8C7C70] mt-0.5 font-mono">id: cafe 1</p>
            </button>

            {/* Cafe 2 Quick Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('cafe2')}
              className="p-3 rounded-2xl bg-[#221B17] hover:bg-[#2C231E] border border-[#3A2E25] hover:border-[#C29B72]/50 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-[#D4AD85] uppercase tracking-wider">
                  Cafe 2
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-400" />
              </div>
              <p className="text-xs font-bold text-[#FAF8F5] truncate">Urban Brew Co.</p>
              <p className="text-[10px] text-[#8C7C70] mt-0.5 font-mono">id: cafe 2</p>
            </button>
          </div>

          {/* Super Admin option */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickLogin('admin')}
            className="w-full py-2 px-3 rounded-xl bg-[#201A16]/60 hover:bg-[#201A16] border border-[#30261F] text-[11px] font-semibold text-[#8C7C70] hover:text-[#EDE7DF] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Login as Super Admin (Platform Manager)</span>
          </button>
        </div>

        {/* Credentials Form Card */}
        <div className="bg-[#181411] border border-[#2B231C] rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-bold text-[#EDE7DF] mb-4">
            <User className="w-4 h-4 text-[#C29B72]" />
            <span>Or Enter Owner Credentials</span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-[#B35C4A]/15 border border-[#B35C4A]/30 text-[#EDE7DF] flex items-start gap-2.5 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#B35C4A] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9B8C81] mb-1.5">
                Cafe ID / Username
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#75665B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cafe 1 or cafe 2"
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#201A16] border border-[#322820] text-sm text-[#FAF8F5] placeholder-[#66584E] focus:outline-hidden focus:border-[#C29B72] focus:ring-1 focus:ring-[#C29B72] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9B8C81] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#75665B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#201A16] border border-[#322820] text-sm text-[#FAF8F5] placeholder-[#66584E] focus:outline-hidden focus:border-[#C29B72] focus:ring-1 focus:ring-[#C29B72] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#C29B72] to-[#B38758] hover:from-[#B89066] hover:to-[#A77B4D] text-[#14110E] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#C29B72]/20 transition-all cursor-pointer mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Tenant Access...' : 'Sign In to Cafe Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Strict Isolation Security Notice */}
          <div className="mt-5 pt-4 border-t border-[#261E18] flex items-start gap-2.5 text-[11px] text-[#7A6B60] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Strict Multi-Tenant Isolation:</strong> Cafe 1 owners are isolated exclusively to Quick Bite Cafe. Cafe 2 owners are isolated exclusively to Urban Brew Co.
            </span>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-center text-[#615348] mt-6">
          RestroOS • Cloud POS, KDS & Birthday Engine
        </p>
      </div>
    </div>
  );
}
