# VenueFlow — Venue Booking & Allocation Platform

> **A role-priority full-day venue reservation platform with sequential approval workflows, contention resolution, and automated allocation recalculation.**

---

## 🌟 Overview

**VenueFlow** is a modern full-stack web application designed for institutions and enterprises where high-demand physical spaces (auditoriums, seminar halls, executive boardrooms) require centralized reservation and multi-tier approval.

Unlike traditional consumer booking tools based on hourly time slots, VenueFlow operates on a **Full-Day Allocation Architecture**:
- Each physical venue can host **only one confirmed event per calendar date**.
- Multiple departments and stakeholders can place competing requests for the same venue and date.
- Requests pass through a **mandatory 3-tier sequential approval workflow** (`Guide` → `HOD` → `Admin`).
- Final allocation is decided by an automated **Role Priority Engine** (`ADMIN` > `HOD` > `GUIDE` > `APPRENTICE`), with identical-tier ties resolved by request submission timestamp (First-Come, First-Served).
- In the event of an allocated booking cancellation, the platform **automatically promotes the highest-priority approved waiting request** within a single ACID transaction.

---

## 🏗️ Architecture & Core Workflows

### 1. Sequential Approval Workflow

Requests follow a strict hierarchical sign-off sequence without skipped stages:

```
[ Request Created ] 
       │
       ▼
 ┌───────────────┐
 │ Guide Review  │  ──(Rejected)──► [ Request Terminated ]
 └───────┬───────┘
         │ (Approved)
         ▼
 ┌───────────────┐
 │  HOD Review   │  ──(Rejected)──► [ Request Terminated ]
 └───────┬───────┘
         │ (Approved)
         ▼
 ┌───────────────┐
 │ Admin Review  │  ──(Rejected)──► [ Request Terminated ]
 └───────┬───────┘
         │ (Approved)
         ▼
 ┌───────────────────────────────┐
 │ Allocation Engine Evaluation  │
 └───────────────────────────────┘
```

1. **Guide (Faculty / Guide)** verifies the preliminary academic or operational rationale.
2. **HOD (Head of Department)** reviews departmental scheduling and authorizes submission.
3. **Admin (Platform Administrator)** performs institutional sign-off, which immediately triggers the backend allocation engine.

---

### 2. Priority Allocation & Waiting Queue Engine

For each `(venue_id, booking_date)` tuple:
- **Eligible Candidates**: Only booking requests that have reached `status = 'APPROVED'` (fully approved through all 3 stages).
- **Ranking Formula**:
  $$\text{Priority Rank} = (\text{Role Priority Level}, \text{Submission Timestamp})$$
  - `ADMIN` = Priority Level 1
  - `HOD` = Priority Level 2
  - `GUIDE` = Priority Level 3
  - `APPRENTICE / STUDENT` = Priority Level 5
- **Allocation (`is_allocated = 1`)**: Exactly one approved request holds the confirmed reservation.
- **Waiting Queue (`is_allocated = 0`)**: All other approved requests are placed into a ranked waiting queue.

---

### 3. ACID Transactions & Concurrency Safety

To prevent double-allocation or race conditions during concurrent approvals or cancellations:
- MSSQL transactions execute with `UPDLOCK, HOLDLOCK` / row-level locks on the target venue and date.
- When an allocated reservation is cancelled, the engine wipes all allocations for that venue/date, re-evaluates all remaining approved candidates, marks the top candidate as allocated, and commits the transaction atomically.

---

## 👥 Role Permissions Matrix

