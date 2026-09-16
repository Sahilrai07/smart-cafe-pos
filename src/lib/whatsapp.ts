import { cleanPhoneNumber, formatCurrency } from './utils';
import { Bill, OrderItem, Restaurant, RestaurantSettings } from '@/types';

/**
 * Generates an itemized string with food emojis for WhatsApp receipt
 */
export function formatOrderItemsForWhatsApp(items: OrderItem[], currency = '₹'): string {
  return items
    .map((item) => {
      const emoji = getItemEmoji(item.item_name_snapshot);
      return `${emoji} ${item.item_name_snapshot} × ${item.quantity} — ${formatCurrency(item.total, currency)}`;
    })
    .join('\n');
}

function getItemEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('burger')) return '🍔';
  if (lower.includes('pizza')) return '🍕';
  if (lower.includes('fries')) return '🍟';
  if (lower.includes('coke') || lower.includes('beverage') || lower.includes('soda') || lower.includes('drink')) return '🥤';
  if (lower.includes('coffee') || lower.includes('latte') || lower.includes('cappuccino')) return '☕';
  if (lower.includes('shake')) return '🥤';
  if (lower.includes('cake') || lower.includes('dessert') || lower.includes('sweet') || lower.includes('lava')) return '🍰';
  if (lower.includes('sandwich')) return '🥪';
  if (lower.includes('nachos') || lower.includes('snack')) return '🧀';
  if (lower.includes('taco')) return '🌮';
  return '🍽️';
}

/**
 * Builds the WhatsApp Click-to-Chat URL for Bill Receipts
 */
export function buildBillWhatsAppUrl(params: {
  bill: Bill;
  restaurant: Restaurant;
  settings: RestaurantSettings;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  appBaseUrl?: string;
}): string {
  const { bill, restaurant, settings, customerName, customerPhone, items, appBaseUrl } = params;
  const currency = settings.currency || '₹';
  const cleanPhone = cleanPhoneNumber(customerPhone);
  const itemsText = formatOrderItemsForWhatsApp(items, currency);
  const baseUrl = appBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://quick-bite-demo.vercel.app');
  const birthdayClubLink = `${baseUrl}/r/${restaurant.slug}/birthday-club?phone=${encodeURIComponent(customerPhone)}&name=${encodeURIComponent(customerName)}`;

  let template = settings.bill_message_template || 
`Hey {customer_name} 👋

Thanks for visiting *{restaurant_name}*!

🧾 *Your Bill (#{bill_number}):*
{items_list}

Subtotal: {currency}{subtotal}
GST ({tax_percentage}%): {currency}{tax}
*Total: {currency}{total}*

Thank you for visiting! ❤️
We hope to see you again soon.

🎂 Join our Birthday Club for a surprise gift: {birthday_club_link}`;

  const message = template
    .replace(/{customer_name}/g, customerName)
    .replace(/{restaurant_name}/g, restaurant.name)
    .replace(/{bill_number}/g, bill.bill_number)
    .replace(/{table_number}/g, bill.table_number_snapshot || 'Takeaway')
    .replace(/{items_list}/g, itemsText)
    .replace(/{currency}/g, currency)
    .replace(/{subtotal}/g, bill.subtotal.toFixed(2))
    .replace(/{tax_percentage}/g, settings.tax_percentage.toString())
    .replace(/{tax}/g, bill.tax.toFixed(2))
    .replace(/{total}/g, bill.total.toFixed(2))
    .replace(/{birthday_club_link}/g, birthdayClubLink);

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds the WhatsApp Click-to-Chat URL for Birthday Club Greetings & Offers
 */
export function buildBirthdayWhatsAppUrl(params: {
  customerName: string;
  customerPhone: string;
  daysRemaining: number;
  restaurant: Restaurant;
  settings: RestaurantSettings;
}): string {
  const { customerName, customerPhone, daysRemaining, restaurant, settings } = params;
  const cleanPhone = cleanPhoneNumber(customerPhone);
  const offer = settings.birthday_offer_text || 'Complimentary treat on your birthday order!';

  let template = settings.birthday_message_template ||
`Hey {customer_name}! 🎉🎂

Your birthday is coming up in {days_before} days!

We would love to celebrate with you at *{restaurant_name}*. ❤️

🎁 *Your Birthday Gift:* {birthday_offer}

Show this message when you visit us to claim your special surprise! 🥳`;

  const message = template
    .replace(/{customer_name}/g, customerName)
    .replace(/{days_before}/g, daysRemaining.toString())
    .replace(/{restaurant_name}/g, restaurant.name)
    .replace(/{birthday_offer}/g, offer);

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a generic promo / campaign WhatsApp Click-to-Chat URL
 */
export function buildPromoWhatsAppUrl(params: {
  customerName: string;
  customerPhone: string;
  messageText: string;
  restaurant: Restaurant;
}): string {
  const { customerName, customerPhone, messageText, restaurant } = params;
  const cleanPhone = cleanPhoneNumber(customerPhone);
  const message = messageText
    .replace(/{customer_name}/g, customerName)
    .replace(/{restaurant_name}/g, restaurant.name);

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
