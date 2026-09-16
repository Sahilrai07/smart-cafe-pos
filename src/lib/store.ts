'use client';

import {
  Restaurant,
  RestaurantSettings,
  Table,
  MenuCategory,
  MenuItem,
  Customer,
  Order,
  OrderItem,
  Bill,
  BirthdayBooking,
  Offer,
  UpcomingBirthday,
  OrderStatus,
} from '@/types';
import {
  DEMO_RESTAURANTS,
  DEMO_SETTINGS,
  DEMO_TABLES,
  DEMO_CATEGORIES,
  DEMO_MENU_ITEMS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_BOOKINGS,
  INITIAL_OFFERS,
} from './demoData';
import { getSupabaseClient, isSupabaseConfigured } from './supabase/client';
import { filterUpcomingBirthdays } from './birthday';

// Event listener mechanism for local real-time reactivity
type Listener = () => void;
const listeners = new Set<Listener>();
function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Error in store listener:', e);
    }
  });
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// In-Memory state fallback initialized from demo data or localStorage
class CafeStore {
  private restaurants: Restaurant[] = DEMO_RESTAURANTS;
  private settings: Record<string, RestaurantSettings> = DEMO_SETTINGS;
  private tables: Table[] = DEMO_TABLES;
  private categories: MenuCategory[] = DEMO_CATEGORIES;
  private menuItems: MenuItem[] = DEMO_MENU_ITEMS;
  private customers: Customer[] = INITIAL_CUSTOMERS;
  private orders: Order[] = INITIAL_ORDERS;
  private bills: Bill[] = [];
  private bookings: BirthdayBooking[] = INITIAL_BOOKINGS;
  private offers: Offer[] = INITIAL_OFFERS;
  private activeRestaurantId = DEMO_RESTAURANTS[0].id;
  private orderCounter = 1042;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage() {
    try {
      const savedOrders = localStorage.getItem('qb_orders');
      if (savedOrders) this.orders = JSON.parse(savedOrders);

      const savedCustomers = localStorage.getItem('qb_customers');
      if (savedCustomers) this.customers = JSON.parse(savedCustomers);

      const savedBills = localStorage.getItem('qb_bills');
      if (savedBills) this.bills = JSON.parse(savedBills);

      const savedBookings = localStorage.getItem('qb_bookings');
      if (savedBookings) this.bookings = JSON.parse(savedBookings);

      const savedActiveRest = localStorage.getItem('qb_active_restaurant');
      if (savedActiveRest) this.activeRestaurantId = savedActiveRest;

      const savedCounter = localStorage.getItem('qb_order_counter');
      if (savedCounter) this.orderCounter = parseInt(savedCounter, 10);
    } catch (e) {
      console.warn('Could not load from localStorage:', e);
    }
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('qb_orders', JSON.stringify(this.orders));
      localStorage.setItem('qb_customers', JSON.stringify(this.customers));
      localStorage.setItem('qb_bills', JSON.stringify(this.bills));
      localStorage.setItem('qb_bookings', JSON.stringify(this.bookings));
      localStorage.setItem('qb_active_restaurant', this.activeRestaurantId);
      localStorage.setItem('qb_order_counter', this.orderCounter.toString());
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  // --- Restaurant Methods ---
  getActiveRestaurantId(): string {
    return this.activeRestaurantId;
  }

  setActiveRestaurantId(id: string) {
    this.activeRestaurantId = id;
    this.saveToLocalStorage();
    notifyListeners();
  }

  getAllRestaurants(): Restaurant[] {
    return this.restaurants;
  }

  getRestaurantBySlug(slug: string): Restaurant | undefined {
    return this.restaurants.find((r) => r.slug === slug);
  }

  getRestaurantById(id: string): Restaurant | undefined {
    return this.restaurants.find((r) => r.id === id);
  }

  getSettings(restaurantId: string): RestaurantSettings {
    return (
      this.settings[restaurantId] || {
        restaurant_id: restaurantId,
        currency: '₹',
        tax_enabled: true,
        tax_percentage: 5.0,
        birthday_days_before: 7,
        birthday_offer_text: 'Complimentary dessert on your special day! 🎂',
        bill_message_template: DEMO_SETTINGS[DEMO_RESTAURANTS[0].id].bill_message_template,
        birthday_message_template: DEMO_SETTINGS[DEMO_RESTAURANTS[0].id].birthday_message_template,
      }
    );
  }

  updateSettings(restaurantId: string, updates: Partial<RestaurantSettings>) {
    const current = this.getSettings(restaurantId);
    this.settings[restaurantId] = { ...current, ...updates };
    notifyListeners();
  }

  // --- Tables ---
  getTables(restaurantId: string): Table[] {
    return this.tables.filter((t) => t.restaurant_id === restaurantId);
  }

  getTableByNumber(restaurantId: string, tableNumber: string): Table | undefined {
    return this.tables.find(
      (t) => t.restaurant_id === restaurantId && (t.table_number === tableNumber || t.qr_slug === tableNumber)
    );
  }

  addTable(restaurantId: string, tableNumber: string): Table {
    const newTable: Table = {
      id: `tbl-${Date.now()}`,
      restaurant_id: restaurantId,
      table_number: tableNumber,
      qr_slug: tableNumber,
      active: true,
      created_at: new Date().toISOString(),
    };
    this.tables.push(newTable);
    notifyListeners();
    return newTable;
  }

  // --- Menu ---
  getCategories(restaurantId: string): MenuCategory[] {
    return this.categories
      .filter((c) => c.restaurant_id === restaurantId && c.active)
      .sort((a, b) => a.display_order - b.display_order);
  }

  getMenuItems(restaurantId: string): MenuItem[] {
    return this.menuItems.filter((m) => m.restaurant_id === restaurantId);
  }

  toggleItemAvailability(itemId: string): boolean {
    const item = this.menuItems.find((m) => m.id === itemId);
    if (item) {
      item.available = !item.available;
      notifyListeners();
      return item.available;
    }
    return false;
  }

  addMenuItem(item: Omit<MenuItem, 'id'>): MenuItem {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    this.menuItems.push(newItem);
    notifyListeners();
    return newItem;
  }

  // --- Orders ---
  getOrders(restaurantId: string): Order[] {
    return this.orders
      .filter((o) => o.restaurant_id === restaurantId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createOrder(params: {
    restaurant_id: string;
    table_id?: string;
    table_number_snapshot?: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    discount?: number;
    total: number;
    special_instructions?: string;
  }): Order {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      restaurant_id: params.restaurant_id,
      table_id: params.table_id || null,
      table_number_snapshot: params.table_number_snapshot || 'Table',
      order_number: this.orderCounter++,
      status: 'NEW',
      subtotal: params.subtotal,
      tax: params.tax,
      discount: params.discount || 0,
      total: params.total,
      special_instructions: params.special_instructions,
      items: params.items,
      created_at: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    this.saveToLocalStorage();
    notifyListeners();
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      order.updated_at = new Date().toISOString();
      this.saveToLocalStorage();
      notifyListeners();
      return true;
    }
    return false;
  }

  // --- Bills ---
  getBills(restaurantId: string): Bill[] {
    return this.bills
      .filter((b) => b.restaurant_id === restaurantId)
      .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
  }

  generateBill(params: {
    restaurant_id: string;
    order_id: string;
    customer_name: string;
    customer_phone: string;
    subtotal: number;
    tax: number;
    discount?: number;
    total: number;
    items: OrderItem[];
    table_number?: string;
  }): Bill {
    const order = this.orders.find((o) => o.id === params.order_id);
    if (order) {
      order.status = 'COMPLETED';
    }

    // Upsert customer into database
    const customer = this.upsertCustomer({
      restaurant_id: params.restaurant_id,
      name: params.customer_name,
      phone: params.customer_phone,
      spendToAdd: params.total,
    });

    const billNumber = order ? `${order.order_number}` : `${Date.now().toString().slice(-4)}`;
    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      restaurant_id: params.restaurant_id,
      order_id: params.order_id,
      customer_id: customer.id,
      customer_name: params.customer_name,
      customer_phone: params.customer_phone,
      bill_number: billNumber,
      table_number_snapshot: params.table_number || order?.table_number_snapshot || '01',
      subtotal: params.subtotal,
      tax: params.tax,
      discount: params.discount || 0,
      total: params.total,
      items_snapshot: params.items,
      generated_at: new Date().toISOString(),
      whatsapp_sent_at: null,
    };

    this.bills.unshift(newBill);
    this.saveToLocalStorage();
    notifyListeners();
    return newBill;
  }

  markBillWhatsAppSent(billId: string) {
    const bill = this.bills.find((b) => b.id === billId);
    if (bill) {
      bill.whatsapp_sent_at = new Date().toISOString();
      this.saveToLocalStorage();
      notifyListeners();
    }
  }

  // --- Customers & CRM ---
  getCustomers(restaurantId: string): Customer[] {
    return this.customers
      .filter((c) => c.restaurant_id === restaurantId)
      .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0));
  }

  upsertCustomer(params: {
    restaurant_id: string;
    name: string;
    phone: string;
    email?: string;
    birthday?: string;
    spendToAdd?: number;
    joinBirthdayClub?: boolean;
  }): Customer {
    const cleanP = params.phone.replace(/[^\d+]/g, '');
    let customer = this.customers.find(
      (c) => c.restaurant_id === params.restaurant_id && c.phone.replace(/[^\d+]/g, '') === cleanP
    );

    if (customer) {
      // Update existing
      if (params.name) customer.name = params.name;
      if (params.email) customer.email = params.email;
      if (params.birthday) customer.birthday = params.birthday;
      if (params.joinBirthdayClub !== undefined) customer.birthday_club_member = params.joinBirthdayClub;
      if (params.spendToAdd) {
        customer.total_visits = (customer.total_visits || 1) + 1;
        customer.total_spent = Number(((customer.total_spent || 0) + params.spendToAdd).toFixed(2));
        customer.last_visit = new Date().toISOString();
      }
    } else {
      // Create new customer
      customer = {
        id: `cust-${Date.now()}`,
        restaurant_id: params.restaurant_id,
        name: params.name || 'Guest',
        phone: params.phone,
        email: params.email || null,
        birthday: params.birthday || null,
        marketing_opt_in: true,
        birthday_club_member: params.joinBirthdayClub || false,
        total_visits: 1,
        total_spent: params.spendToAdd || 0,
        last_visit: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      this.customers.unshift(customer);
    }

    this.saveToLocalStorage();
    notifyListeners();
    return customer;
  }

  joinBirthdayClub(params: {
    restaurant_id: string;
    name: string;
    phone: string;
    birthday: string; // YYYY-MM-DD
    email?: string;
  }): Customer {
    return this.upsertCustomer({
      restaurant_id: params.restaurant_id,
      name: params.name,
      phone: params.phone,
      email: params.email,
      birthday: params.birthday,
      joinBirthdayClub: true,
    });
  }

  getUpcomingBirthdays(restaurantId: string, daysAhead = 7): UpcomingBirthday[] {
    const custs = this.getCustomers(restaurantId);
    return filterUpcomingBirthdays(custs, daysAhead);
  }

  // --- Bookings ---
  getBookings(restaurantId: string): BirthdayBooking[] {
    return this.bookings
      .filter((b) => b.restaurant_id === restaurantId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  createBooking(booking: Omit<BirthdayBooking, 'id' | 'created_at'>): BirthdayBooking {
    const newBooking: BirthdayBooking = {
      ...booking,
      id: `book-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.bookings.unshift(newBooking);
    this.saveToLocalStorage();
    notifyListeners();
    return newBooking;
  }

  updateBookingStatus(bookingId: string, status: BirthdayBooking['status']) {
    const b = this.bookings.find((item) => item.id === bookingId);
    if (b) {
      b.status = status;
      this.saveToLocalStorage();
      notifyListeners();
    }
  }

  // --- Offers ---
  getOffers(restaurantId: string): Offer[] {
    return this.offers.filter((o) => o.restaurant_id === restaurantId && o.active);
  }

  createOffer(offer: Omit<Offer, 'id' | 'created_at'>): Offer {
    const newOffer: Offer = {
      ...offer,
      id: `off-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.offers.unshift(newOffer);
    notifyListeners();
    return newOffer;
  }
}

// Singleton store instance
export const cafeStore = new CafeStore();
