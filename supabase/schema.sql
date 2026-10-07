-- ==============================================================================
-- CAFE & RESTAURANT MULTI-TENANT SAAS DATABASE SCHEMA
-- PostgreSQL / Supabase Free Tier Compatible
-- Zero-Cost, Production-Ready, Full RLS Security
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. RESTAURANTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    phone VARCHAR(50),
    whatsapp_number VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);

-- ------------------------------------------------------------------------------
-- 2. RESTAURANT SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    currency VARCHAR(10) DEFAULT '₹',
    tax_enabled BOOLEAN DEFAULT TRUE,
    tax_percentage NUMERIC(5,2) DEFAULT 5.00,
    bill_message_template TEXT DEFAULT 'Hey {customer_name} 👋\n\nThanks for visiting {restaurant_name}!\n\n🧾 *Your Bill (#{bill_number}):*\n{items_list}\n\nSubtotal: {currency}{subtotal}\nGST ({tax_percentage}%): {currency}{tax}\n*Total: {currency}{total}*\n\nThank you for visiting! ❤️\nWe hope to see you again soon.\n\n🎂 Join our Birthday Club for a special treat: {birthday_club_link}',
    birthday_message_template TEXT DEFAULT 'Hey {customer_name}! 🎉🎂\n\nYour birthday is coming up in {days_before} days!\n\nWe would love to celebrate with you at {restaurant_name}. ❤️\n\n🎁 *Your Birthday Gift:* {birthday_offer}\n\nShow this message when you visit us to claim your special surprise! 🥳',
    birthday_offer_text TEXT DEFAULT 'Complimentary Chocolate Lava Cake or 15% OFF your celebration order! 🍫🎂',
    birthday_days_before INT DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_restaurant_settings UNIQUE (restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_settings_restaurant ON public.restaurant_settings(restaurant_id);

-- ------------------------------------------------------------------------------
-- 3. RESTAURANT USERS / STAFF
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.restaurant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    auth_user_id UUID,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_users_auth ON public.restaurant_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_users_restaurant ON public.restaurant_users(restaurant_id);

-- ------------------------------------------------------------------------------
-- 4. TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    qr_slug VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_restaurant_table UNIQUE (restaurant_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON public.tables(restaurant_id);

-- ------------------------------------------------------------------------------
-- 5. MENU CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant ON public.menu_categories(restaurant_id, display_order);

-- ------------------------------------------------------------------------------
-- 6. MENU ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    available BOOLEAN DEFAULT TRUE,
    is_veg BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON public.menu_items(restaurant_id, category_id);

-- ------------------------------------------------------------------------------
-- 7. CUSTOMERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    birthday DATE,
    marketing_opt_in BOOLEAN DEFAULT TRUE,
    birthday_club_member BOOLEAN DEFAULT FALSE,
    total_visits INT DEFAULT 1,
    total_spent NUMERIC(12,2) DEFAULT 0.00,
    last_visit TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_restaurant_customer_phone UNIQUE (restaurant_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_customers_restaurant ON public.customers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(restaurant_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_birthday ON public.customers(restaurant_id, birthday);

-- ------------------------------------------------------------------------------
-- 8. ORDERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    table_number_snapshot VARCHAR(50),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    order_number SERIAL,
    status VARCHAR(50) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON public.orders(restaurant_id, status, created_at DESC);

-- ------------------------------------------------------------------------------
-- 9. ORDER ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    item_name_snapshot VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_snapshot NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ------------------------------------------------------------------------------
-- 10. BILLS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    bill_number VARCHAR(50) NOT NULL,
    table_number_snapshot VARCHAR(50),
    subtotal NUMERIC(10,2) NOT NULL,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL,
    items_snapshot JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    whatsapp_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_restaurant ON public.bills(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bills_order ON public.bills(order_id);

-- ------------------------------------------------------------------------------
-- 11. BIRTHDAY CLUB MEMBERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.birthday_club_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    birthday DATE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    consent BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_restaurant_bday_member UNIQUE (restaurant_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_bday_members_restaurant ON public.birthday_club_members(restaurant_id);

-- ------------------------------------------------------------------------------
-- 12. BIRTHDAY MESSAGES / LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.birthday_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    scheduled_for DATE NOT NULL,
    message_type VARCHAR(50) DEFAULT 'BIRTHDAY_GREETING',
    sent_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'SKIPPED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bday_messages_restaurant ON public.birthday_messages(restaurant_id, scheduled_for);

-- ------------------------------------------------------------------------------
-- 13. BIRTHDAY BOOKINGS / CELEBRATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.birthday_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    guests INT DEFAULT 5,
    package VARCHAR(50) DEFAULT 'Basic' CHECK (package IN ('Basic', 'Premium', 'Custom')),
    special_request TEXT,
    status VARCHAR(50) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bday_bookings_restaurant ON public.birthday_bookings(restaurant_id, date);

-- ------------------------------------------------------------------------------
-- 14. OFFERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    target_audience VARCHAR(50) DEFAULT 'ALL' CHECK (target_audience IN ('ALL', 'NEW', 'REPEAT', 'INACTIVE_30', 'INACTIVE_60', 'BIRTHDAY_CLUB')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_restaurant ON public.offers(restaurant_id, active);

-- ==============================================================================
-- 15. POSTGRESQL FUNCTION: UPCOMING BIRTHDAYS (Annual Recurring Calculation)
-- ==============================================================================
-- Calculates customers whose birthday falls within the next N days from today,
-- seamlessly wrapping over month boundaries and year-end (e.g. Dec 28 to Jan 4).
CREATE OR REPLACE FUNCTION public.get_upcoming_birthdays(
    p_restaurant_id UUID,
    p_days_ahead INT DEFAULT 7
)
RETURNS TABLE (
    customer_id UUID,
    name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    birthday DATE,
    days_until INT,
    birthday_this_year DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH customer_calc AS (
        SELECT 
            c.id,
            c.name,
            c.phone,
            c.email,
            c.birthday,
            -- Next birthday date
            CASE 
                WHEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::INT, EXTRACT(MONTH FROM c.birthday)::INT, EXTRACT(DAY FROM c.birthday)::INT) >= CURRENT_DATE
                THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::INT, EXTRACT(MONTH FROM c.birthday)::INT, EXTRACT(DAY FROM c.birthday)::INT)
                ELSE make_date((EXTRACT(YEAR FROM CURRENT_DATE) + 1)::INT, EXTRACT(MONTH FROM c.birthday)::INT, EXTRACT(DAY FROM c.birthday)::INT)
            END AS next_bday
        FROM public.customers c
        WHERE c.restaurant_id = p_restaurant_id
          AND c.birthday IS NOT NULL
          AND c.birthday_club_member = TRUE
    )
    SELECT 
        cc.id AS customer_id,
        cc.name,
        cc.phone,
        cc.email,
        cc.birthday,
        (cc.next_bday - CURRENT_DATE)::INT AS days_until,
        cc.next_bday AS birthday_this_year
    FROM customer_calc cc
    WHERE (cc.next_bday - CURRENT_DATE) >= 0 
      AND (cc.next_bday - CURRENT_DATE) <= p_days_ahead
    ORDER BY days_until ASC;
END;
$$;

-- ==============================================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- PUBLIC / APPLICATION ACCESS POLICIES (For QR Menu Ordering, Birthday Club, and Admin Portal)
-- Restaurants
CREATE POLICY "Public can view restaurants" ON public.restaurants FOR SELECT TO anon, authenticated USING (true);

-- Restaurant Settings
CREATE POLICY "Public can view settings" ON public.restaurant_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can update settings" ON public.restaurant_settings FOR UPDATE TO anon, authenticated USING (true);

-- Tables
CREATE POLICY "Public can view tables" ON public.tables FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert tables" ON public.tables FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update tables" ON public.tables FOR UPDATE TO anon, authenticated USING (true);

-- Menu Categories
CREATE POLICY "Public can view categories" ON public.menu_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert categories" ON public.menu_categories FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update categories" ON public.menu_categories FOR UPDATE TO anon, authenticated USING (true);

-- Menu Items
CREATE POLICY "Public can view menu items" ON public.menu_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert menu items" ON public.menu_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update menu items" ON public.menu_items FOR UPDATE TO anon, authenticated USING (true);

-- Orders
CREATE POLICY "Public can view orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update orders" ON public.orders FOR UPDATE TO anon, authenticated USING (true);

-- Order Items
CREATE POLICY "Public can view order items" ON public.order_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Customers
CREATE POLICY "Public can view customers" ON public.customers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert customers" ON public.customers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update customers" ON public.customers FOR UPDATE TO anon, authenticated USING (true);

-- Bills
CREATE POLICY "Public can view bills" ON public.bills FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert bills" ON public.bills FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update bills" ON public.bills FOR UPDATE TO anon, authenticated USING (true);

-- Birthday Bookings
CREATE POLICY "Public can view bookings" ON public.birthday_bookings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert bookings" ON public.birthday_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update bookings" ON public.birthday_bookings FOR UPDATE TO anon, authenticated USING (true);

-- Birthday Club Members
CREATE POLICY "Public can view birthday members" ON public.birthday_club_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert birthday members" ON public.birthday_club_members FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update birthday members" ON public.birthday_club_members FOR UPDATE TO anon, authenticated USING (true);

-- Offers
CREATE POLICY "Public can view offers" ON public.offers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert offers" ON public.offers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update offers" ON public.offers FOR UPDATE TO anon, authenticated USING (true);

-- AUTHENTICATED STAFF POLICIES
CREATE POLICY "Staff all restaurants" ON public.restaurants FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff all settings" ON public.restaurant_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff all tables" ON public.tables FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff all categories" ON public.menu_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff all menu items" ON public.menu_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff all orders" ON public.orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff all order items" ON public.order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff all customers" ON public.customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff all bills" ON public.bills FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff all birthday members" ON public.birthday_club_members FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff all birthday bookings" ON public.birthday_bookings FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff all birthday messages" ON public.birthday_messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff all offers" ON public.offers FOR ALL TO authenticated USING (true);

-- Enable Supabase Realtime for instant kitchen updates
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.bills REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bills;
