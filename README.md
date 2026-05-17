# 🦷 Dental CRM Dashboard

A full-stack CRM dashboard for dental clinics — built with **Next.js**, **Express**, **MongoDB**, **shadcn/ui**, and **Clerk**.

---

## 📁 Project Structure

```
dental-crm/
├── frontend/          ← Next.js dashboard (what clinic staff sees)
└── backend/           ← Express API + MongoDB
```

---

## 🚀 Quick Start

### Step 1 — Set up MongoDB

You have two options:
- **Local**: Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
- **Cloud (recommended)**: Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) and copy the connection string

---

### Step 2 — Set up Clerk (Authentication)

1. Go to [clerk.com](https://clerk.com) and create a free account
2. Create a new application
3. Copy your **Publishable Key** and **Secret Key** from the dashboard
4. In Clerk dashboard → **Webhooks** → add endpoint: `http://your-backend-url/api/webhooks/clerk`
5. Copy the **Webhook Signing Secret**

---

### Step 3 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Edit .env and fill in: MONGODB_URI, CLERK_WEBHOOK_SECRET, EMAIL_USER, EMAIL_PASS

# Run in development (TypeScript, hot reload via tsx)
npm run dev

# OR build to JavaScript and run in production
npm run build
npm start
```

The backend runs on **http://localhost:5000**

---

### Step 4 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env.local

# Edit .env.local and fill in:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (from Clerk dashboard)
# - CLERK_SECRET_KEY (from Clerk dashboard)

# Start the frontend
npm run dev
```

The dashboard opens at **http://localhost:3000**

---

## 📋 Dashboard Pages

| Page | URL | What it does |
|------|-----|--------------|
| Overview | `/dashboard` | Summary cards + recent checkouts |
| Patients | `/dashboard/patients` | Add, edit, search, delete patients |
| Bookings | `/dashboard/bookings` | Review & update booking requests |
| Blog Posts | `/dashboard/posts` | Write & publish blog articles |
| Checkouts | `/dashboard/checkouts` | Record visits & send summary emails |
| Contacts | `/dashboard/contacts` | Read messages from website visitors |

---

## 🔌 API Endpoints

All endpoints are prefixed with `http://localhost:5000`

### Patients
- `GET /api/patients` — list all (supports `?search=name`)
- `GET /api/patients/:id` — single patient
- `POST /api/patients` — create
- `PUT /api/patients/:id` — update
- `DELETE /api/patients/:id` — delete

### Bookings
- `GET /api/bookings` — list all (supports `?status=pending`)
- `POST /api/bookings` — create (used by your website's booking form)
- `PUT /api/bookings/:id` — update status & notes
- `DELETE /api/bookings/:id` — delete

### Blog Posts
- `GET /api/posts` — list all (supports `?status=published`)
- `POST /api/posts` — create
- `PUT /api/posts/:id` — update / publish
- `DELETE /api/posts/:id` — delete

### Checkouts
- `GET /api/checkouts` — list all
- `POST /api/checkouts` — create
- `PUT /api/checkouts/:id` — update
- `POST /api/checkouts/:id/send-email` — send email to patient
- `DELETE /api/checkouts/:id` — delete

### Contacts
- `GET /api/contacts` — list all
- `POST /api/contacts` — create (used by your website's contact form)
- `PUT /api/contacts/:id` — mark as read
- `DELETE /api/contacts/:id` — delete

### Dashboard
- `GET /api/dashboard/stats` — summary numbers for the overview page

---

## 🌐 Connecting Your Clinic Website

Your existing clinic website can feed data into this CRM by hitting these two endpoints:

**Booking form** → POST to `http://your-backend-url/api/bookings`
```json
{
  "name": "Abebe Girma",
  "email": "abebe@example.com",
  "phone": "+251911000000",
  "preferredDate": "2025-07-15",
  "preferredTime": "10:00 AM",
  "serviceType": "Teeth Cleaning",
  "message": "First time visitor"
}
```

**Contact form** → POST to `http://your-backend-url/api/contacts`
```json
{
  "name": "Sara Haile",
  "email": "sara@example.com",
  "subject": "Question about pricing",
  "message": "How much does a root canal cost?"
}
```

---

## 🎨 Customizing

### Change the clinic name
Edit `src/components/layout/Sidebar.tsx` — find "Dental Clinic" and update it.

### Change the currency
Edit `src/lib/utils.ts` — change `"ETB"` to your currency code (e.g. `"USD"`, `"EUR"`).

### Add a new page
1. Create `src/app/dashboard/your-page/page.tsx`
2. Add it to the sidebar in `src/components/layout/Sidebar.tsx`

### Change colors
Edit `src/app/globals.css` — the CSS variables at the top control the whole color theme.

### Add a new data field to patients
1. Add the field to `backend/models/Patient.js`
2. Add the input to the form in `frontend/src/app/dashboard/patients/page.tsx`

---

## 🚢 Deploying

### Backend → Railway / Render / Fly.io
1. Push `backend/` to a Git repo
2. Deploy on Railway or Render (both have free tiers)
3. Set environment variables in the platform dashboard
4. Copy the public URL

### Frontend → Vercel
1. Push `frontend/` to a Git repo
2. Import to [vercel.com](https://vercel.com)
3. Set environment variables (Clerk keys + `NEXT_PUBLIC_API_URL` = your backend URL)
4. Deploy

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| UI Components | shadcn/ui + Tailwind CSS |
| Authentication | Clerk |
| Backend | Express.js |
| Database | MongoDB + Mongoose |
| Email | Nodemailer |

---

## ❓ Troubleshooting

**"Failed to load stats: Failed to fetch"**  
→ Your backend isn't running. Run `npm run dev` inside the `backend/` folder.

**"MongoDB connection failed"**  
→ Check your `MONGODB_URI` in `backend/.env`. Make sure MongoDB is running locally, or your Atlas cluster allows connections from your IP.

**"Email failed to send"**  
→ Check `EMAIL_USER` and `EMAIL_PASS` in `backend/.env`. Gmail requires an App Password, not your regular password.

**Clerk sign-in not working**  
→ Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `frontend/.env.local`. Make sure it matches your Clerk application.
