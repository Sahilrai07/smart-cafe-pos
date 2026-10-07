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
  BookingStatus,
  LoyaltyReward,
  StaffMember,
  CafeBranch,
  Expense,
  InventoryItem,
  SubscriptionPlan,
  CafeSubscription,
  PaymentMethod,
  OrderType,
  ServiceRequest,
} from '@/types';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { cafeStore } from '@/lib/store';
import { filterUpcomingBirthdays } from '@/lib/birthday';
import { getStoredUser } from '@/lib/auth';

// Helper to clean phone numbers for matching
function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export const supabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  // --------------------------------------------------------------------------
  // RESTAURANTS
  // --------------------------------------------------------------------------
  async getAllRestaurants(): Promise<Restaurant[]> {
    const user = getStoredUser();
    const client = getSupabaseClient();
    
    // Strict isolation for cafe owners
    if (user && user.role === 'OWNER') {
      if (!client) {
        return cafeStore.getAllRestaurants();
      }
      const { data, error } = await client
        .from('restaurants')
        .select('*')
        .eq('id', user.restaurantId);
      if (error || !data || data.length === 0) {
        return cafeStore.getAllRestaurants();
      }
      return data;
    }

    if (!client) return cafeStore.getAllRestaurants();

    const { data, error } = await client
      .from('restaurants')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      console.warn('Supabase getAllRestaurants fallback:', error?.message);
      return cafeStore.getAllRestaurants();
    }
    return data;
  },

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getRestaurantBySlug(slug) || null;

    const { data, error } = await client
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return cafeStore.getRestaurantBySlug(slug) || null;
    }
    return data;
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    const user = getStoredUser();
    // Prevent owner from querying foreign cafe details
    if (user && user.role === 'OWNER' && id !== user.restaurantId) {
      return null;
    }

    const client = getSupabaseClient();
    if (!client) return cafeStore.getRestaurantById(id) || null;

    const { data, error } = await client
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return cafeStore.getRestaurantById(id) || null;
    }
    return data;
  },

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | null> {
    const client = getSupabaseClient();
    if (!client) {
      return cafeStore.updateRestaurant(id, updates) || null;
    }
    const { data, error } = await client
      .from('restaurants')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !data) {
      return cafeStore.updateRestaurant(id, updates) || null;
    }
    return data;
  },

  // --------------------------------------------------------------------------
  // RESTAURANT SETTINGS
  // --------------------------------------------------------------------------
  async getSettings(restaurantId: string): Promise<RestaurantSettings> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getSettings(restaurantId);

    const { data, error } = await client
      .from('restaurant_settings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .maybeSingle();

    if (error || !data) {
      return cafeStore.getSettings(restaurantId);
    }
    return data;
  },

  async updateSettings(restaurantId: string, updates: Partial<RestaurantSettings>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) {
      cafeStore.updateSettings(restaurantId, updates);
      return true;
    }

    const { error } = await client
      .from('restaurant_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('restaurant_id', restaurantId);

    if (error) {
      console.error('Failed to update settings in Supabase:', error.message);
      return false;
    }
    return true;
  },

  // --------------------------------------------------------------------------
  // TABLES
  // --------------------------------------------------------------------------
  async getTables(restaurantId: string): Promise<Table[]> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getTables(restaurantId);

    const { data, error } = await client
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number');

    if (error || !data || data.length === 0) {
      return cafeStore.getTables(restaurantId);
    }
    return data;
  },

  async getTableByNumber(restaurantId: string, tableNumber: string): Promise<Table | null> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getTableByNumber(restaurantId, tableNumber) || null;

    const unpadded = tableNumber.replace(/^0+/, '') || tableNumber;
    const padded = tableNumber.padStart(2, '0');

    const { data, error } = await client
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .or(`table_number.eq.${tableNumber},table_number.eq.${padded},table_number.eq.${unpadded},qr_slug.eq.${tableNumber},qr_slug.eq.${padded}`)
      .maybeSingle();

    if (error || !data) {
      return cafeStore.getTableByNumber(restaurantId, tableNumber) || null;
    }
    return data;
  },

  async createTable(restaurantId: string, tableNumber: string): Promise<Table | null> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.addTable(restaurantId, tableNumber);

    const { data, error } = await client
      .from('tables')
      .insert({
        restaurant_id: restaurantId,
        table_number: tableNumber,
        qr_slug: tableNumber,
        active: true,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Failed to create table in Supabase:', error.message);
      return null;
    }
    return data;
  },

  async updateTableStatus(
    restaurantId: string,
    tableNumber: string,
    status: 'VACANT' | 'OCCUPIED' | 'BILL_PENDING',
    sessionToken?: string
  ): Promise<boolean> {
    cafeStore.updateTableStatus(restaurantId, tableNumber, status, sessionToken);
    const client = getSupabaseClient();
    if (!client) return true;
    try {
      await client
        .from('tables')
        .update({
          status,
          seated_at: status === 'OCCUPIED' ? new Date().toISOString() : null,
          last_order_at: status === 'OCCUPIED' ? new Date().toISOString() : null,
          active_session_token: sessionToken || null,
        })
        .eq('restaurant_id', restaurantId)
        .eq('table_number', tableNumber);
    } catch {}
    return true;
  },

  async clearTableSession(restaurantId: string, tableNumber: string): Promise<boolean> {
    return this.updateTableStatus(restaurantId, tableNumber, 'VACANT');
  },

  // --------------------------------------------------------------------------
  // SERVICE BELL REQUESTS
  // --------------------------------------------------------------------------
  async createServiceRequest(req: {
    restaurant_id: string;
    table_number: string;
    type: 'WATER' | 'CUTLERY' | 'CLEAN_TABLE' | 'CALL_WAITER';
  }): Promise<ServiceRequest> {
    const local = cafeStore.createServiceRequest(req);
    const client = getSupabaseClient();
    if (!client) return local;

    try {
      const { data } = await client
        .from('service_requests')
        .insert({
          restaurant_id: req.restaurant_id,
          table_number: req.table_number,
          type: req.type,
          status: 'PENDING',
        })
        .select('*')
        .single();
      if (data) return data;
    } catch {}
    return local;
  },

  async getServiceRequests(restaurantId: string): Promise<ServiceRequest[]> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getServiceRequests(restaurantId);

    try {
      const { data, error } = await client
        .from('service_requests')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch {}
    return cafeStore.getServiceRequests(restaurantId);
  },

  async resolveServiceRequest(requestId: string): Promise<boolean> {
    cafeStore.resolveServiceRequest(requestId);
    const client = getSupabaseClient();
    if (!client) return true;

    try {
      await client
        .from('service_requests')
        .update({ status: 'RESOLVED' })
        .eq('id', requestId);
    } catch {}
    return true;
  },

  // --------------------------------------------------------------------------
  // MENU CATEGORIES & ITEMS
  // --------------------------------------------------------------------------
  async getCategories(restaurantId: string): Promise<MenuCategory[]> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getCategories(restaurantId);

    const { data, error } = await client
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('active', true)
      .order('display_order');

    if (error || !data || data.length === 0) {
      return cafeStore.getCategories(restaurantId);
    }
    return data;
  },

  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getMenuItems(restaurantId);

    const { data, error } = await client
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('display_order');

    if (error || !data || data.length === 0) {
      return cafeStore.getMenuItems(restaurantId);
    }
    return data;
  },

  async toggleItemAvailability(itemId: string, currentAvailable: boolean): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.toggleItemAvailability(itemId);

    const newStatus = !currentAvailable;
    const { error } = await client
      .from('menu_items')
      .update({ available: newStatus, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) {
      console.error('Failed to toggle item availability in Supabase:', error.message);
      return currentAvailable;
    }
    return newStatus;
  },

  async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem | null> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.addMenuItem(item);

    const { data, error } = await client
      .from('menu_items')
      .insert(item)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to create menu item in Supabase:', error.message);
      return null;
    }
    return data;
  },

  // --------------------------------------------------------------------------
  // ORDERS & ORDER ITEMS
  // --------------------------------------------------------------------------
  async getOrders(restaurantId: string): Promise<Order[]> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getOrders(restaurantId);

    const { data, error } = await client
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch orders from Supabase:', error.message);
      return cafeStore.getOrders(restaurantId);
    }

    // Map nested order_items array to items property
    return (data || []).map((o: any) => ({
      ...o,
      items: o.order_items || [],
    }));
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const client = getSupabaseClient();
    if (!client) {
      return cafeStore.getOrders(cafeStore.getActiveRestaurantId()).find((o) => o.id === orderId) || null;
    }

    const { data, error } = await client
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      ...data,
      items: data.order_items || [],
    };
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, prepTimeMinutes?: number): Promise<boolean> {
    try {
      cafeStore.updateOrderStatus(orderId, status, prepTimeMinutes);
    } catch {}

    const client = getSupabaseClient();
    if (!client) return true;

    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (prepTimeMinutes !== undefined) {
      updates.prep_time_minutes = prepTimeMinutes;
      updates.estimated_ready_at = new Date(Date.now() + prepTimeMinutes * 60 * 1000).toISOString();
    }

    const { error } = await client
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      console.error('Failed to update order status in Supabase:', error.message);
      return false;
    }
    return true;
  },

  subscribeToOrders(restaurantId: string, onUpdate: () => void): () => void {
    const client = getSupabaseClient();
    if (!client) {
      return () => {};
    }

    const channelId = `orders-${restaurantId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const channel = client
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  },

  subscribeToSingleOrder(orderId: string, onUpdate: (order: Order) => void): () => void {
    const client = getSupabaseClient();
    if (!client) {
      return () => {};
    }

    const channelId = `single-order-${orderId}-${Date.now()}`;
    const channel = client
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        async (payload: any) => {
          if (payload.new) {
            const fullOrder = await this.getOrderById(orderId);
            onUpdate(fullOrder || (payload.new as Order));
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  },

  // --------------------------------------------------------------------------
  // BILLS
  // --------------------------------------------------------------------------
  async getBills(restaurantId: string): Promise<Bill[]> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getBills(restaurantId);

    const { data, error } = await client
      .from('bills')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch bills from Supabase:', error.message);
      return cafeStore.getBills(restaurantId);
    }
    return data || [];
  },

  async getBillById(restaurantId: string, billId: string): Promise<Bill | null> {
    const client = getSupabaseClient();
    if (!client) {
      return cafeStore.getBills(restaurantId).find((b) => b.id === billId || b.bill_number === billId) || null;
    }

    const { data, error } = await client
      .from('bills')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .or(`id.eq.${billId},bill_number.eq.${billId}`)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  },

  async createBill(params: {
    restaurant_id: string;
    order_id?: string | null;
    customer_name: string;
    customer_phone: string;
    subtotal: number;
    tax: number;
    discount?: number;
    total: number;
    items: OrderItem[];
    table_number?: string;
  }): Promise<Bill | null> {
    const client = getSupabaseClient();
    if (!client) {
      return cafeStore.generateBill({
        ...params,
        order_id: params.order_id || `temp-${Date.now()}`,
      });
    }

    // 1. Upsert customer into Supabase CRM
    const customer = await this.upsertCustomer({
      restaurant_id: params.restaurant_id,
      name: params.customer_name,
      phone: params.customer_phone,
      spendToAdd: params.total,
    });

    // 2. Generate a usable bill number
    let billNumber = `${Date.now().toString().slice(-4)}`;
    if (params.order_id) {
      const order = await this.getOrderById(params.order_id);
      if (order?.order_number) {
        billNumber = `${order.order_number}`;
      }
      // Mark order COMPLETED in Supabase
      await this.updateOrderStatus(params.order_id, 'COMPLETED');
    }

    // 3. Insert real bill row
    const billInsertData: any = {
      restaurant_id: params.restaurant_id,
      order_id: params.order_id || null,
      customer_id: customer?.id || null,
      customer_name: params.customer_name,
      customer_phone: params.customer_phone,
      bill_number: billNumber,
      table_number_snapshot: params.table_number || '01',
      subtotal: params.subtotal,
      tax: params.tax,
      discount: params.discount || 0,
      total: params.total,
      items_snapshot: params.items,
      generated_at: new Date().toISOString(),
      whatsapp_sent_at: null,
    };

    const { data: bill, error: billErr } = await client
      .from('bills')
      .insert(billInsertData)
      .select('*')
      .single();

    if (billErr) {
      console.error('Failed to insert bill into Supabase:', billErr.message);
      return null;
    }

    return bill;
  },

  async markBillWhatsAppSent(billId: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) {
      cafeStore.markBillWhatsAppSent(billId);
      return;
    }

    await client
      .from('bills')
      .update({ whatsapp_sent_at: new Date().toISOString() })
      .eq('id', billId);
  },

  // --------------------------------------------------------------------------
  // CUSTOMERS & CRM
  // --------------------------------------------------------------------------
  async getCustomers(restaurantId: string): Promise<Customer[]> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getCustomers(restaurantId);

    const { data, error } = await client
      .from('customers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('total_spent', { ascending: false });

    if (error) {
      console.error('Failed to fetch customers from Supabase:', error.message);
      return cafeStore.getCustomers(restaurantId);
    }
    return data || [];
  },

  async upsertCustomer(params: {
    restaurant_id: string;
    name: string;
    phone: string;
    email?: string;
    birthday?: string;
    spendToAdd?: number;
    joinBirthdayClub?: boolean;
  }): Promise<Customer | null> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.upsertCustomer(params);

    const cleanPhone = sanitizePhone(params.phone);

    // Look for existing customer with same phone in this restaurant
    const { data: existing } = await client
      .from('customers')
      .select('*')
      .eq('restaurant_id', params.restaurant_id)
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existing) {
      const updates: any = {
        updated_at: new Date().toISOString(),
      };
      if (params.name && params.name !== 'Guest') updates.name = params.name;
      if (params.email) updates.email = params.email;
      if (params.birthday) updates.birthday = params.birthday;
      if (params.joinBirthdayClub !== undefined) updates.birthday_club_member = params.joinBirthdayClub;
      if (params.spendToAdd && params.spendToAdd > 0) {
        updates.total_visits = (existing.total_visits || 1) + 1;
        updates.total_spent = Number(((existing.total_spent || 0) + params.spendToAdd).toFixed(2));
        updates.last_visit = new Date().toISOString();
      }

      const { data: updated, error: updateErr } = await client
        .from('customers')
        .update(updates)
        .eq('id', existing.id)
        .select('*')
        .single();

      if (updateErr) {
        console.error('Failed to update customer in Supabase:', updateErr.message);
        return existing;
      }
      return updated;
    } else {
      // Create new customer
      const newCustomerData: any = {
        restaurant_id: params.restaurant_id,
        name: params.name || 'Guest',
        phone: cleanPhone,
        email: params.email || null,
        birthday: params.birthday || null,
        marketing_opt_in: true,
        birthday_club_member: params.joinBirthdayClub || false,
        total_visits: 1,
        total_spent: params.spendToAdd || 0,
        last_visit: new Date().toISOString(),
      };

      const { data: created, error: createErr } = await client
        .from('customers')
        .insert(newCustomerData)
        .select('*')
        .single();

      if (createErr) {
        console.error('Failed to insert customer into Supabase:', createErr.message);
        return null;
      }
      return created;
    }
  },

  async joinBirthdayClub(params: {
    restaurant_id: string;
    name: string;
    phone: string;
    birthday: string;
    email?: string;
  }): Promise<Customer | null> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.joinBirthdayClub(params);

    // 1. Upsert customer record
    const customer = await this.upsertCustomer({
      restaurant_id: params.restaurant_id,
      name: params.name,
      phone: params.phone,
      birthday: params.birthday,
      email: params.email,
      joinBirthdayClub: true,
    });

    if (!customer) return null;

    // 2. Insert into birthday_club_members table
    await client
      .from('birthday_club_members')
      .upsert(
        {
          restaurant_id: params.restaurant_id,
          customer_id: customer.id,
          birthday: params.birthday,
          consent: true,
          active: true,
        },
        { onConflict: 'restaurant_id, customer_id' }
      );

    return customer;
  },

  async getUpcomingBirthdays(restaurantId: string, daysAhead = 7): Promise<UpcomingBirthday[]> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getUpcomingBirthdays(restaurantId, daysAhead);

    // Try database RPC function first
    const { data: rpcData, error: rpcError } = await client.rpc('get_upcoming_birthdays', {
      p_restaurant_id: restaurantId,
      p_days_ahead: daysAhead,
    });

    if (!rpcError && rpcData && Array.isArray(rpcData)) {
      return rpcData;
    }

    // Fallback: Query all birthday club members and perform annual calculation in JS
    const { data: members, error: queryError } = await client
      .from('customers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('birthday_club_member', true)
      .not('birthday', 'is', null);

    if (queryError || !members) {
      return cafeStore.getUpcomingBirthdays(restaurantId, daysAhead);
    }

    return filterUpcomingBirthdays(members, daysAhead);
  },

  // --------------------------------------------------------------------------
  // BIRTHDAY BOOKINGS
  // --------------------------------------------------------------------------
  async getBookings(restaurantId: string): Promise<BirthdayBooking[]> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getBookings(restaurantId);

    const { data, error } = await client
      .from('birthday_bookings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('date', { ascending: true });

    if (error || !data) return cafeStore.getBookings(restaurantId);
    return data;
  },

  async createBooking(booking: Omit<BirthdayBooking, 'id' | 'created_at'>): Promise<BirthdayBooking | null> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.createBooking(booking);

    const { data, error } = await client
      .from('birthday_bookings')
      .insert(booking)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to create booking in Supabase:', error.message);
      return null;
    }
    return data;
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) {
      cafeStore.updateBookingStatus(bookingId, status);
      return true;
    }

    const { error } = await client
      .from('birthday_bookings')
      .update({ status })
      .eq('id', bookingId);

    return !error;
  },

  // --------------------------------------------------------------------------
  // OFFERS
  // --------------------------------------------------------------------------
  async getOffers(restaurantId: string): Promise<Offer[]> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.getOffers(restaurantId);

    const { data, error } = await client
      .from('offers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('active', true);

    if (error || !data) return cafeStore.getOffers(restaurantId);
    return data;
  },

  async createOffer(offer: Omit<Offer, 'id' | 'created_at'>): Promise<Offer | null> {
    const client = getSupabaseClient();
    if (!client) return cafeStore.createOffer(offer);

    const { data, error } = await client
      .from('offers')
      .insert(offer)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to create offer in Supabase:', error.message);
      return null;
    }
    return data;
  },

  // --------------------------------------------------------------------------
  // 6. LOYALTY & REWARDS
  // --------------------------------------------------------------------------
  async getLoyaltyRewards(restaurantId: string): Promise<LoyaltyReward[]> {
    return cafeStore.getLoyaltyRewards(restaurantId);
  },

  async addLoyaltyReward(reward: Omit<LoyaltyReward, 'id'>): Promise<LoyaltyReward> {
    return cafeStore.addLoyaltyReward(reward);
  },

  async redeemCustomerReward(customerId: string, rewardId: string): Promise<boolean> {
    return cafeStore.redeemCustomerReward(customerId, rewardId);
  },

  // --------------------------------------------------------------------------
  // 7. STAFF MANAGEMENT & MULTI-BRANCH
  // --------------------------------------------------------------------------
  async getStaffMembers(restaurantId: string): Promise<StaffMember[]> {
    return cafeStore.getStaffMembers(restaurantId);
  },

  async addStaffMember(staff: Omit<StaffMember, 'id' | 'created_at'>): Promise<StaffMember> {
    return cafeStore.addStaffMember(staff);
  },

  async toggleStaffStatus(staffId: string): Promise<boolean> {
    return cafeStore.toggleStaffStatus(staffId);
  },

  async deleteStaffMember(staffId: string): Promise<void> {
    cafeStore.deleteStaffMember(staffId);
  },

  async getBranches(restaurantId: string): Promise<CafeBranch[]> {
    return cafeStore.getBranches(restaurantId);
  },

  async addBranch(branch: Omit<CafeBranch, 'id' | 'created_at'>): Promise<CafeBranch> {
    return cafeStore.addBranch(branch);
  },

  // --------------------------------------------------------------------------
  // 8. FINANCE & BUSINESS ANALYTICS
  // --------------------------------------------------------------------------
  async getExpenses(restaurantId: string): Promise<Expense[]> {
    return cafeStore.getExpenses(restaurantId);
  },

  async addExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    return cafeStore.addExpense(expense);
  },

  async deleteExpense(expenseId: string): Promise<void> {
    cafeStore.deleteExpense(expenseId);
  },

  async getFinancialSummary(restaurantId: string) {
    return cafeStore.getFinancialSummary(restaurantId);
  },

  // --- Inventory & Stock ---
  async getInventory(restaurantId: string): Promise<InventoryItem[]> {
    return cafeStore.getInventory(restaurantId);
  },

  async addInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    return cafeStore.addInventoryItem(item);
  },

  async updateInventoryStock(itemId: string, newStock: number): Promise<void> {
    cafeStore.updateInventoryStock(itemId, newStock);
  },

  async deleteInventoryItem(itemId: string): Promise<void> {
    cafeStore.deleteInventoryItem(itemId);
  },

  // --------------------------------------------------------------------------
  // 9. SAAS SUBSCRIPTION MANAGEMENT
  // --------------------------------------------------------------------------
  async getSubscriptions(): Promise<CafeSubscription[]> {
    return cafeStore.getSubscriptions();
  },

  async getSaasPlans(): Promise<SubscriptionPlan[]> {
    return cafeStore.getSaasPlans();
  },

  async registerNewCafe(params: {
    name: string;
    slug: string;
    phone: string;
    whatsapp_number: string;
    plan_id: 'STARTER_500' | 'GROWTH_1000' | 'PRO_1500';
    address?: string;
  }): Promise<{ restaurant: Restaurant; subscription: CafeSubscription }> {
    return cafeStore.registerNewCafe(params);
  },

  async updateSubscriptionStatus(subId: string, status: CafeSubscription['status']): Promise<void> {
    cafeStore.updateSubscriptionStatus(subId, status);
  },
};

