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
   - This creates all 14 tables (`restaurants`, `tables`, `orders`, `customers`, `bills`, `birthday_club_members`, etc.).
   - This sets up Row Level Security (RLS) policies.
   - This registers the `get_upcoming_birthdays` annual date calculator function.
   - This adds the `orders` table to `supabase_realtime`.
4. Click **New query** again.
5. Open `supabase/seed.sql`, copy all lines, paste into the editor, and click **Run**.
   - This creates **Quick Bite Cafe** (`slug: quick-bite`) with categories (Burgers, Pizzas, Snacks, Shakes, Desserts), menu items with photos, tables 01–06, default WhatsApp receipt templates, and sample customers (including Pooja Patel with birthday in 7 days).
   - This creates **Urban Brew Co.** to demonstrate live multi-tenant data isolation.

---

## 3. Enable Supabase Realtime (For Instant Order Updates)

1. In your Supabase Dashboard, click on **Database** $\to$ **Replication**.
2. Find the `supabase_realtime` publication.
3. Ensure the `orders` table has replication toggled **ON** (our `schema.sql` automatically runs `ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;`).

---

## 4. Get Your API Keys

1. In Supabase, click on **Project Settings** (gear icon) $\to$ **API**.
2. Copy:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Project API Keys** $\to$ `anon` / `public`
   - **Project API Keys** $\to$ `service_role` (keep secret!)

---

## 5. Configure Local Environment (`.env.local`)

In the root of your project, create or copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=false
```

---

## 6. Verify Connection

Start the development server:
```bash
npm run dev
```

Open `http://localhost:3000/r/quick-bite/t/01` in your browser. You will see the Quick Bite Cafe menu ready to order!
