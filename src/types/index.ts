// TypeScript definitions for Multi-Tenant Cafe SaaS

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type BookingStatus = 'NEW' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type TargetAudience = 'ALL' | 'NEW' | 'REPEAT' | 'INACTIVE_30' | 'INACTIVE_60' | 'BIRTHDAY_CLUB';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'SPLIT' | 'UNPAID';
export type PaymentStatus = 'PENDING' | 'PAID';
export type OrderType = 'DINE_IN' | 'PICKUP' | 'TAKEAWAY';
export type StaffRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'CHEF' | 'WAITER';
export type ExpenseCategory = 'RENT' | 'SALARY' | 'INGREDIENTS' | 'UTILITIES' | 'MARKETING' | 'MAINTENANCE' | 'OTHER';
export type SubscriptionPlanId = 'STARTER_500' | 'GROWTH_1000' | 'PRO_1500';
export type SubscriptionStatus = 'ACTIVE' | 'RENEWAL_DUE' | 'EXPIRED' | 'TRIAL';

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
  opening_time?: string;
  closing_time?: string;
  auto_accept_orders?: boolean;
  default_prep_time_minutes?: number;
  coins_earn_rate_percent?: number; // e.g. 10 (1 coin per ₹10 spent)
  coin_value_in_currency?: number; // 1 coin = ₹1
  upi_id?: string;
  enable_self_pickup?: boolean;
  enable_table_ordering?: boolean;
  subscription_plan?: SubscriptionPlanId;
  google_review_url?: string;
  enable_geofence?: boolean;
  latitude?: number;
  longitude?: number;
  geofence_radius_meters?: number;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  qr_slug: string;
  active: boolean;
  capacity?: number;
  section?: string;
  created_at?: string;
  status?: 'VACANT' | 'OCCUPIED' | 'BILL_PENDING';
  seated_at?: string;
  last_order_at?: string;
  active_session_token?: string;
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
  paired_item_ids?: string[];
  created_at?: string;
}

export type ServiceRequestType = 'WATER' | 'CUTLERY' | 'CLEAN_TABLE' | 'CALL_WAITER';

export interface ServiceRequest {
  id: string;
  restaurant_id: string;
  table_number: string;
  type: ServiceRequestType;
  status: 'PENDING' | 'RESOLVED';
  created_at: string;
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
  loyalty_coins?: number;
  loyalty_tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  total_coins_earned?: number;
  total_coins_redeemed?: number;
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
  notes?: string;
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
  order_type?: OrderType;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  special_instructions?: string | null;
  prep_time_minutes?: number;
  estimated_ready_at?: string;
  pickup_token?: string;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
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
  payment_method?: PaymentMethod;
  order_type?: OrderType;
  coins_earned?: number;
  coins_redeemed?: number;
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
  discount_percent?: number;
  coupon_code?: string;
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
  notes?: string;
}

// 6. Loyalty & Rewards
export interface LoyaltyReward {
  id: string;
  restaurant_id: string;
  title: string;
  description: string;
  coin_cost: number;
  discount_amount?: number;
  free_item_name?: string;
  active: boolean;
}

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  restaurant_id: string;
  type: 'EARN' | 'REDEEM';
  coins: number;
  description: string;
  created_at: string;
}

// 7. Staff & Multi-Branch
export interface StaffMember {
  id: string;
  restaurant_id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  active: boolean;
  created_at: string;
}

export interface CafeBranch {
  id: string;
  restaurant_id: string;
  branch_name: string;
  address: string;
  phone: string;
  manager_name: string;
  tables_count: number;
  active: boolean;
  created_at: string;
}

// 8. Finance & Business Analytics
export interface Expense {
  id: string;
  restaurant_id: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  date: string;
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'UPI';
  notes?: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  restaurant_id: string;
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  min_threshold: number;
  cost_per_unit: number;
  last_restocked?: string;
}

// 9. SaaS Subscription Management
export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price_per_month: number;
  features: string[];
  max_tables: number;
  multi_branch: boolean;
  popular?: boolean;
}

export interface CafeSubscription {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  plan_id: SubscriptionPlanId;
  plan_name: string;
  price_per_month: number;
  status: SubscriptionStatus;
  billing_cycle: 'MONTHLY' | 'ANNUAL';
  start_date: string;
  renewal_date: string;
  last_payment_date: string;
  last_payment_amount: number;
  payment_method: string;
}

