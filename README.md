# Invofy — 1-Tap PDF Invoicing, Cash Ledgers & WhatsApp Receipts

[![Live Production](https://img.shields.io/badge/Live_Site-invofy--kappa.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://invofy-kappa.vercel.app)
[![Framework](https://img.shields.io/badge/Framework-Next.js_14-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Language](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
**Invofy** is a high-speed, modern digital invoicing and cashflow tracking platform engineered to eliminate paper invoice books and lost counter receipts for local businesses. It allows shop owners, contractors, and service providers to generate polished digital PDF bills in seconds and dispatch them directly to customer WhatsApp chats.

---

## Core Capabilities

- **Instant PDF Bill Generation:** Clean, professional invoice templates customized with your store logo, GST/Tax details, and line-item totals.
- **1-Tap WhatsApp Receipt Dispatch:** Sends formatted bills and downloadable PDF links directly to the customer's phone.
- **Daily Cash vs. UPI Ledger:** Real-time visibility into counter collections: track how much cash was received vs. UPI/bank transfers.
- **Customer Dues & Outstanding Balances:** Log partial payments and monitor pending receivables per client.
- **Offline & Low-Bandwidth Resilient:** Optimized for fast rendering on mobile devices even on spotty shop internet connections.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router & Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Radix UI Primitives, Lucide Icons
- **PDF Engine:** Custom print stylesheet & client-side rendering pipeline
- **Database:** Supabase / PostgreSQL (customer accounts, invoices, payment logs)
- **Deployment:** Vercel

---

## Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/MuhammadMinhaj229/invofy.git
cd invofy

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env.local
```

Add your database credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```bash
# 4. Run development server
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

---

## How to Deploy to Vercel

1. Push your repository to GitHub.
2. In **Vercel**, select **Add New Project** and pick `invofy`.
3. Vercel automatically detects **Next.js**.
4. Configure your environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
5. Click **Deploy**. Your billing platform will be live on the edge.

---

## Author & Support
Engineered by **Mohammed Minhaj Mahmood** ([@MuhammadMinhaj229](https://github.com/MuhammadMinhaj229)) as part of the Alif Growth Media software suite.
