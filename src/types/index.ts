// TypeScript definitions for Multi-Tenant Cafe SaaS

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type BookingStatus = 'NEW' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type TargetAudience = 'ALL' | 'NEW' | 'REPEAT' | 'INACTIVE_30' | 'INACTIVE_60' | 'BIRTHDAY_CLUB';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  phone: string;
  whatsapp_number: string;
  email?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RestaurantSettings {
  id?: string;
  restaurant_id: string;
  currency: string;
  tax_enabled: boolean;
  tax_percentage: number;
  bill_message_template: string;
  birthday_message_template: string;
  birthday_offer_text: string;
  birthday_days_before: number;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  qr_slug: string;
  active: boolean;
  created_at?: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  display_order: number;
  active: boolean;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id?: string | null;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  available: boolean;
  is_veg: boolean;
  display_order?: number;
  created_at?: string;
}

export interface Customer {
  id: string;
  restaurant_id: string;
  name: string;
  phone: string;
  email?: string | null;
  birthday?: string | null; // YYYY-MM-DD
  marketing_opt_in: boolean;
  birthday_club_member: boolean;
  total_visits: number;
  total_spent: number;
  last_visit?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id?: string | null;
  item_name_snapshot: string;
  quantity: number;
  unit_price_snapshot: number;
  total: number;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id?: string | null;
  table_number_snapshot?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  order_number: number;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  special_instructions?: string | null;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface Bill {
  id: string;
  restaurant_id: string;
  order_id?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  bill_number: string;
  table_number_snapshot?: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  items_snapshot?: OrderItem[];
  generated_at: string;
  whatsapp_sent_at?: string | null;
  created_at?: string;
}

export interface BirthdayClubMember {
  id: string;
  restaurant_id: string;
  customer_id: string;
  birthday: string;
  joined_at: string;
  consent: boolean;
  active: boolean;
}

export interface BirthdayBooking {
  id: string;
  restaurant_id: string;
  customer_id?: string | null;
  customer_name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  package: 'Basic' | 'Premium' | 'Custom';
  special_request?: string | null;
  status: BookingStatus;
  created_at?: string;
}

export interface Offer {
  id: string;
  restaurant_id: string;
  title: string;
  message: string;
  start_date: string;
  end_date?: string | null;
  target_audience: TargetAudience;
  active: boolean;
  created_at?: string;
}

export interface UpcomingBirthday {
  customer_id: string;
  name: string;
  phone: string;
  email?: string | null;
  birthday: string;
  days_until: number;
  birthday_this_year: string;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
}
