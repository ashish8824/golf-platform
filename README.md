# ⛳ Golf Platform

A subscription-based golf score tracking platform with monthly prize draws and charity giving. Built as a full-stack web application for the Digital Heroes trainee selection assignment.

---

## 🚀 Live Demo

**Production:** [https://golf-platform.vercel.app](https://golf-platform.vercel.app)

**Test Credentials:**

- Email: `8824anand@gmail.com` (Admin)
- Use Stripe test card: `4242 4242 4242 4242` · Expiry: `12/29` · CVC: `123`

---

## 📋 Overview

Golf Platform combines three core features into one subscription:

| Feature           | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| ⛳ Score Tracking | Enter your last 5 Stableford scores — newest replaces oldest   |
| 🎰 Monthly Draw   | Scores become lottery numbers — match 3, 4, or 5 to win prizes |
| 💚 Charity Giving | Minimum 10% of every subscription goes to your chosen charity  |

---

## 🛠️ Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | React 18 + Vite + TypeScript                  |
| Styling    | Tailwind CSS v4                               |
| Database   | Supabase (PostgreSQL)                         |
| Auth       | Supabase Auth (custom JWT session management) |
| Payments   | Stripe Checkout + Webhooks                    |
| Backend    | Supabase Edge Functions (Deno)                |
| Deployment | Vercel (frontend) + Supabase (backend)        |

---

## ✨ Features

### User Features

- **Signup & Login** — email/password auth with session persistence
- **Subscription** — monthly (£9.99) or yearly (£89.99) via Stripe Checkout
- **Score Management** — rolling 5-score Stableford tracker with date validation
- **Monthly Draw** — automatic entry using last 5 scores as lottery numbers
- **Draw Results** — view published draw results and match history
- **Winnings** — track prize history, upload verification proof, view payout status
- **Charity** — choose from supported charities, set donation percentage (10–100%)

### Admin Features

- **Draw Manager** — create, simulate, and publish monthly draws
- **Winner Verifications** — review proof submissions, approve/reject, mark as paid
- **User Management** — view all users, subscription status, roles
- **Reports** — subscription and revenue overview

---

## 📁 Project Structure

```
golf-platform/
├── src/
│   ├── components/
│   │   ├── ui/              # Button, Input (reusable)
│   │   └── layout/          # ProtectedRoute
│   ├── context/
│   │   └── AuthContext.tsx  # Custom JWT auth (no Supabase JS client)
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   └── stripe.ts        # Stripe client
│   ├── pages/
│   │   ├── public/          # LandingPage
│   │   ├── auth/            # LoginPage, SignupPage
│   │   ├── dashboard/       # DashboardPage, ScoresPage, CharityPage,
│   │   │                    # DrawResultsPage, WinningsPage
│   │   └── admin/           # AdminPage, DrawManager, WinnersManager,
│   │                        # UsersManager, ReportsPage
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces matching DB schema
│   └── App.tsx              # Router with protected routes
├── supabase/
│   └── functions/
│       ├── create-checkout/ # Stripe checkout session creation
│       └── stripe-webhook/  # Stripe event handler
├── public/
├── vercel.json              # SPA routing fix
├── vite.config.ts
└── package.json
```

---

## 🗄️ Database Schema

```
profiles          — extends auth.users with subscription + charity info
scores            — Stableford scores (max 5 per user, rolling)
charities         — supported charity organisations
charity_events    — charity news and events
draws             — monthly prize draws (pending → simulated → published)
draw_entries      — snapshot of user scores at draw time with match results
winner_verifications — proof submission and payout tracking
subscription_events  — audit log of all subscription changes
```

---

## ⚙️ Local Development

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account
- Supabase CLI

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/golf-platform.git
cd golf-platform
npm install
```

### 2. Set up environment variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. Set up Supabase

Run the database schema in Supabase SQL Editor:

```bash
# Schema is in: supabase/schema.sql
# Run it in Supabase → SQL Editor → New Query
```

### 4. Deploy Edge Functions

```bash
supabase login
supabase link --project-ref your-project-ref
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret
supabase secrets set SITE_URL=http://localhost:5173
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

### 5. Run the app

```bash
npm run dev
```

Visit `http://localhost:5173`

### 6. Test Stripe webhooks locally

```bash
stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhook
```

---

## 🚀 Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
4. Deploy — Vercel auto-detects Vite

### Supabase (Backend)

1. Update Auth → URL Configuration with your Vercel URL
2. Add production webhook in Stripe pointing to Edge Function URL
3. Set `SITE_URL` secret: `supabase secrets set SITE_URL=https://your-app.vercel.app`

---

## 💳 Stripe Test Cards

| Card                  | Description        |
| --------------------- | ------------------ |
| `4242 4242 4242 4242` | Payment succeeds   |
| `4000 0000 0000 0002` | Payment declined   |
| `4000 0025 0000 3155` | Requires 3D Secure |

Use any future expiry date and any 3-digit CVC.

---

## 🎰 Draw Logic

1. Admin creates a draw for a specific month
2. System counts active subscribers and calculates prize pool (80% of subscriptions)
3. Admin runs the draw — 5 random numbers (1–45) are generated
4. Each user's last 5 Stableford scores are compared to the drawn numbers
5. Match 3 = 15% of pool · Match 4 = 25% of pool · Match 5 = Jackpot (60%)
6. If nobody matches 5, jackpot rolls over to next month
7. Admin publishes results — users can see results and upload verification proof

---

## 🔐 Security

- **RLS (Row Level Security)** enabled on all tables
- Users can only access their own data
- Service role key never exposed to frontend
- Stripe secret key only in Edge Functions (server-side)
- JWT tokens stored in sessionStorage (not localStorage)
- All API calls authenticated with Bearer tokens

---

## 📦 Key Dependencies

```json
{
  "react": "^18",
  "react-router-dom": "^6",
  "@supabase/supabase-js": "^2",
  "@stripe/stripe-js": "^3",
  "tailwindcss": "^4",
  "lucide-react": "^0.383",
  "typescript": "^5",
  "vite": "^8"
}
```

---

## 🧪 Testing the Full Flow

```
1. Visit / → Landing page
2. Click "Get started" → Signup form
3. Fill details, select charity, choose plan
4. Click "Continue to Payment" → Stripe Checkout
5. Enter test card → Pay → Redirect to /dashboard
6. Dashboard shows subscription: Active
7. Go to "My Scores" → Add Stableford scores
8. Go to "My Charity" → View/change charity
9. Visit /admin → Admin panel
10. Create draw → Run draw → Publish
11. Go to "Draw Results" in dashboard → See results
12. If winner → Go to "My Winnings" → Upload proof
```

---

## 👤 Author

**Ashish Anand**  
Full Stack Developer  
Built for Digital Heroes Trainee Selection Assignment — April 2026

---

## 📄 License

This project was built as a technical assignment. All rights reserved.
