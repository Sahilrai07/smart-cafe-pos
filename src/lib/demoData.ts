import {
  Restaurant,
  RestaurantSettings,
  Table,
  MenuCategory,
  MenuItem,
  Customer,
  Order,
  BirthdayBooking,
  Offer,
} from '@/types';

export const DEMO_RESTAURANTS: Restaurant[] = [
  {
    id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    name: 'Quick Bite Cafe',
    slug: 'quick-bite',
    logo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210',
    whatsapp_number: '+919876543210',
    email: 'hello@quickbitecafe.demo',
    address: 'Shop 14, High Street Avenue, Near Central Park',
  },
  {
    id: 'f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e',
    name: 'Urban Brew Co.',
    slug: 'urban-brew',
    logo_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
    phone: '+91 91234 56789',
    whatsapp_number: '+919123456789',
    email: 'contact@urbanbrew.demo',
    address: 'Block B, Tech Hub Galleria, Sector 4',
  },
];

export const DEMO_SETTINGS: Record<string, RestaurantSettings> = {
  'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d': {
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    currency: '₹',
    tax_enabled: true,
    tax_percentage: 5.0,
    birthday_days_before: 7,
    birthday_offer_text: 'Complimentary Chocolate Lava Cake or 15% OFF your celebration bill! 🍫🎂',
    bill_message_template: `Hey {customer_name} 👋\n\nThanks for visiting *{restaurant_name}*!\n\n🧾 *Your Bill (#{bill_number}):*\n{items_list}\n\nSubtotal: {currency}{subtotal}\nGST ({tax_percentage}%): {currency}{tax}\n*Total: {currency}{total}*\n\nThank you for visiting! ❤️\nWe hope to see you again soon.\n\n🎂 Join our Birthday Club for a special treat: {birthday_club_link}`,
    birthday_message_template: `Hey {customer_name}! 🎉🎂\n\nYour birthday is coming up in {days_before} days!\n\nWe would love to celebrate with you at *{restaurant_name}*. ❤️\n\n🎁 *Your Birthday Gift:* {birthday_offer}\n\nShow this message when you visit us to claim your special surprise! 🥳`,
  },
  'f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e': {
    restaurant_id: 'f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e',
    currency: '₹',
    tax_enabled: true,
    tax_percentage: 5.0,
    birthday_days_before: 7,
    birthday_offer_text: 'Free artisanal cookie with any pour-over coffee!',
    bill_message_template: `Hey {customer_name}! Thanks for visiting Urban Brew Co.\nYour Bill #{bill_number} Total: {currency}{total}`,
    birthday_message_template: `Happy Birthday soon, {customer_name}! Enjoy a free beverage at Urban Brew Co.!`,
  },
};

