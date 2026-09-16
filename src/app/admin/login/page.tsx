'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Utensils, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@quickbitecafe.demo');
  const [password, setPassword] = useState('demo1234');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/admin/orders');
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/admin/orders');
    }, 250);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-lg shadow-amber-500/20">
            ☕
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Cafe SaaS Admin Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to manage orders, bills, customer database & Birthday Club
          </p>
        </div>

        {/* 1-Click Demo Fill for Pitching */}
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          className="w-full mb-6 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>1-Click Demo Sign-in (Quick Bite Cafe)</span>
        </button>

        <div className="relative flex py-2 items-center mb-5">
          <div className="grow border-t border-slate-800" />
          <span className="shrink mx-3 text-[10px] uppercase font-bold text-slate-500">
            Or credentials
          </span>
          <div className="grow border-t border-slate-800" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Staff Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@quickbitecafe.demo"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all mt-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In as Staff'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-500 mt-6">
          Multi-tenant cafe platform • Supabase Auth + Free Tier
        </p>
      </div>
    </div>
  );
}
