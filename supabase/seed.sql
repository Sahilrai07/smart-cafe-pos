-- ==============================================================================
-- DEMO SEED DATA: Quick Bite Cafe & Multi-Tenant Demo
-- Zero-Cost, Pitch-Ready, Realistic Menu & Tables
-- ==============================================================================

-- 1. QUICK BITE CAFE (Primary Demo Cafe)
INSERT INTO public.restaurants (id, name, slug, logo_url, phone, whatsapp_number, email, address)
VALUES (
    'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    'Quick Bite Cafe',
    'quick-bite',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80',
    '+91 98765 43210',
    '+919876543210',
    'hello@quickbitecafe.demo',
    'Shop 14, High Street Avenue, Near Central Park'
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Settings for Quick Bite Cafe
INSERT INTO public.restaurant_settings (
    restaurant_id, currency, tax_enabled, tax_percentage,
    birthday_days_before, birthday_offer_text,
    bill_message_template, birthday_message_template
) VALUES (
    'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    '₹',
    TRUE,
    5.00,
    7,
    'Complimentary Chocolate Lava Cake or 15% OFF your celebration bill! 🍫🎂',
    'Hey {customer_name} 👋\n\nThanks for visiting *{restaurant_name}*!\n\n🧾 *Your Bill (#{bill_number}):*\n{items_list}\n\nSubtotal: {currency}{subtotal}\nGST ({tax_percentage}%): {currency}{tax}\n*Total: {currency}{total}*\n\nThank you for visiting! ❤️\nWe hope to see you again soon.\n\n🎂 Join our Birthday Club for a special treat: {birthday_club_link}',
    'Hey {customer_name}! 🎉🎂\n\nYour birthday is coming up in {days_before} days!\n\nWe would love to celebrate with you at *{restaurant_name}*. ❤️\n\n🎁 *Your Birthday Gift:* {birthday_offer}\n\nShow this message when you visit us to claim your special surprise! 🥳'
) ON CONFLICT (restaurant_id) DO NOTHING;

-- Tables for Quick Bite Cafe
INSERT INTO public.tables (id, restaurant_id, table_number, qr_slug, active)
VALUES
    ('b1111111-1111-1111-1111-111111111101', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', '01', '01', TRUE),
    ('b1111111-1111-1111-1111-111111111102', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', '02', '02', TRUE),
    ('b1111111-1111-1111-1111-111111111103', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', '03', '03', TRUE),
    ('b1111111-1111-1111-1111-111111111104', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', '04', '04', TRUE),
    ('b1111111-1111-1111-1111-111111111105', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', '05', '05', TRUE),
    ('b1111111-1111-1111-1111-111111111106', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', '06', '06', TRUE)
ON CONFLICT DO NOTHING;

-- Categories for Quick Bite Cafe
INSERT INTO public.menu_categories (id, restaurant_id, name, display_order, active)
VALUES
    ('c1111111-1111-1111-1111-111111111101', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Burgers & Sandwiches', 1, TRUE),
    ('c1111111-1111-1111-1111-111111111102', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Pizzas & Breads', 2, TRUE),
    ('c1111111-1111-1111-1111-111111111103', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Crispy Snacks & Fries', 3, TRUE),
    ('c1111111-1111-1111-1111-111111111104', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Beverages & Shakes', 4, TRUE),
    ('c1111111-1111-1111-1111-111111111105', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Desserts & Sweets', 5, TRUE)
ON CONFLICT DO NOTHING;

-- Menu Items for Quick Bite Cafe
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, available, is_veg, display_order)
VALUES
    -- Burgers
    ('d1111111-1111-1111-1111-111111111101', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c1111111-1111-1111-1111-111111111101', 'Classic Veg Burger', 'Crispy spiced potato & herb patty with fresh lettuce, mayo, and toasted sesame buns.', 120.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, 1),
    ('d1111111-1111-1111-1111-111111111102', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c1111111-1111-1111-1111-111111111101', 'Cheese Burst Burger', 'Melted cheddar core patty with house special smoky burger sauce.', 160.00, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, 2),
    ('d1111111-1111-1111-1111-111111111103', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c1111111-1111-1111-1111-111111111101', 'Grilled Paneer Tikka Sandwich', 'Tandoori spiced paneer cubes grilled between buttered multi-grain bread.', 140.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, 3),

    -- Pizzas
    ('d1111111-1111-1111-1111-111111111104', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c1111111-1111-1111-1111-111111111102', 'Margherita Supreme Pizza (8")', 'Classic Italian tomato marinara, fresh basil, and loads of golden mozzarella cheese.', 210.00, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, 1),
    ('d1111111-1111-1111-1111-111111111105', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c1111111-1111-1111-1111-111111111102', 'Farmhouse Veggie Pizza (8")', 'Crisp bell peppers, red onion, sweet corn, black olives, and jalapenos.', 260.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, 2),

    -- Snacks & Fries
    ('d1111111-1111-1111-1111-111111111106', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c1111111-1111-1111-1111-111111111103', 'Crispy Golden Salted Fries', 'Classic deep-fried shoestring potato fries lightly tossed in sea salt.', 60.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, 1),
    ('d1111111-1111-1111-1111-111111111107', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c1111111-1111-1111-1111-111111111103', 'Peri Peri Spice Fries', 'Golden french fries dusted in our secret fiery African peri peri seasoning.', 80.00, 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, 2),
    ('d1111111-1111-1111-1111-111111111108', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c1111111-1111-1111-1111-111111111103', 'Cheesy Loaded Nachos', 'Crunchy corn tortilla chips bathed in warm nacho cheese, salsa, and jalapenos.', 150.00, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, 3),

    -- Beverages
    ('d1111111-1111-1111-1111-111111111109', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c1111111-1111-1111-1111-111111111104', 'Chilled Coke (Can)', 'Ice-cold refreshing Coca Cola 300ml can.', 40.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, 1),
    ('d1111111-1111-1111-1111-111111111110', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c1111111-1111-1111-1111-111111111104', 'Thick Belgian Chocolate Shake', 'Rich creamy whole milk blended with dark Belgian chocolate ganache.', 140.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, 2),
    ('d1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c1111111-1111-1111-1111-111111111104', 'Cold Brew Iced Latte', 'Double shot espresso shaken with chilled milk and a hint of Madagascar vanilla.', 130.00, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, 3),

    -- Desserts
    ('d1111111-1111-1111-1111-111111111112', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'c1111111-1111-1111-1111-111111111105', 'Molten Chocolate Lava Cake', 'Warm chocolate cake with a gooey erupting molten chocolate heart.', 90.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, 1)
ON CONFLICT DO NOTHING;

-- Demo Customers for Quick Bite Cafe
-- Pooja Patel has a birthday set to CURRENT_DATE + 7 DAYS for instantaneous 7-day reminder demo!
INSERT INTO public.customers (
    id, restaurant_id, name, phone, email, birthday, marketing_opt_in, birthday_club_member, total_visits, total_spent, last_visit
) VALUES
    ('e1111111-1111-1111-1111-111111111101', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Rahul Sharma', '+919876543210', 'rahul@example.com', '1998-10-20', TRUE, TRUE, 3, 1140.00, NOW() - INTERVAL '2 days'),
    ('e1111111-1111-1111-1111-111111111102', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Pooja Patel', '+919812345678', 'pooja@example.com', (CURRENT_DATE + INTERVAL '7 days')::DATE, TRUE, TRUE, 5, 2450.00, NOW() - INTERVAL '1 day'),
    ('e1111111-1111-1111-1111-111111111103', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Amit Verma', '+919700012345', 'amit@example.com', '2001-05-14', TRUE, FALSE, 1, 380.00, NOW() - INTERVAL '5 days')
ON CONFLICT (restaurant_id, phone) DO NOTHING;

-- Demo Birthday Bookings
INSERT INTO public.birthday_bookings (
    restaurant_id, customer_name, phone, date, time, guests, package, special_request, status
) VALUES (
    'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    'Simran Kaur',
    '+919988776655',
    CURRENT_DATE + INTERVAL '5 days',
    '7:30 PM',
    10,
    'Premium',
    'Please arrange fairy lights and a chocolate truffle cake! 🎂✨',
    'NEW'
) ON CONFLICT DO NOTHING;

-- Demo Offers
INSERT INTO public.offers (
    restaurant_id, title, message, start_date, end_date, target_audience, active
) VALUES (
    'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    'Weekend BOGO on Shakes! 🥤',
    'Hey {customer_name}! Beat the heat with Buy-One-Get-One on all Belgian Shakes this weekend at Quick Bite Cafe! 🥤✨',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '14 days',
    'ALL',
    TRUE
) ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. SECOND DEMO CAFE (Urban Brew Co.) - Demonstrates Strict Data Isolation
-- ------------------------------------------------------------------------------
INSERT INTO public.restaurants (id, name, slug, logo_url, phone, whatsapp_number, email, address)
VALUES (
    'f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e',
    'Urban Brew Co.',
    'urban-brew',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
    '+91 91234 56789',
    '+919123456789',
    'contact@urbanbrew.demo',
    'Block B, Tech Hub Galleria, Sector 4'
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.restaurant_settings (
    restaurant_id, currency, tax_enabled, tax_percentage
) VALUES (
    'f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e', '₹', TRUE, 5.00
) ON CONFLICT (restaurant_id) DO NOTHING;

INSERT INTO public.tables (restaurant_id, table_number, qr_slug, active)
VALUES
    ('f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e', 'T-01', '01', TRUE),
    ('f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e', 'T-02', '02', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_categories (id, restaurant_id, name, display_order, active)
VALUES
    ('c2222222-2222-2222-2222-222222222201', 'f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e', 'Artisanal Coffee', 1, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_items (restaurant_id, category_id, name, description, price, available, is_veg)
VALUES
    ('f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e', 'c2222222-2222-2222-2222-222222222201', 'Spanish Cortado', 'Equal parts espresso and steamed milk.', 180.00, TRUE, TRUE)
ON CONFLICT DO NOTHING;
