# 🚀 Supabase Free-Tier Setup Guide

This guide walks you through setting up the free Supabase PostgreSQL database, applying the schema, loading the pitch demo data for **Quick Bite Cafe**, and configuring environment variables.

---

## 1. Create a Free Supabase Project

1. Visit [supabase.com](https://supabase.com) and click **Start your project** (or sign in).
2. Click **New Project** and select the free organization.
3. Name your project: `quick-bite-cafe-saas` (or any name you prefer).
4. Generate a strong Database Password and choose a region close to your primary audience (e.g., *Mumbai / ap-south-1* or *Singapore*).
5. Choose the **Free Plan** ($0/month).
6. Click **Create new project** and wait 1–2 minutes for provisioning.

---

## 2. Execute Database Schema & Seed Data

1. In your Supabase Project Dashboard, click on **SQL Editor** in the left navigation sidebar.
2. Click **New query** (or `+`).
3. Open `supabase/schema.sql` from this repository, copy the entire SQL script, paste it into the editor, and click **Run** (green button).
   - This creates all 14 tables (`restaurants`, `tables`, `orders`, `order_items`, `customers`, `bills`, `birthday_club_members`, etc.).
   - This sets up comprehensive Row Level Security (RLS) policies allowing customer QR ordering and admin dashboard operations.
   - This registers the `get_upcoming_birthdays` annual date calculator PostgreSQL function.
   - This configures `REPLICA IDENTITY FULL` on `public.orders` and publishes `orders` and `bills` to `supabase_realtime`.
4. Click **New query** again.
5. Open `supabase/seed.sql`, copy all lines, paste into the editor, and click **Run**.
   - This creates **Quick Bite Cafe** (`slug: quick-bite`) with categories (Burgers, Pizzas, Snacks, Shakes, Desserts), menu items with photos, tables 01–06, default WhatsApp receipt templates, and sample customers (including Pooja Patel with birthday in 7 days).
   - This creates **Urban Brew Co.** (`slug: urban-brew`) to demonstrate live multi-tenant data isolation.

---

## 3. Enable Supabase Realtime (For Instant Kitchen Orders)

Our `schema.sql` automatically executes:
```sql
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.bills REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bills;
```

To verify via the Supabase UI:
1. In your Supabase Dashboard, click on **Database** $\to$ **Replication** (or Publications).
2. Click on the `supabase_realtime` publication.
3. Ensure the `orders` and `bills` tables have replication enabled (**ON**).

---

## 4. Get Your API Keys

1. In Supabase, click on **Project Settings** (gear icon) $\to$ **API**.
2. Copy:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Project API Keys** $\to$ `anon` / `public`
   - **Project API Keys** $\to$ `service_role` (optional, for secure server-side routes)

---

## 5. Configure Local Environment (`.env.local`)

In the root of your project, create or copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** If `.env.local` is not configured, the application runs gracefully in local fallback simulation mode with clear console notices, ensuring offline development is always possible. Once configured with real credentials, all reads and writes go directly to Supabase PostgreSQL.

---

## 6. Verify Connection & Run Locally

1. Start the development server:
```bash
npm run dev
```

2. Open the customer QR ordering flow:
`http://localhost:3000/r/quick-bite/t/01`

3. Open the admin live kitchen display:
`http://localhost:3000/admin/orders`

4. Place an order from the customer view:
   - The server validates prices against the database.
   - The order row and line items are inserted into Supabase.
   - The admin live kitchen dashboard receives the order in real-time via Supabase Realtime without manual refresh!

