# 🌐 Vercel Free-Tier Deployment Guide ($0 Hosting)

Deploy the multi-tenant cafe SaaS to Vercel's Free Hobby tier with zero monthly cost and no custom domain required.

---

## 1. Push to GitHub (Free Private or Public Repository)

1. Create a repository on [github.com](https://github.com) (e.g., `quick-bite-cafe-saas`).
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial release: Multi-tenant Cafe QR Ordering & WhatsApp SaaS"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/quick-bite-cafe-saas.git
   git push -u origin main
   ```

---

## 2. Import Project into Vercel

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** $\to$ **Project**.
3. Locate `quick-bite-cafe-saas` and click **Import**.
4. Framework Preset will automatically detect **Next.js**.
5. Leave Root Directory as `./`.

---

## 3. Configure Environment Variables in Vercel

Under **Environment Variables**, add the following keys from your Supabase project:

| Variable Name | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Anonymous Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase Service Role Secret Key |
| `NEXT_PUBLIC_APP_URL` | `https://quick-bite-demo.vercel.app` | Your Vercel generated URL (or update after deploy) |
| `NEXT_PUBLIC_DEMO_MODE` | `false` (or `true` if demonstrating without Supabase) | Dual-mode fallback |

---

## 4. Deploy

1. Click **Deploy**.
2. Vercel will build the Next.js production bundle (typically completes in 60-90 seconds).
3. Once deployed, you receive a free live URL:
   `https://quick-bite-demo.vercel.app`

---

## 5. Live Pitch Walkthrough on Vercel

1. Open `/admin/tables` on your laptop or phone.
2. Select **Table 01** and click **Download QR** or display the QR on screen.
3. Have the cafe owner scan the QR code using their iPhone or Android camera.
4. It opens:
   `https://quick-bite-demo.vercel.app/r/quick-bite/t/01`
5. Place an order $\to$ Watch it appear on the admin dashboard $\to$ Generate Bill $\to$ Send WhatsApp receipt via Click-to-Chat!
