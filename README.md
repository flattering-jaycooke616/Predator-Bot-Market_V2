#  Predator Bot Market V2

> **Institutional-grade marketplace for MQ4 trading algorithms.** Buy, sell, and deploy verified trading bots with secure download management.

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10.3-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)
[![GCS](https://img.shields.io/badge/GCS-Storage-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/storage)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![GitHub Stars](https://img.shields.io/github/stars/Lintshiwe/Predator-Bot-Market_V2?style=social)](https://github.com/Lintshiwe/Predator-Bot-Market_V2/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Lintshiwe/Predator-Bot-Market_V2?style=social)](https://github.com/Lintshiwe/Predator-Bot-Market_V2/network/members)

</div>

---

##  Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

##  Features

###  Marketplace
- **Browse & Search** — Filter bots by category, featured status, and more
- **Bot Detail Pages** — Full documentation, feature lists, and pricing
- **Purchase Flow** — Submit payment references for admin verification
- **Download Management** — 2 downloads per purchase, links expire after 5 hours

###  Authentication & Authorization
- **Clerk Auth** — Sign in with Google, GitHub, email, and more
- **Role-Based Access** — Admin vs. client permissions
- **Session Management** — Automatic cache invalidation on user change

###  Admin Dashboard
- **Algorithm Inventory** — Create, edit, and delete bot listings
- **File Uploads** — Upload `.ex4`, `.mq4`, or `.zip` files
- **Purchase Verification** — Approve or reject pending payments
- **Purchase History** — View all completed and refunded orders

###  Secure Downloads
- **Presigned URLs** — GCS-signed download links with 5-hour expiry
- **Download Limits** — Max 2 downloads per purchase
- **Expiry Warnings** — Dashboard shows countdown timer for expiring links
- **Purchase Verification Required** — Downloads only available after admin approval

---

##  Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  Vite + React 19 + Tailwind CSS + wouter + TanStack Query   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  Home    │ │ Market   │ │ Dashboard│ │    Admin       │  │
│  │  Page    │ │ place    │ │          │ │    Panel       │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ /api/* proxied
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Server (Express 5)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  Public  │ │ Protected│ │  Admin   │ │   Storage      │  │
│  │  Routes  │ │  Routes  │ │  Routes  │ │   Routes       │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
│         │              │              │              │       │
│    ┌────┴────┐   ┌─────┴─────┐  ┌─────┴─────┐  ┌───┴────┐  │
│    │ Clerk   │   │ Drizzle   │  │ Clerk     │  │ GCS    │  │
│    │ Auth    │   │ ORM/PG    │  │ Admin     │  │ Files  │  │
│    └─────────┘   └───────────┘  └───────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐
│   PostgreSQL    │  │    Clerk     │  │  Google Cloud    │
│   (Bots,        │  │   (Auth,     │  │  Storage (Files) │
│   Purchases)    │  │   Users)     │  │                  │
└─────────────────┘  └──────────────┘  └──────────────────┘
```

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, wouter, shadcn/ui, Framer Motion |
| **Backend** | Express 5, TypeScript 5.9, pino logging |
| **Database** | PostgreSQL 16, Drizzle ORM, drizzle-zod |
| **Auth** | Clerk (React + Express SDKs) |
| **Storage** | Google Cloud Storage with presigned URLs |
| **Package Manager** | pnpm 10 with workspaces |
| **API Client** | Orval-generated React Query hooks + Zod schemas |
| **Build** | esbuild (backend), Vite (frontend) |

---

##  Quick Start

### Prerequisites
- Node.js 22+
- pnpm 10+
- PostgreSQL 16+
- Clerk account (free tier works)
- Google Cloud Storage bucket (optional for file uploads)

### 1. Clone & Install
```bash
git clone https://github.com/Lintshiwe/Predator-Bot-Market_V2.git
cd Predator-Bot-Market_V2
pnpm install
```

### 2. Set Up Database
```bash
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE USER predator_bot WITH PASSWORD 'predator_bot';"
sudo -u postgres psql -c "CREATE DATABASE predator_bots OWNER predator_bot;"
DATABASE_URL=postgresql://predator_bot:predator_bot@localhost:5432/predator_bots \
  pnpm --filter @workspace/db run push
DATABASE_URL=postgresql://predator_bot:predator_bot@localhost:5432/predator_bots \
  pnpm exec tsx lib/db/seed.ts
```

### 3. Start API Server
```bash
cd artifacts/api-server
CLERK_PUBLISHABLE_KEY=pk_test_... \
CLERK_SECRET_KEY=sk_test_... \
DATABASE_URL=postgresql://predator_bot:predator_bot@localhost:5432/predator_bots \
PORT=3001 NODE_ENV=development pnpm run dev
```

### 4. Start Frontend
```bash
cd artifacts/predator-bots
API_SERVER_URL=http://localhost:3001 pnpm run dev
```

### 5. Open Browser
Navigate to **http://localhost:5173**

---

##  Project Structure

```
Predator-Bot-Market_V2/
├── artifacts/
│   ├── api-server/           # Express 5 API server
│   │   ├── src/
│   │   │   ├── routes/       # API route handlers
│   │   │   │   ├── public.ts # Public routes (health, config, bots)
│   │   │   │   ├── protected.ts # Auth-required routes (purchases)
│   │   │   │   ├── admin.ts  # Admin-only routes
│   │   │   │   └── storage.ts # GCS file serving
│   │   │   ├── middlewares/  # Clerk proxy middleware
│   │   │   └── lib/          # Logger, GCS client, ACL
│   │   └── build.mjs         # esbuild configuration
│   ├── predator-bots/        # React frontend (Vite)
│   │   └── src/
│   │       ├── pages/        # Home, Bots, Dashboard, Admin
│   │       ├── components/   # UI components + layout
│   │       └── hooks/        # Custom React hooks
│   └── mockup-sandbox/       # Design preview sandbox
├── lib/
│   ├── api-client-react/     # Generated React Query hooks (Orval)
│   ├── api-spec/             # OpenAPI spec + Orval config
│   ├── api-zod/              # Generated Zod schemas
│   └── db/                   # Drizzle ORM schema + migrations
│       ├── src/schema/       # Table definitions
│       ├── drizzle.config.ts # Drizzle configuration
│       └── seed.ts           # Database seed script
└── scripts/                  # Utility scripts
```

---

##  API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/healthz` | Health check |
| `GET` | `/api/config` | Get Clerk publishable key |
| `GET` | `/api/bots` | List all active bots |
| `GET` | `/api/bots/:id` | Get bot by ID |
| `GET` | `/api/bots/stats` | Get marketplace statistics |

### Protected (Auth Required)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/purchases` | List user's purchases |
| `POST` | `/api/purchases` | Create a purchase (pending verification) |
| `GET` | `/api/purchases/:id` | Get purchase details |
| `POST` | `/api/downloads/:purchaseId` | Initiate download (5-hour expiry) |

### Admin Only
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/admin/bots` | Create a bot listing |
| `PUT` | `/api/admin/bots/:id` | Update a bot listing |
| `DELETE` | `/api/admin/bots/:id` | Delete a bot listing |
| `GET` | `/api/admin/purchases` | List all purchases |
| `PUT` | `/api/admin/purchases/:id/verify` | Approve a pending purchase |
| `PUT` | `/api/admin/purchases/:id/reject` | Reject a pending purchase |

---

##  Database Schema

### `bots` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `name` | TEXT | Bot name |
| `slug` | TEXT | URL-friendly identifier (unique) |
| `description` | TEXT | Short description |
| `long_description` | TEXT | Full documentation |
| `price` | DECIMAL(10,2) | License price |
| `currency` | TEXT | Currency code (default: USD) |
| `category` | TEXT | Bot category |
| `features` | JSONB | Array of feature strings |
| `image_url` | TEXT | Preview image URL |
| `file_object_path` | TEXT | GCS file path |
| `featured` | BOOLEAN | Featured flag |
| `active` | BOOLEAN | Visibility flag |
| `downloads_count` | INTEGER | Total downloads |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

### `purchases` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `user_id` | TEXT | Clerk user ID |
| `bot_id` | INTEGER | FK → bots.id |
| `status` | TEXT | pending / completed / refunded |
| `amount_paid` | DECIMAL(10,2) | Purchase amount |
| `payment_reference` | TEXT | Payment tx hash |
| `download_count` | INTEGER | Downloads used |
| `max_downloads` | INTEGER | Max allowed (default: 2) |
| `second_download_expires_at` | TIMESTAMP | 5-hour expiry after first download |
| `created_at` | TIMESTAMP | Purchase time |

---

##  Security

- **Clerk Authentication** — Industry-standard auth with session management
- **Admin Verification** — All purchases require manual admin approval
- **Download Limits** — Maximum 2 downloads per purchase
- **Expiring Links** — Download URLs expire after 5 hours
- **Input Validation** — Zod schemas validate all API inputs
- **SQL Injection Protection** — Parameterized queries via Drizzle ORM
- **CORS Configuration** — Credentials-enabled, origin-restricted

---

##  Contributing

Contributions are welcome! Please read our contributing guidelines:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

##  License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built by [Lintshiwe](https://github.com/Lintshiwe) — Founder of [LetsOperate](https://github.com/Letsoperate)**

[![GitHub](https://img.shields.io/badge/GitHub-Lintshiwe-181717?logo=github)](https://github.com/Lintshiwe)
[![Organization](https://img.shields.io/badge/Org-LetsOperate-24292e?logo=github)](https://github.com/Letsoperate)

</div>

