# Priya's Tiffin

A full-stack Progressive Web App (PWA) for a home-based tiffin (meal delivery) business. Built for real-world use — Priya shares a WhatsApp link each week, customers browse the menu and place orders on their phones, and Priya manages everything from a private admin dashboard.

**Live demo:** https://priya-tiffin.vercel.app

---

## What it does

**Admin side (Priya)**
- Build a weekly menu with item names, descriptions, photos, price, and pickup day/time
- Set an order deadline — the menu auto-closes at that time
- Publish the menu and get a shareable WhatsApp link
- Live orders dashboard — see every order as it comes in
- Track payment status per customer (paid / unpaid / no-show)
- Archive past weeks and reuse items from a saved library

**Customer side**
- Open the WhatsApp link on any phone — no app install needed
- Browse menu cards with photos, descriptions, and prices (DoorDash-style)
- Add items to cart (max 3 of the same item)
- Enter name and phone, opt into SMS pickup reminders
- See Venmo / Zelle payment info at checkout
- Works offline after first load (PWA with service worker)

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Backend / DB | Supabase (PostgreSQL + Storage) |
| Auth | Passphrase-based (sessionStorage) |
| PWA | vite-plugin-pwa (Workbox) |
| SMS | Twilio (pickup reminders) |
| Hosting | Vercel |
| Icons | Lucide React |

---

## Features

- Mobile-first PWA — installable on Android and iOS
- No login required for customers — just a shareable link
- Image upload with client-side compression before storing to Supabase Storage
- Timezone-safe order deadline (stored as UTC ISO, displayed in local time)
- Per-item quantity controls with a sticky cart total bar
- Duplicate order prevention by phone number per week
- Item library — reuse dishes from previous weeks in one tap

---

## Database schema

Five tables in Supabase (PostgreSQL):

```
weeks         — title, status, share_token, order_deadline, payment info
menu_items    — name, description, price, pickup_day/time, image_urls[]
orders        — customer name/phone/email, total, sms_reminders flag
order_items   — line items linked to orders
item_library  — reusable dish archive with use count
```

---

## Running locally

```bash
git clone https://github.com/rahulnaidu02/priya-tiffin.git
cd priya-tiffin
npm install
```

Create a `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_ADMIN_PASS=your_admin_passphrase
```

```bash
npm run dev
```

---

## Project structure

```
src/
  pages/
    admin/
      AdminLogin.jsx       # Passphrase gate
      MenuBuilder.jsx      # Weekly menu editor with image upload
      Dashboard.jsx        # Live orders view
      PaymentTracker.jsx   # Payment status per customer
      ArchivePage.jsx      # Past weeks + item library
    customer/
      MenuView.jsx         # Public menu (DoorDash-style cards)
      OrderForm.jsx        # Cart summary + customer details
      OrderConfirm.jsx     # Success screen with payment info
      MyOrders.jsx         # Customer's past orders by phone
  lib/
    supabase.js            # Supabase client
    utils.js               # Image compression, date formatting, auth helpers
  App.jsx                  # Routes
```

---

## Deployment

Deployed on Vercel with automatic deploys from `main`. A `vercel.json` rewrite rule handles client-side routing so all routes (e.g. `/m/:token`) work on direct URL access:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

Environment variables are configured in the Vercel dashboard — nothing secret is committed to this repo.
