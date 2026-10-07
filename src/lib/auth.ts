'use client';

import { Restaurant } from '@/types';
import { DEMO_RESTAURANTS } from './demoData';

export interface CafeUser {
  id: string; // 'cafe1' | 'cafe2' | 'admin'
  username: string;
  name: string;
  role: 'OWNER' | 'ADMIN';
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
}

export interface CafeAccountConfig {
  aliases: string[];
  passwords: string[];
  user: CafeUser;
}

export const CAFE_ACCOUNTS: CafeAccountConfig[] = [
  {
    aliases: ['cafe1', 'cafe 1', 'quickbite', 'quick-bite', 'cafe-1'],
    passwords: ['cafe1', 'cafe 1', 'quickbite', 'demo1234'],
    user: {
      id: 'cafe1',
      username: 'cafe1',
      name: 'Quick Bite Cafe (Owner)',
      role: 'OWNER',
      restaurantId: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
      restaurantName: 'Quick Bite Cafe',
      restaurantSlug: 'quick-bite',
    },
  },
  {
    aliases: ['cafe2', 'cafe 2', 'urbanbrew', 'urban-brew', 'cafe-2'],
    passwords: ['cafe2', 'cafe 2', 'urbanbrew', 'demo1234'],
    user: {
      id: 'cafe2',
      username: 'cafe2',
      name: 'Urban Brew Co. (Owner)',
      role: 'OWNER',
      restaurantId: 'f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e',
      restaurantName: 'Urban Brew Co.',
      restaurantSlug: 'urban-brew',
    },
  },
  {
    aliases: ['admin', 'superadmin', 'platform'],
    passwords: ['admin', 'admin123', 'admin@123'],
    user: {
      id: 'admin',
      username: 'admin',
      name: 'Platform Super Administrator',
      role: 'ADMIN',
      restaurantId: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
      restaurantName: 'All Outlets (Super Admin)',
      restaurantSlug: 'all',
    },
  },
];

const AUTH_STORAGE_KEY = 'restro_active_user_session';
const COOKIE_NAME = 'restro_session';

function normalize(str: string): string {
  return str.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

export function authenticateCredentials(idInput: string, passwordInput: string): CafeUser | null {
  const cleanId = normalize(idInput);
  const cleanPass = passwordInput.trim();

  for (const acc of CAFE_ACCOUNTS) {
    const isIdMatch = acc.aliases.some((alias) => normalize(alias) === cleanId);
    if (!isIdMatch) continue;

    const isPassMatch = acc.passwords.some(
      (p) => p.trim() === cleanPass || normalize(p) === normalize(cleanPass)
    );

    if (isPassMatch) {
      return acc.user;
    }
  }

  return null;
}

export function getStoredUser(): CafeUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as CafeUser;
    }

    // Fallback: check cookie
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [name, val] = c.trim().split('=');
      if (name === COOKIE_NAME && val) {
        return JSON.parse(decodeURIComponent(val)) as CafeUser;
      }
    }
  } catch (e) {
    console.warn('Error reading stored user session:', e);
  }

  return null;
}

export function saveUserSession(user: CafeUser): void {
  if (typeof window === 'undefined') return;

  try {
    const payload = JSON.stringify(user);
    localStorage.setItem(AUTH_STORAGE_KEY, payload);

    // Also persist for CafeStore active restaurant
    localStorage.setItem('qb_active_restaurant', user.restaurantId);

    // Set cookie for Next.js SSR / API routes (30 days)
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(payload)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch (e) {
    console.error('Error saving user session:', e);
  }
}

export function clearUserSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch (e) {
    console.error('Error clearing user session:', e);
  }
}

export function isAuthorizedForRestaurant(user: CafeUser | null, targetRestaurantId: string): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return user.restaurantId === targetRestaurantId;
}
