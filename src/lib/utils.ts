import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, symbol = '₹'): string {
  return `${symbol}${amount.toFixed(2).replace(/\.00$/, '')}`;
}

export function cleanPhoneNumber(phone: string): string {
  // Strip spaces, dashes, parentheses
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Default to +91 if Indian 10-digit number without country code
  if (/^\d{10}$/.test(cleaned)) {
    return `91${cleaned}`;
  }
  return cleaned.replace(/^\+/, '');
}
