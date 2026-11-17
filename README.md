# Mobile Repairing House — Public Website + Repair Shop CRM

A complete, production-oriented web application and repair shop management CRM for **Mobile Repairing House**, operated by **Debasish** in Bhajan Complex, Dunlop, Baranagar, Kolkata, West Bengal, India.

---

## 1. Verified Business Information

- **Business Name:** Mobile Repairing House
- **Owner / Contact:** Debasish
- **Phone:** +91 97327 89938
- **WhatsApp:** +91 97327 89938
- **Address:** Bhajan Complex, 139, Barrackpore Trunk Road, Dunlop, Saket Nagar, Bonhooghly, Baranagar, Kolkata, West Bengal 700108, India.
- **Google Maps Plus Code:** `M92H+Q4, Kolkata, West Bengal`
- **Google Maps Direct URL:** [https://www.google.com/maps/search/?api=1&query=M92H%2BQ4%20Kolkata%2C%20West%20Bengal](https://www.google.com/maps/search/?api=1&query=M92H%2BQ4%20Kolkata%2C%20West%20Bengal)
- **Specializations:** Android smartphone repairs, iPhone diagnostics & hardware service, screen/touch replacement, battery renewal, charging ports, motherboard diagnostics, mobile accessories.

---

## 2. Technology Architecture

### Frontend
- **Framework:** React 18 with TypeScript in strict mode
- **Bundler:** Vite
- **Styling:** Tailwind CSS with brand design tokens
  - Primary Navy: `#18264B`
  - Accent Orange-Red: `#F15B45`
  - Light Background: `#F3F5F9`
  - Main Text: `#172033`
  - Secondary Text: `#697386`
  - Borders: `#E2E7EF`
- **Routing:** React Router v6
- **Forms & Validation:** React Hook Form, Zod
- **Icons:** Lucide React
- **Server Caching:** TanStack Query v5

### Backend & Cloud Infrastructure
- **Database:** Cloud Firestore with strict security rules (`firestore.rules`)
- **Authentication:** Firebase Authentication (custom claims role-based access: Owner, Manager, Technician)
- **Storage:** Cloud Storage for Firebase (`storage.rules`)
- **Server Functions:** Cloud Functions for Firebase (`/functions`) with Resend transactional email
- **Hosting:** Firebase Hosting with SPA rewrite rules & security headers (`firebase.json`)

---

## 3. Application Routes

### Public Website
- `/` — Homepage with announcement bar, hero, service categories, Android & iPhone sections, 4-step repair process, accessories showcase, Dunlop map & directions, FAQ, footer.
- `/services` — Diagnostic and repair service directory.
- `/services/:slug` — Deep-dive service detail pages with symptoms, considerations, process, and direct enquiry CTAs.
- `/android-repair` — Dedicated Android smartphone repair service page.
- `/iphone-repair` — Dedicated iPhone repair service page with transparent independent repair disclaimers.
- `/accessories` — Mobile accessories showcase (fast chargers, Type-C cables, earphones, power banks) with WhatsApp stock check.
- `/about` — Shop background, Debasish's philosophy of upfront estimates, and verified address.
- `/contact` — Phone, WhatsApp, directions, Google Maps embed, Plus Code.
- `/repair-request` — Mobile-friendly customer enquiry form with Indian phone validation, spam control, and instant reference confirmation.
- `/repair-status` — Customer self-service tracking using repair job reference (e.g. `MRH-2026-1042`). Shows safe timeline without leaking internal costs or technician notes.
- `/estimate-approval/:token` — Secure public token-based portal for customer estimate review and one-click authorization.
- `/privacy-policy` & `/terms` — Comprehensive legal compliance pages.

### Private CRM (`/admin`)
- `/admin/login` & `/admin/forgot-password` — Secure staff authentication.
- `/admin` — Operational dashboard with real KPI metrics (enquiries, workbench jobs, awaiting approval, pickups, real collections, outstanding balances).
- `/admin/enquiries` — Public enquiry triage, status updates, WhatsApp follow-up, and 1-click conversion to counter intake.
- `/admin/customers` & `/admin/customers/:customerId` — Customer directory, repair histories, invoices, and notes.
- `/admin/repairs` — Filterable workbench jobs table by status, priority, and technician.
- `/admin/repairs/new` — Fast 10-step shop counter intake workflow with instant Intake Sheet printing.
- `/admin/repairs/:repairId` — Full repair job lifecycle manager, audit trail, estimates, invoicing, warranties, and WhatsApp triggers.
- `/admin/estimates` — Line-item parts & labour quotations in exact paise, public approval link generation.
- `/admin/invoices` — Tax invoices with balance tracking and printable receipts.
- `/admin/payments` — Manual payment recording (Cash, UPI, Bank Transfer) with audit trail.
- `/admin/inventory` — Stock levels, low-stock alerts, and part consumption tracking.
- `/admin/warranties` — Post-repair warranty certificates.
- `/admin/reports` — Operational analytics and CSV data export.
- `/admin/staff` — Staff role administration (Owner only).
- `/admin/settings` — Business info, notice bar, and service toggles.

---

## 4. Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
The app runs at `http://localhost:5173`.

> **Note on Out-of-the-Box Demo Mode:**
> If you have not configured Firebase environment variables yet, the application automatically runs in a local storage persistence mode with pre-populated verified business data for Debasish's shop. All public pages, enquiry submission, counter intake, repair jobs, estimates, invoices, and tracking work 100% out of the box!

### 3. Connect Your Real Firebase Project
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Enter your Firebase project credentials in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

---

## 5. Firebase Deployment

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and select project:
   ```bash
   firebase login
   firebase use your_project_id
   ```
3. Build production bundle:
   ```bash
   npm run build
   ```
4. Deploy Hosting, Firestore Rules, and Cloud Functions:
   ```bash
   firebase deploy
   ```
