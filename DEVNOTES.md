# Priya's Tiffin — Dev Notes

Full project context, user stories, and original requirements.
This file is the "story" of the project — where we started and why we built things the way we did.

---

## Origin

Priya runs a home-based tiffin (meal prep) business for a colony (residential community).
Every week she would message customers on WhatsApp: "Monday — dal makhani + rice $9, Tuesday — biryani $12..."
Customers would reply with their orders, she'd track them in a notebook, and chase payments manually.

The goal was to replace that entire workflow with a single shareable link.

---

## User Stories

### Admin (Priya)

| # | Story | Acceptance Criteria |
|---|---|---|
| A1 | Create a weekly menu with items | Each item has: name, description, photos, price, pickup day, pickup time window |
| A2 | Set an order deadline | Menu auto-closes when deadline passes — customers see "Orders Closed" |
| A3 | Add Venmo / Zelle handles | Shown to customer at checkout and on confirmation page |
| A4 | Publish the menu to get a shareable link | One link per week — shareable on WhatsApp |
| A5 | See all incoming orders live | Dashboard shows order count, items ordered, customer name + phone |
| A6 | Mark each customer as Paid / Picked up / No-show | Payment and pickup tracked independently per order |
| A7 | Close orders early if needed | One-tap "Close Orders Now" button |
| A8 | Archive the week when done | Moves week to archive, frees up the menu builder for next week |
| A9 | Reuse dishes from previous weeks | Item library auto-populated from archived weeks — one tap to add |

### Customer

| # | Story | Acceptance Criteria |
|---|---|---|
| C1 | Open menu from WhatsApp link — no install | Works in mobile browser, no account needed |
| C2 | Browse items grouped by pickup day | Each item shows photo, name, description, price |
| C3 | Add/remove items with quantity per item | Max 3 of the same item; no total cart cap |
| C4 | See sticky total bar while browsing | Shows item count + running total at bottom of screen |
| C5 | See order summary before confirming | Review items, pickup days, and total |
| C6 | See Venmo / Zelle info at checkout | Can pay now or after pickup |
| C7 | Opt into SMS pickup reminders | Toggle ON by default; phone required |
| C8 | Receive confirmation page after order | Shows order details, pickup days, payment info |
| C9 | Can't order twice in the same week | Duplicate check by phone number + week_id |

---

## What We Deliberately Did Not Build

| Feature | Reason |
|---|---|
| Customer login / accounts | Too much friction for a colony business. Link = access. |
| Real-time order updates (WebSockets) | Dashboard is fine with manual refresh at ~100 customers/week |
| Stripe / online payments | Priya prefers Venmo/Zelle — familiar, no transaction fees |
| Push notification reminders (server-side) | Twilio SMS is simpler and more reliable than PWA push for this scale |
| Multi-vendor support | Single-operator app — generalizing would add complexity with no value |
| Order editing after submit | Priya is a single person — she handles exceptions via WhatsApp |

---

## Constraints and Non-Functional Requirements

- **Scale:** ~100 customers/week maximum. No real-time requirement. Supabase free tier sufficient.
- **Devices:** Customers are primarily on Android (WhatsApp link). Admin uses iPhone or desktop.
- **Connectivity:** Customers may have slow connections. Images compressed client-side before upload.
- **Cost:** $0/month target. Vercel free + Supabase free + Twilio pay-per-SMS.
- **Maintenance:** Priya is non-technical. Admin UX must be self-explanatory.

---

## Original Feature Requests (verbatim from Day 1)

> "No login needed for customers — just a WhatsApp link"
> "DoorDash-style cards with photos"
> "Max 3 of the same item"
> "SMS reminder before pickup day"
> "Venmo/Zelle — no card processing"
> "Mobile first, works on iPhone and Android"
> "Admin just needs a passphrase, not a full login"
> "Archive past weeks, reuse items from a library"

---

## Timeline

Built in a single session — Vite scaffold to live deployed PWA with real orders.

Key milestones:
1. Supabase schema + storage policies
2. Admin menu builder with image upload
3. Customer menu view (DoorDash cards)
4. Order form + confirmation
5. Admin dashboard + payment tracker
6. Archive + item library
7. vercel.json SPA routing fix (biggest unblock)
8. Timezone-safe deadline storage
9. PWA manifest + service worker
10. README + Dev Notes
