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
  LoyaltyReward,
  StaffMember,
  CafeBranch,
  Expense,
  InventoryItem,
  SubscriptionPlan,
  CafeSubscription,
  PaymentMethod,
  PaymentStatus,
  OrderType,
  ServiceRequest,
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
  DEMO_LOYALTY_REWARDS,
  DEMO_STAFF_MEMBERS,
  DEMO_BRANCHES,
  DEMO_EXPENSES,
  DEMO_INVENTORY,
  SAAS_PLANS,
  DEMO_SUBSCRIPTIONS,
} from './demoData';
import { getSupabaseClient, isSupabaseConfigured } from './supabase/client';
import { filterUpcomingBirthdays } from './birthday';
import { getStoredUser } from './auth';

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
  private loyaltyRewards: LoyaltyReward[] = DEMO_LOYALTY_REWARDS;
  private staffMembers: StaffMember[] = DEMO_STAFF_MEMBERS;
  private branches: CafeBranch[] = DEMO_BRANCHES;
  private expenses: Expense[] = DEMO_EXPENSES;
  private inventory: InventoryItem[] = DEMO_INVENTORY;
  private subscriptions: CafeSubscription[] = DEMO_SUBSCRIPTIONS;
  private saasPlans: SubscriptionPlan[] = SAAS_PLANS;
  private serviceRequests: ServiceRequest[] = [];
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

      const savedExpenses = localStorage.getItem('qb_expenses');
      if (savedExpenses) this.expenses = JSON.parse(savedExpenses);

      const savedInventory = localStorage.getItem('qb_inventory');
      if (savedInventory) this.inventory = JSON.parse(savedInventory);

      const savedStaff = localStorage.getItem('qb_staff');
      if (savedStaff) this.staffMembers = JSON.parse(savedStaff);

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
      localStorage.setItem('qb_expenses', JSON.stringify(this.expenses));
      localStorage.setItem('qb_inventory', JSON.stringify(this.inventory));
      localStorage.setItem('qb_staff', JSON.stringify(this.staffMembers));
      localStorage.setItem('qb_active_restaurant', this.activeRestaurantId);
      localStorage.setItem('qb_order_counter', this.orderCounter.toString());
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  // --- Restaurant Methods ---
  getActiveRestaurantId(): string {
    const user = getStoredUser();
    if (user && user.role === 'OWNER') {
      return user.restaurantId;
    }
    return this.activeRestaurantId;
  }

  setActiveRestaurantId(id: string) {
    const user = getStoredUser();
    if (user && user.role === 'OWNER') {
      // Owner is strictly restricted to their own cafe
      this.activeRestaurantId = user.restaurantId;
    } else {
      this.activeRestaurantId = id;
    }
    this.saveToLocalStorage();
    notifyListeners();
  }

  getAllRestaurants(): Restaurant[] {
    const user = getStoredUser();
    if (user && user.role === 'OWNER') {
      // Return only the owner's authorized restaurant
      return this.restaurants.filter((r) => r.id === user.restaurantId);
    }
    return this.restaurants;
  }

  getRestaurantBySlug(slug: string): Restaurant | undefined {
    return this.restaurants.find((r) => r.slug === slug);
  }

  getRestaurantById(id: string): Restaurant | undefined {
    const user = getStoredUser();
    if (user && user.role === 'OWNER' && id !== user.restaurantId) {
      return undefined; // Block access to foreign cafe details
    }
    return this.restaurants.find((r) => r.id === id);
  }

  updateRestaurant(id: string, updates: Partial<Restaurant>): Restaurant | undefined {
    const idx = this.restaurants.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.restaurants[idx] = { ...this.restaurants[idx], ...updates };
      notifyListeners();
      return this.restaurants[idx];
    }
    return undefined;
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

  updateTableStatus(
    restaurantId: string,
    tableNumber: string,
    status: 'VACANT' | 'OCCUPIED' | 'BILL_PENDING',
    sessionToken?: string
  ): boolean {
    const table = this.getTableByNumber(restaurantId, tableNumber);
    if (!table) return false;
    table.status = status;
    if (status === 'OCCUPIED') {
      if (!table.seated_at) table.seated_at = new Date().toISOString();
      table.last_order_at = new Date().toISOString();
      if (sessionToken) table.active_session_token = sessionToken;
    } else if (status === 'VACANT') {
      table.seated_at = undefined;
      table.last_order_at = undefined;
      table.active_session_token = undefined;
    }
    notifyListeners();
    return true;
  }

  clearTableSession(restaurantId: string, tableNumber: string): boolean {
    return this.updateTableStatus(restaurantId, tableNumber, 'VACANT');
  }

  // --- Service Bell Requests ---
  createServiceRequest(req: {
    restaurant_id: string;
    table_number: string;
    type: 'WATER' | 'CUTLERY' | 'CLEAN_TABLE' | 'CALL_WAITER';
  }): ServiceRequest {
    const newReq: ServiceRequest = {
      id: `srv-${Date.now()}`,
      restaurant_id: req.restaurant_id,
      table_number: req.table_number,
      type: req.type,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    this.serviceRequests.unshift(newReq);
    notifyListeners();
    return newReq;
  }

  getServiceRequests(restaurantId: string): ServiceRequest[] {
    return this.serviceRequests.filter((r) => r.restaurant_id === restaurantId);
  }

  resolveServiceRequest(requestId: string): boolean {
    const req = this.serviceRequests.find((r) => r.id === requestId);
    if (req) {
      req.status = 'RESOLVED';
      notifyListeners();
      return true;
    }
    return false;
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

  getOrderById(orderId: string): Order | undefined {
    return this.orders.find((o) => o.id === orderId);
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
    order_type?: OrderType;
    payment_method?: PaymentMethod;
    payment_status?: PaymentStatus;
    prep_time_minutes?: number;
  }): Order {
    const orderNum = this.orderCounter++;
    const prepMinutes = params.prep_time_minutes || 15;
    const estReady = new Date(Date.now() + prepMinutes * 60 * 1000).toISOString();
    const token = params.order_type === 'PICKUP' ? `TK-${orderNum % 100 < 10 ? '0' : ''}${orderNum % 100}` : undefined;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      restaurant_id: params.restaurant_id,
      table_id: params.table_id || null,
      table_number_snapshot: params.table_number_snapshot || (params.order_type === 'PICKUP' ? 'Counter' : 'Takeaway'),
      order_number: orderNum,
      status: 'NEW',
      order_type: params.order_type || 'DINE_IN',
      subtotal: params.subtotal,
      tax: params.tax,
      discount: params.discount || 0,
      total: params.total,
      special_instructions: params.special_instructions,
      prep_time_minutes: prepMinutes,
      estimated_ready_at: estReady,
      pickup_token: token,
      payment_method: params.payment_method || 'UNPAID',
      payment_status: params.payment_status || 'PENDING',
      items: params.items,
      created_at: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    this.saveToLocalStorage();
    notifyListeners();
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus, prepTimeMinutes?: number): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      order.updated_at = new Date().toISOString();
      if (prepTimeMinutes !== undefined) {
        order.prep_time_minutes = prepTimeMinutes;
        order.estimated_ready_at = new Date(Date.now() + prepTimeMinutes * 60 * 1000).toISOString();
      }
      this.saveToLocalStorage();
      notifyListeners();
      return true;
    }
    return false;
  }

  // --- Bills & Counter POS ---
  getBills(restaurantId: string): Bill[] {
    return this.bills
      .filter((b) => b.restaurant_id === restaurantId)
      .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
  }

  generateBill(params: {
    restaurant_id: string;
    order_id?: string;
    customer_name: string;
    customer_phone: string;
    subtotal: number;
    tax: number;
    discount?: number;
    total: number;
    items: OrderItem[];
    table_number?: string;
    payment_method?: PaymentMethod;
    order_type?: OrderType;
    coins_redeemed?: number;
  }): Bill {
    const order = params.order_id ? this.orders.find((o) => o.id === params.order_id) : null;
    if (order) {
      order.status = 'COMPLETED';
      order.payment_status = 'PAID';
      if (params.payment_method) order.payment_method = params.payment_method;
    }

    // Calculate loyalty coins earned: 10% of subtotal (1 coin per ₹10)
    const settings = this.getSettings(params.restaurant_id);
    const earnRate = (settings.coins_earn_rate_percent || 10) / 100;
    const coinsEarned = Math.floor(params.subtotal * earnRate);

    // Upsert customer into database & adjust loyalty coins
    const customer = this.upsertCustomer({
      restaurant_id: params.restaurant_id,
      name: params.customer_name,
      phone: params.customer_phone,
      spendToAdd: params.total,
      coinsEarned,
      coinsRedeemed: params.coins_redeemed || 0,
    });

    const billNumber = order ? `${order.order_number}` : `${Date.now().toString().slice(-4)}`;
    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      restaurant_id: params.restaurant_id,
      order_id: params.order_id || null,
      customer_id: customer.id,
      customer_name: params.customer_name,
      customer_phone: params.customer_phone,
      bill_number: billNumber,
      table_number_snapshot: params.table_number || order?.table_number_snapshot || 'Counter',
      subtotal: params.subtotal,
      tax: params.tax,
      discount: params.discount || 0,
      total: params.total,
      payment_method: params.payment_method || 'CASH',
      order_type: params.order_type || order?.order_type || 'DINE_IN',
      coins_earned: coinsEarned,
      coins_redeemed: params.coins_redeemed || 0,
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
    coinsEarned?: number;
    coinsRedeemed?: number;
  }): Customer {
    const cleanP = params.phone.replace(/[^\d+]/g, '');
    let customer = this.customers.find(
      (c) => c.restaurant_id === params.restaurant_id && c.phone.replace(/[^\d+]/g, '') === cleanP
    );

    const calcTier = (coins: number): Customer['loyalty_tier'] => {
      if (coins >= 500) return 'Platinum';
      if (coins >= 250) return 'Gold';
      if (coins >= 100) return 'Silver';
      return 'Bronze';
    };

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
      if (params.coinsEarned || params.coinsRedeemed) {
        customer.total_coins_earned = (customer.total_coins_earned || 0) + (params.coinsEarned || 0);
        customer.total_coins_redeemed = (customer.total_coins_redeemed || 0) + (params.coinsRedeemed || 0);
        customer.loyalty_coins = Math.max(0, (customer.loyalty_coins || 0) + (params.coinsEarned || 0) - (params.coinsRedeemed || 0));
        customer.loyalty_tier = calcTier(customer.loyalty_coins);
      }
    } else {
      // Create new customer
      const initialEarned = params.coinsEarned || (params.spendToAdd ? Math.floor(params.spendToAdd * 0.1) : 0);
      const initialRedeemed = params.coinsRedeemed || 0;
      const initialBal = Math.max(0, initialEarned - initialRedeemed);

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
        loyalty_coins: initialBal,
        loyalty_tier: calcTier(initialBal),
        total_coins_earned: initialEarned,
        total_coins_redeemed: initialRedeemed,
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

  // --------------------------------------------------------------------------
  // 6. LOYALTY & REWARDS
  // --------------------------------------------------------------------------
  getLoyaltyRewards(restaurantId: string): LoyaltyReward[] {
    return this.loyaltyRewards.filter((r) => r.restaurant_id === restaurantId && r.active);
  }

  addLoyaltyReward(reward: Omit<LoyaltyReward, 'id'>): LoyaltyReward {
    const newR: LoyaltyReward = {
      ...reward,
      id: `rwd-${Date.now()}`,
    };
    this.loyaltyRewards.push(newR);
    notifyListeners();
    return newR;
  }

  redeemCustomerReward(customerId: string, rewardId: string): boolean {
    const cust = this.customers.find((c) => c.id === customerId);
    const reward = this.loyaltyRewards.find((r) => r.id === rewardId);
    if (!cust || !reward) return false;
    if ((cust.loyalty_coins || 0) < reward.coin_cost) return false;

    cust.loyalty_coins = (cust.loyalty_coins || 0) - reward.coin_cost;
    cust.total_coins_redeemed = (cust.total_coins_redeemed || 0) + reward.coin_cost;
    this.saveToLocalStorage();
    notifyListeners();
    return true;
  }

  // --------------------------------------------------------------------------
  // 7. STAFF MANAGEMENT & MULTI-BRANCH
  // --------------------------------------------------------------------------
  getStaffMembers(restaurantId: string): StaffMember[] {
    return this.staffMembers.filter((s) => s.restaurant_id === restaurantId);
  }

  addStaffMember(staff: Omit<StaffMember, 'id' | 'created_at'>): StaffMember {
    const newS: StaffMember = {
      ...staff,
      id: `stf-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.staffMembers.push(newS);
    this.saveToLocalStorage();
    notifyListeners();
    return newS;
  }

  toggleStaffStatus(staffId: string): boolean {
    const s = this.staffMembers.find((item) => item.id === staffId);
    if (s) {
      s.active = !s.active;
      this.saveToLocalStorage();
      notifyListeners();
      return s.active;
    }
    return false;
  }

  deleteStaffMember(staffId: string) {
    this.staffMembers = this.staffMembers.filter((s) => s.id !== staffId);
    this.saveToLocalStorage();
    notifyListeners();
  }

  getBranches(restaurantId: string): CafeBranch[] {
    return this.branches.filter((b) => b.restaurant_id === restaurantId);
  }

  addBranch(branch: Omit<CafeBranch, 'id' | 'created_at'>): CafeBranch {
    const newB: CafeBranch = {
      ...branch,
      id: `br-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.branches.push(newB);
    notifyListeners();
    return newB;
  }

  // --------------------------------------------------------------------------
  // 8. FINANCE & BUSINESS ANALYTICS
  // --------------------------------------------------------------------------
  getExpenses(restaurantId: string): Expense[] {
    return this.expenses
      .filter((e) => e.restaurant_id === restaurantId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addExpense(expense: Omit<Expense, 'id' | 'created_at'>): Expense {
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.expenses.unshift(newExp);
    this.saveToLocalStorage();
    notifyListeners();
    return newExp;
  }

  deleteExpense(expenseId: string) {
    this.expenses = this.expenses.filter((e) => e.id !== expenseId);
    this.saveToLocalStorage();
    notifyListeners();
  }

  getFinancialSummary(restaurantId: string) {
    const orders = this.getOrders(restaurantId);
    const bills = this.getBills(restaurantId);
    const expenses = this.getExpenses(restaurantId);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const estimatedCOGS = totalRevenue * 0.32; // ~32% food ingredient cost average
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Breakdown by category
    const expenseByCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
    });

    return {
      totalRevenue,
      totalExpenses,
      estimatedCOGS,
      netProfit,
      profitMargin,
      expenseByCategory,
      ordersCount: orders.length,
      billsCount: bills.length,
    };
  }

  // --- Inventory & Stock ---
  getInventory(restaurantId: string): InventoryItem[] {
    return this.inventory.filter((i) => i.restaurant_id === restaurantId);
  }

  addInventoryItem(item: Omit<InventoryItem, 'id'>): InventoryItem {
    const newInv: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      last_restocked: new Date().toISOString().split('T')[0],
    };
    this.inventory.push(newInv);
    this.saveToLocalStorage();
    notifyListeners();
    return newInv;
  }

  updateInventoryStock(itemId: string, newStock: number) {
    const item = this.inventory.find((i) => i.id === itemId);
    if (item) {
      item.current_stock = newStock;
      item.last_restocked = new Date().toISOString().split('T')[0];
      this.saveToLocalStorage();
      notifyListeners();
    }
  }

  deleteInventoryItem(itemId: string) {
    this.inventory = this.inventory.filter((i) => i.id !== itemId);
    this.saveToLocalStorage();
    notifyListeners();
  }

  // --------------------------------------------------------------------------
  // 9. SAAS SUBSCRIPTION MANAGEMENT (SUPER ADMIN)
  // --------------------------------------------------------------------------
  getSubscriptions(): CafeSubscription[] {
    return this.subscriptions;
  }

  getSaasPlans(): SubscriptionPlan[] {
    return this.saasPlans;
  }

  registerNewCafe(params: {
    name: string;
    slug: string;
    phone: string;
    whatsapp_number: string;
    plan_id: 'STARTER_500' | 'GROWTH_1000' | 'PRO_1500';
    address?: string;
  }): { restaurant: Restaurant; subscription: CafeSubscription } {
    const plan = this.saasPlans.find((p) => p.id === params.plan_id) || this.saasPlans[1];
    const newRest: Restaurant = {
      id: `rest-${Date.now()}`,
      name: params.name,
      slug: params.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      phone: params.phone,
      whatsapp_number: params.whatsapp_number,
      address: params.address || 'Central City Hub',
      created_at: new Date().toISOString(),
    };
    this.restaurants.push(newRest);

    // Default settings
    this.settings[newRest.id] = {
      restaurant_id: newRest.id,
      currency: '₹',
      tax_enabled: true,
      tax_percentage: 5.0,
      birthday_days_before: 7,
      birthday_offer_text: 'Surprise celebration treat on us! 🎂',
      bill_message_template: DEMO_SETTINGS[DEMO_RESTAURANTS[0].id].bill_message_template,
      birthday_message_template: DEMO_SETTINGS[DEMO_RESTAURANTS[0].id].birthday_message_template,
      subscription_plan: params.plan_id,
      opening_time: '09:00',
      closing_time: '23:00',
      auto_accept_orders: false,
      default_prep_time_minutes: 15,
      coins_earn_rate_percent: 10,
      coin_value_in_currency: 1.0,
      upi_id: `${newRest.slug}@upi`,
      enable_self_pickup: true,
      enable_table_ordering: true,
    };

    // Default tables
    for (let i = 1; i <= 4; i++) {
      const num = i < 10 ? `0${i}` : `${i}`;
      this.tables.push({
        id: `tbl-${newRest.id}-${num}`,
        restaurant_id: newRest.id,
        table_number: num,
        qr_slug: num,
        active: true,
      });
    }

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const newSub: CafeSubscription = {
      id: `sub-${Date.now()}`,
      restaurant_id: newRest.id,
      restaurant_name: newRest.name,
      plan_id: plan.id,
      plan_name: plan.name,
      price_per_month: plan.price_per_month,
      status: 'ACTIVE',
      billing_cycle: 'MONTHLY',
      start_date: new Date().toISOString().split('T')[0],
      renewal_date: nextMonth.toISOString().split('T')[0],
      last_payment_date: new Date().toISOString().split('T')[0],
      last_payment_amount: plan.price_per_month,
      payment_method: 'UPI / Direct Bank',
    };
    this.subscriptions.unshift(newSub);

    notifyListeners();
    return { restaurant: newRest, subscription: newSub };
  }

  updateSubscriptionStatus(subId: string, status: CafeSubscription['status']) {
    const sub = this.subscriptions.find((s) => s.id === subId);
    if (sub) {
      sub.status = status;
      notifyListeners();
    }
  }
}

// Singleton store instance
export const cafeStore = new CafeStore();

