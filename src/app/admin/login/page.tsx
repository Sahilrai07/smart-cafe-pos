'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Coffee,
  Lock,
  Building2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  authenticateCredentials,
  saveUserSession,
  getStoredUser,
} from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to admin dashboard
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
      // 1. Authenticate credentials
      const matched = authenticateCredentials(username, password);

      if (!matched) {
        setError('Invalid Cafe ID or Password. Please verify your credentials and try again.');
        setIsLoading(false);
        return;
      }

      // 2. Set backend cookie
      try {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: username, password }),
        });
      } catch (apiErr) {
        console.warn('API cookie set fallback to client storage:', apiErr);
      }

      // 3. Save local session
      saveUserSession(matched);

      // 4. Redirect to admin dashboard
      setTimeout(() => {
        router.replace('/admin');
      }, 300);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#120F0D] text-[#EDE7DF] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#C29B72]/30 selection:text-[#EDE7DF]">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C29B72]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#B35C4A]/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#201A16] border border-[#3C3026] text-[#C29B72] shadow-xl shadow-black/40 mb-3.5">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#FAF8F5]">
            RestroOS
          </h1>
          <p className="text-xs text-[#9B8C81] mt-1 font-medium">
            Cafe Owner & Management Portal
          </p>
        </div>

        {/* Confidential Credentials Form Card */}
        <div className="bg-[#181411] border border-[#2B231C] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-6">
            <h2 className="text-base font-bold text-[#FAF8F5]">Owner Sign In</h2>
            <p className="text-xs text-[#8C7C70] mt-1">
              Enter your assigned Cafe ID and password to access your isolated store dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#B35C4A]/15 border border-[#B35C4A]/30 text-[#EDE7DF] flex items-start gap-2.5 text-xs animate-in fade-in">
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
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cafe1 or your cafe ID"
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
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#C29B72] to-[#B38758] hover:from-[#B89066] hover:to-[#A77B4D] text-[#14110E] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#C29B72]/20 transition-all cursor-pointer mt-3 disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Tenant Access...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Strict Isolation Assurance */}
          <div className="mt-6 pt-5 border-t border-[#261E18] flex items-center gap-2 text-[11px] text-[#7A6B60]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Strict End-to-End Tenant Isolation & Data Encryption</span>
          </div>

          {/* Discrete Collapsible Testing Help (Zero Competitor Exposure) */}
          <details className="mt-4 pt-3 border-t border-[#221A15] text-[11px] text-[#695B50] group">
            <summary className="cursor-pointer hover:text-[#A89887] transition-colors flex items-center gap-1.5 font-medium list-none">
              <HelpCircle className="w-3.5 h-3.5 text-[#C29B72]/70" />
              <span>Need test credentials? (Click to view)</span>
            </summary>
            <div className="mt-2.5 p-3 rounded-xl bg-[#14100E] border border-[#2B2119] text-[#8A796E] space-y-1">
              <p>• <strong>Cafe 1 ID:</strong> <code className="text-[#D4AD85]">cafe 1</code> | Password: <code className="text-[#D4AD85]">cafe 1</code></p>
              <p>• <strong>Cafe 2 ID:</strong> <code className="text-[#D4AD85]">cafe 2</code> | Password: <code className="text-[#D4AD85]">cafe 2</code></p>
              <p className="text-[10px] text-[#6B5C50] pt-1">
                Each account only logs into its respective store dashboard with no access to foreign cafe records.
              </p>
            </div>
          </details>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-center text-[#615348] mt-6">
          RestroOS • Cloud POS, KDS & Contactless Hospitality
        </p>
      </div>
    </div>
  );
}