| Capability | ADMIN | HOD | GUIDE | APPRENTICE |
|---|:---:|:---:|:---:|:---:|
| **Submit Booking Requests** | ✅ | ✅ | ✅ | ✅ |
| **View Live Dashboard & Queues** | ✅ | ✅ | ✅ | ✅ |
| **Guide Approval Review** | — | — | ✅ | — |
| **HOD Approval Review** | — | ✅ | — | — |
| **Admin Finalization & Approval** | ✅ | — | — | — |
| **Create / Deactivate Venues** | ✅ | — | — | — |
| **Cancel Personal Bookings** | ✅ | ✅ | ✅ | ✅ |
| **Cancel Any Booking** | ✅ | — | — | — |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Turbopack)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/) (JWT strategy with credentials provider)
- **Database**: [Microsoft SQL Server](https://www.microsoft.com/sql-server) via [`mssql`](https://www.npmjs.com/package/mssql) pool connection
- **Language & Tooling**: TypeScript 5, ESLint 9

---

## 📁 Repository Structure

```
booking-system/
├── actions/                  # Next.js Server Actions
│   ├── approval.ts           # Approve / Reject actions with remarks & RBAC
│   ├── auth.ts               # Credentials sign-in action
│   ├── blocked-dates.ts      # Admin date blocking / unblocking actions
│   ├── bookings.ts           # Create, edit, and cancel booking actions
│   └── venue.ts              # Venue CRUD and activation toggles
├── app/                      # Next.js App Router Pages
│   ├── (auth)/login/         # Sign-in page with demo credentials helper
│   ├── (main)/               # Authenticated application layout
│   │   ├── approvals/        # Role-filtered approval workflow management
│   │   ├── bookings/         # Booking list, create, edit, & details views
│   │   ├── queue/            # Live allocation vs waiting queue dashboard
│   │   ├── venues/           # Venue directory and management
│   │   └── page.tsx          # Main metrics & system overview dashboard
│   ├── globals.css           # VenueFlow design system & CSS variables
│   ├── icon.svg              # Platform SVG favicon emblem
│   └── layout.tsx            # Root HTML layout and metadata
├── components/
│   └── Sidebar.tsx           # Global navigation with role indicators
├── lib/
│   ├── auth.ts               # NextAuth v5 configuration & JWT callbacks
│   ├── db.ts                 # MSSQL connection pool
│   ├── constants/priority.ts # Role priorities & status constants
│   ├── db/                   # Database query repositories
│   │   ├── approval.ts       # Transactional approval updates
│   │   ├── blocked-dates.ts  # Blocked dates queries
│   │   ├── bookings.ts       # Booking queries, cancellation & queue grouping
│   │   └── venue.ts          # Venue directory queries
│   └── utils/
│       ├── allocation.ts     # Concurrency-safe allocation engine
│       └── booking-validation.ts # Past date, working hours & duplicate checks
└── types/                    # TypeScript interfaces & types
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **MSSQL Server**: A running Microsoft SQL Server instance (local or hosted)

### 1. Installation

```bash
git clone https://github.com/atreya786/NALCO-Appointment-Booking-System.git
cd NALCO-Appointment-Booking-System
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Credentials
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_SERVER=your_sql_server_host
DB_DATABASE=your_database_name

# NextAuth v5 Secret
AUTH_SECRET=your_nextauth_jwt_secret_key

# Optional Developer Flags
BYPASS_OFFICE_HOURS=true # Set true to allow creating bookings outside 9AM-6PM
```

### 3. Database Tables

The application expects the following tables in MSSQL:
- `Users` (`user_id`, `name`, `email`, `password_hash`, `role`, `department`)
- `Venues` (`venue_id`, `venue_name`, `location`, `capacity`, `venue_type`, `is_active`)
- `Bookings` (`appointment_id`, `venue_id`, `requested_by`, `booking_date`, `purpose`, `description`, `status`, `guide_status`, `hod_status`, `admin_status`, `is_allocated`, `rejection_reason`)
- `BlockedDates` (`blocked_date`, `reason`)

### 4. Running Locally

```bash
# Start development server
npm run dev

# Run ESLint validation
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔑 Demo Access Accounts

For testing the multi-tier approval and priority allocation engine:

| Role | Email | Password | Tier |
|---|---|---|:---:|
| **Admin** | `admin@test.com` | `123456` | Priority 1 |
| **HOD** | `hod@test.com` | `123456` | Priority 2 |
| **Guide** | `faculty@test.com` | `123456` | Priority 3 |
| **Student** | `student@test.com` | `123456` | Priority 5 |

---

## 📄 License

MIT License. Designed and built as an enterprise venue allocation and approval portfolio platform.