export const DEMO_TABLES: Table[] = [
  { id: 'b1111111-1111-1111-1111-111111111101', restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', table_number: '01', qr_slug: '01', active: true },
  { id: 'b1111111-1111-1111-1111-111111111102', restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', table_number: '02', qr_slug: '02', active: true },
  { id: 'b1111111-1111-1111-1111-111111111103', restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', table_number: '03', qr_slug: '03', active: true },
  { id: 'b1111111-1111-1111-1111-111111111104', restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', table_number: '04', qr_slug: '04', active: true },
  { id: 'b1111111-1111-1111-1111-111111111105', restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', table_number: '05', qr_slug: '05', active: true },
  { id: 'b1111111-1111-1111-1111-111111111106', restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', table_number: '06', qr_slug: '06', active: true },
  // Urban Brew tables
  { id: 'b2222222-2222-2222-2222-222222222201', restaurant_id: 'f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e', table_number: 'T-01', qr_slug: '01', active: true },
  { id: 'b2222222-2222-2222-2222-222222222202', restaurant_id: 'f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e', table_number: 'T-02', qr_slug: '02', active: true },
];

export const DEMO_CATEGORIES: MenuCategory[] = [
  { id: 'c1111111-1111-1111-1111-111111111101', restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', name: 'Burgers & Sandwiches', display_order: 1, active: true },
  { id: 'c1111111-1111-1111-1111-111111111102', restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', name: 'Pizzas & Breads', display_order: 2, active: true },
  { id: 'c1111111-1111-1111-1111-111111111103', restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', name: 'Crispy Snacks & Fries', display_order: 3, active: true },
  { id: 'c1111111-1111-1111-1111-111111111104', restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', name: 'Beverages & Shakes', display_order: 4, active: true },
  { id: 'c1111111-1111-1111-1111-111111111105', restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', name: 'Desserts & Sweets', display_order: 5, active: true },
  // Urban Brew category
  { id: 'c2222222-2222-2222-2222-222222222201', restaurant_id: 'f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e', name: 'Artisanal Coffee', display_order: 1, active: true },
];

export const DEMO_MENU_ITEMS: MenuItem[] = [
  // Quick Bite Burgers
  {
    id: 'd1111111-1111-1111-1111-111111111101',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    category_id: 'c1111111-1111-1111-1111-111111111101',
    name: 'Classic Veg Burger',
    description: 'Crispy spiced potato & herb patty with fresh lettuce, mayo, and toasted sesame buns.',
    price: 120.0,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    available: true,
    is_veg: true,
    display_order: 1,
  },
  {
    id: 'd1111111-1111-1111-1111-111111111102',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    category_id: 'c1111111-1111-1111-1111-111111111101',
    name: 'Cheese Burst Burger',
    description: 'Melted cheddar core patty with house special smoky burger sauce.',
    price: 160.0,
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80',
    available: true,
    is_veg: true,
    display_order: 2,
  },
  {
    id: 'd1111111-1111-1111-1111-111111111103',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    category_id: 'c1111111-1111-1111-1111-111111111101',
    name: 'Grilled Paneer Tikka Sandwich',
    description: 'Tandoori spiced paneer cubes grilled between buttered multi-grain bread.',
    price: 140.0,
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
    available: true,
    is_veg: true,
    display_order: 3,
  },
  // Quick Bite Pizzas
  {
    id: 'd1111111-1111-1111-1111-111111111104',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    category_id: 'c1111111-1111-1111-1111-111111111102',
    name: 'Margherita Supreme Pizza (8")',
    description: 'Classic Italian tomato marinara, fresh basil, and loads of golden mozzarella cheese.',
    price: 210.0,
    image_url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=80',
    available: true,
    is_veg: true,
    display_order: 1,
  },
  {
    id: 'd1111111-1111-1111-1111-111111111105',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    category_id: 'c1111111-1111-1111-1111-111111111102',
    name: 'Farmhouse Veggie Pizza (8")',
    description: 'Crisp bell peppers, red onion, sweet corn, black olives, and jalapenos.',
    price: 260.0,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    available: true,
    is_veg: true,
    display_order: 2,
  },
  // Snacks
  {
    id: 'd1111111-1111-1111-1111-111111111106',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    category_id: 'c1111111-1111-1111-1111-111111111103',
    name: 'Crispy Golden Salted Fries',
    description: 'Classic deep-fried shoestring potato fries lightly tossed in sea salt.',
    price: 60.0,
    image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80',
    available: true,
    is_veg: true,
    display_order: 1,
  },
  {
    id: 'd1111111-1111-1111-1111-111111111107',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    category_id: 'c1111111-1111-1111-1111-111111111103',
    name: 'Peri Peri Spice Fries',
    description: 'Golden french fries dusted in our secret fiery African peri peri seasoning.',
    price: 80.0,
    image_url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500&auto=format&fit=crop&q=80',
    available: true,
    is_veg: true,
    display_order: 2,
  },
  // Beverages
  {
    id: 'd1111111-1111-1111-1111-111111111109',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    category_id: 'c1111111-1111-1111-1111-111111111104',
    name: 'Chilled Coke (Can)',
    description: 'Ice-cold refreshing Coca Cola 300ml can.',
    price: 40.0,
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
    available: true,
    is_veg: true,
    display_order: 1,
  },
  {
    id: 'd1111111-1111-1111-1111-111111111110',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    category_id: 'c1111111-1111-1111-1111-111111111104',
    name: 'Thick Belgian Chocolate Shake',
    description: 'Rich creamy whole milk blended with dark Belgian chocolate ganache.',
    price: 140.0,
    image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
    available: true,
    is_veg: true,
    display_order: 2,
  },
  // Desserts
  {
    id: 'd1111111-1111-1111-1111-111111111112',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    category_id: 'c1111111-1111-1111-1111-111111111105',
    name: 'Molten Chocolate Lava Cake',
    description: 'Warm chocolate cake with a gooey erupting molten chocolate heart.',
    price: 90.0,
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
    available: true,
    is_veg: true,
    display_order: 1,
  },
  // Urban Brew items
  {
    id: 'd2222222-2222-2222-2222-222222222201',
    restaurant_id: 'f2b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e',
    category_id: 'c2222222-2222-2222-2222-222222222201',
    name: 'Spanish Cortado',
    description: 'Equal parts espresso and warm silky steamed milk.',
    price: 180.0,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    available: true,
    is_veg: true,
  },
];

// Helper to calculate a date N days from now formatted YYYY-MM-DD
function getDateDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'e1111111-1111-1111-1111-111111111101',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    name: 'Rahul Sharma',
    phone: '+919876543210',
    email: 'rahul@example.com',
    birthday: '1998-10-20',
    marketing_opt_in: true,
    birthday_club_member: true,
    total_visits: 3,
    total_spent: 1140.0,
    last_visit: '2026-09-14T19:30:00Z',
  },
  {
    id: 'e1111111-1111-1111-1111-111111111102',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    name: 'Pooja Patel',
    phone: '+919812345678',
    email: 'pooja@example.com',
    // Exactly 7 days from today! Triggers upcoming 7-day birthday reminder immediately
    birthday: getDateDaysFromNow(7),
    marketing_opt_in: true,
    birthday_club_member: true,
    total_visits: 5,
    total_spent: 2450.0,
    last_visit: '2026-09-15T14:15:00Z',
  },
  {
    id: 'e1111111-1111-1111-1111-111111111103',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    name: 'Amit Verma',
    phone: '+919700012345',
    email: 'amit@example.com',
    birthday: '2001-05-14',
    marketing_opt_in: true,
    birthday_club_member: false,
    total_visits: 1,
    total_spent: 380.0,
    last_visit: '2026-09-11T12:00:00Z',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1040',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    table_id: 'b1111111-1111-1111-1111-111111111102',
    table_number_snapshot: '02',
    order_number: 1040,
    status: 'COMPLETED',
    subtotal: 350.0,
    tax: 17.5,
    discount: 0,
    total: 367.5,
    items: [
      {
        item_name_snapshot: 'Farmhouse Veggie Pizza (8")',
        quantity: 1,
        unit_price_snapshot: 260.0,
        total: 260.0,
      },
      {
        item_name_snapshot: 'Molten Chocolate Lava Cake',
        quantity: 1,
        unit_price_snapshot: 90.0,
        total: 90.0,
      },
    ],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'ord-1041',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    table_id: 'b1111111-1111-1111-1111-111111111104',
    table_number_snapshot: '04',
    order_number: 1041,
    status: 'PREPARING',
    subtotal: 260.0,
    tax: 13.0,
    discount: 0,
    total: 273.0,
    items: [
      {
        item_name_snapshot: 'Classic Veg Burger',
        quantity: 1,
        unit_price_snapshot: 120.0,
        total: 120.0,
      },
      {
        item_name_snapshot: 'Chilled Coke (Can)',
        quantity: 2,
        unit_price_snapshot: 40.0,
        total: 80.0,
      },
      {
        item_name_snapshot: 'Crispy Golden Salted Fries',
        quantity: 1,
        unit_price_snapshot: 60.0,
        total: 60.0,
      },
    ],
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
];

export const INITIAL_BOOKINGS: BirthdayBooking[] = [
  {
    id: 'book-1',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    customer_name: 'Simran Kaur',
    phone: '+919988776655',
    date: getDateDaysFromNow(5),
    time: '7:30 PM',
    guests: 10,
    package: 'Premium',
    special_request: 'Please arrange fairy lights and chocolate truffle cake! 🎂✨',
    status: 'NEW',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'off-1',
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    title: 'Weekend BOGO on Shakes! 🥤',
    message: 'Hey {customer_name}! Beat the heat with Buy-One-Get-One on all Belgian Shakes this weekend at Quick Bite Cafe! 🥤✨',
    start_date: getDateDaysFromNow(0),
    end_date: getDateDaysFromNow(14),
    target_audience: 'ALL',
    active: true,
  },
];
