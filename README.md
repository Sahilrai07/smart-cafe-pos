# ☕ Quick Bite Cafe & Restaurant SaaS
### Reusable Multi-Tenant Digital QR Ordering, Billing, Customer Database & WhatsApp Birthday Club System

[![Hosting: Vercel Free](https://img.shields.io/badge/Hosting-Vercel%20Hobby%20($0)-black?logo=vercel)](https://vercel.com)
[![Database: Supabase Free](https://img.shields.io/badge/Database-Supabase%20Postgres%20($0)-emerald?logo=supabase)](https://supabase.com)
[![WhatsApp: Click--to--Chat](https://img.shields.io/badge/WhatsApp-Click--to--Chat%20($0)-green?logo=whatsapp)](https://wa.me)
[![QR Code: Client--Side](https://img.shields.io/badge/QR%20Code-Client--Side%20SVG/PNG%20($0)-blue)](https://github.com)

A production-ready, reusable SaaS product designed for cafes and casual dining restaurants. Built to be pitched live to cafe owners with **zero monthly infrastructure costs** — no paid WhatsApp API, no paid SMS, no paid email CRM, no paid domains, and no paid hosting.

---

## 🎯 The Core Pitch Flow (Live Demo Sequence)

When demonstrating this product to a cafe owner, follow this exact 2-minute live sequence:

```text
1. TABLE QR CODE
   Cafe owner or friend scans Table 01 QR code from phone camera.
   URL: https://your-demo.vercel.app/r/quick-bite/t/01

2. MOBILE-FIRST MENU (No Login Required!)
   Customer instantly sees Quick Bite Cafe's menu.
   Customer selects: Classic Veg Burger (₹120) + Chilled Coke x2 (₹80) + Crispy Fries (₹60).

3. CART & ORDER PLACEMENT
   Customer reviews cart (Subtotal ₹260 + 5% GST = ₹273) and taps "Place Order".
   Screen transitions to Live Order Tracker with animated status.

4. REAL-TIME KITCHEN DASHBOARD
   On your phone/tablet/laptop, open `/admin/orders`.
   The new order #1042 appears instantly with an audio chime and "NEW ORDER" badge!
   Staff clicks: "Accept" ➔ "Preparing" ➔ "Ready" ➔ "Generate Bill".

5. DIGITAL BILL & WHATSAPP RECEIPT
   Staff asks: "What name should I put on the bill?" and "Your WhatsApp number?"
   Staff enters: Rahul (+91 9876543210).
   Staff clicks: "Send Bill on WhatsApp".
   WhatsApp immediately opens with a pre-filled, beautifully formatted receipt!
   Staff simply presses Send.

6. CUSTOMER DATABASE (CRM)
   Show the cafe owner the `/admin/customers` tab:
   Rahul is now automatically enrolled in their customer database with 1 visit and ₹273 total spend!
   Explain: "Every normal order builds your cafe's permanent marketing database automatically."

7. BIRTHDAY CLUB & 7-DAY AUTOMATIC REMINDER
   Show the `/admin/birthday-club` tab:
   Customer Pooja Patel's birthday is 7 days from today.
   The system automatically flags her under "Upcoming Birthdays (Next 7 Days)".
   Staff clicks: "Send Birthday Message" ➔ WhatsApp opens with a pre-filled birthday greeting and special offer!
```

---

## 💰 100% Free-Tier & Zero Cost Guarantee

This project is specifically engineered so that you can pitch it to dozens of cafes without paying monthly software subscriptions:

| Feature | Traditional Paid Way | **Our $0 Zero-Cost Solution** |
|---|---|---|
| **Web Hosting** | Paid AWS/VPS ($15–$50/mo) | **Vercel Hobby Tier ($0/mo)** |
| **Database & Auth** | Paid RDS/Cloud SQL ($25/mo) | **Supabase Free Tier ($0/mo)** |
| **WhatsApp Messages** | Paid Meta API ($0.05 per msg + verification) | **WhatsApp Click-to-Chat `wa.me/` ($0/mo)** |
| **SMS Notifications** | Paid Twilio ($0.08 per SMS) | **Direct WhatsApp Click-to-Chat ($0/mo)** |
| **QR Code Generation** | Paid Dynamic QR Services ($15/mo) | **Client-side SVG/PNG Canvas generator ($0/mo)** |
| **Custom Domain** | Paid Domain ($12–$20/yr) | **Free `*.vercel.app` subdomain ($0)** |

---

## 🏗️ Multi-Tenant Architecture

The codebase is strictly multi-tenant. You can onboard Cafe A, Cafe B, and Cafe C on the same deployment without touching a single line of code.

### URL Structure
- Customer Menu (General): `/r/[restaurant-slug]`
- Table Ordering (Direct): `/r/[restaurant-slug]/t/[table-number]` (e.g. `/r/quick-bite/t/01`)
- Customer Digital Bill View: `/r/[restaurant-slug]/bill/[bill-id]`
- Birthday Celebration Inquiry: `/r/[restaurant-slug]/celebrate`
- Admin & Staff Dashboard: `/admin` (includes a live Restaurant Switcher to test multi-tenancy)

### Database Foreign Key Partitioning
Every entity in the PostgreSQL schema references `restaurant_id`:
- `restaurants` $\to$ `restaurant_settings`
- `restaurants` $\to$ `tables`
- `restaurants` $\to$ `menu_categories` $\to$ `menu_items`
- `restaurants` $\to$ `orders` $\to$ `order_items`
- `restaurants` $\to$ `bills`
- `restaurants` $\to$ `customers` $\to$ `birthday_club_members`
- `restaurants` $\to$ `birthday_bookings`
- `restaurants` $\to$ `offers`

---

## 🎂 Birthday Club Engine

- **Frictionless Onboarding**: Customers can join the Birthday Club with just their date of birth after ordering or via table link.
- **Annual Recurring Calculation**: Uses PostgreSQL date math (and matching TypeScript utility) to identify birthdays within `N` days (default 7 days) **every single year**, automatically handling month ends and leap/year transitions without manual reminders.
- **WhatsApp Click-to-Chat Greeting**: Generates personalized birthday wishes with cafe offer text (`wa.me`) ready to send with one click.

---

## 🛠️ Onboarding a New Cafe (Step-by-Step)

To add a new cafe (e.g. "Cafe Nirvana", slug `cafe-nirvana`):

1. **Insert Restaurant Record**:
   ```sql
   INSERT INTO public.restaurants (name, slug, phone, whatsapp_number, address)
   VALUES ('Cafe Nirvana', 'cafe-nirvana', '+91 99999 88888', '+919999988888', '12 Lake View Road');
   ```
2. **Insert Settings**:
   ```sql
   INSERT INTO public.restaurant_settings (restaurant_id, currency, tax_percentage)
   VALUES ((SELECT id FROM public.restaurants WHERE slug = 'cafe-nirvana'), '₹', 5.0);
   ```
3. **Add Tables & Menu**:
   Add tables (`01`, `02`, `03`) and categories/items either via SQL or directly through the `/admin/menu` and `/admin/tables` dashboard!
4. **Generate Table QRs**:
   Visit `/admin/tables`, select Cafe Nirvana, and download print-ready QR codes for tables `01`, `02`, etc.

---

## 🚀 Quick Start (Local Development)

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *(Note: If you leave `NEXT_PUBLIC_DEMO_MODE=true`, the entire application runs with a high-fidelity local demo store with Quick Bite Cafe data!)*
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser:
   - Customer Table 01: [http://localhost:3000/r/quick-bite/t/01](http://localhost:3000/r/quick-bite/t/01)
   - Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)
   - Staff Login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 📄 Documentation Files

- [SUPABASE_SETUP.md](file:///c:/Users/arpan/Desktop/Project/SUPABASE_SETUP.md) — Free Supabase database, schema migration & seed setup.
- [VERCEL_DEPLOYMENT.md](file:///c:/Users/arpan/Desktop/Project/VERCEL_DEPLOYMENT.md) — Free Vercel hobby deployment guide.
- [.env.example](file:///c:/Users/arpan/Desktop/Project/.env.example) — Template for all required environment variables.
