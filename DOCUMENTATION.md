# مُسند / Musnad — Project Documentation

> A bilingual (Arabic/English) medicine **donation, redistribution, and emergency-request** platform that connects people with surplus or near-expiry medicines to those who need them — reducing pharmaceutical waste and improving access to medication.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Frontend](#4-frontend)
5. [Backend](#5-backend)
6. [Database](#6-database)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [AI Integration](#8-ai-integration)
9. [Internationalization (i18n)](#9-internationalization-i18n)
10. [Deployment](#10-deployment)
11. [Environment Variables](#11-environment-variables)
12. [Local Development Setup](#12-local-development-setup)
13. [Security Notes](#13-security-notes)

---

## 1. Overview

**Musnad** ("مُسند" — Arabic for *support / the one who lends support*) is a full-stack web application built as a graduation project. It targets patients — with a focus on chronic conditions like **diabetes and hypertension** — and lets the community share medicines instead of discarding them.

### Problems it solves
- **Medicine waste** — unused or near-expiry medicines are redistributed instead of thrown away.
- **Access gaps** — patients who cannot afford medication can find donated medicines or raise an emergency (SOS) request.
- **Trust** — a verification (توثيق) system for pharmacies plus a donor rating system ensure credible sources.

### User roles
| Role | Capabilities |
|---|---|
| **user** | Donate medicines, search inventory, request medicines, raise SOS, rate donors, chat, use the AI assistant. |
| **pharmacy** | Everything a user can do, plus manage stock inventory, near-expiry lists, pricing, issue vouchers. Requires admin verification. |
| **admin** | Full platform management: verify pharmacies, manage users/donations/reports/team, view analytics. |

### Key features
- AI-powered **medicine scanner** (live camera or gallery upload → Gemini Vision identifies the medicine).
- **Barcode/QR scanning** for quick medicine entry.
- **Map-based** medicine/pharmacy discovery and pickup-location picking (Leaflet).
- **Emergency / SOS board** with responses.
- **AI health assistant** chatbot (scoped to diabetes & hypertension).
- **Donor ratings** and **pharmacy verification badges**.
- **Near-real-time notifications** (30s polling bell).
- **Vouchers** issued by pharmacies.
- Full **RTL/LTR bilingual UI** (Arabic-first, English supported).

---

## 2. Architecture

Musnad is a **monorepo** deployed as **two services on a single Vercel project**:

```
┌──────────────────────────────────────────────────────────────┐
│                        Vercel Project                         │
│                                                               │
│   ┌─────────────────────┐        ┌────────────────────────┐   │
│   │  Frontend (Vite SPA) │  ───►  │  Backend (FastAPI)     │   │
│   │  React 19            │  HTTP  │  /_backend/api/v1/*     │   │
│   │  routePrefix: /      │        │  routePrefix: /_backend │   │
│   └─────────────────────┘        └───────────┬────────────┘   │
│                                               │                │
└───────────────────────────────────────────────┼───────────────┘
                                                 │ psycopg2
                                                 ▼
                                    ┌────────────────────────┐
                                    │  PostgreSQL (Neon)     │
                                    └────────────────────────┘
                                                 ▲
                          Google Gemini / OpenAI / xAI / Groq
                          (AI chat + vision, provider fallback)
```

- The **frontend** calls the backend at `/_backend/api/v1/...` in production (relative path, same deployment) or `http://localhost:8000/api/v1` in development.
- The **backend** is a stateless FastAPI ASGI app talking to a managed **Neon PostgreSQL** database.
- **AI** requests fan out to a provider fallback chain (Gemini → OpenAI → xAI → Groq).

### Repository layout
```
graduate_project/
├── src/                    # React frontend
│   ├── App.jsx             # Routing
│   ├── main.jsx            # Entry point
│   ├── api.js              # Axios instance + all endpoint wrappers
│   ├── index.css           # Tailwind v4 CSS-first config (@theme)
│   ├── components/         # Reusable UI + layouts/
│   ├── context/            # AuthContext, LanguageContext
│   ├── i18n/               # translations.js + locales/
│   ├── pages/              # 33 page components
│   ├── services/           # gemini.js (AI wrapper)
│   └── utils/              # helpers (formatDate, geolocation, getHomeRoute…)
├── backend/                # FastAPI backend
│   ├── main.py             # Vercel ASGI entrypoint (re-exports app.main:app)
│   ├── requirements.txt
│   ├── migrate.py          # idempotent column migration
│   ├── create_admin.py     # seed default admin
│   └── app/
│       ├── main.py         # FastAPI factory, CORS, routers, lifespan
│       ├── api/            # routers + auth deps
│       ├── core/           # security.py (hashing + JWT)
│       ├── db/             # database.py (engine, session, init_db)
│       ├── models/         # SQLModel tables
│       └── services/       # user_delete.py (cascade delete)
├── vercel.json             # single dual-service deployment config
├── vite.config.js
└── package.json
```

---

## 3. Technology Stack

### Frontend
| Concern | Technology |
|---|---|
| Framework | **React 19** |
| Build tool | **Vite 7** |
| Styling | **Tailwind CSS 4** (CSS-first `@theme`, no config file) |
| Routing | **react-router-dom 7** |
| HTTP | **axios** |
| Animation | **framer-motion 12** |
| Icons | **lucide-react** |
| Maps | **leaflet** + **react-leaflet** + `@react-google-maps/api` |
| Barcode | **html5-qrcode** |
| Forms | **react-hook-form** + **yup** |
| Toasts | **react-hot-toast** |
| State | **zustand** (available) + React Context |

### Backend
| Concern | Technology |
|---|---|
| Framework | **FastAPI 0.109** |
| ORM | **SQLModel 0.0.14** (SQLAlchemy + Pydantic) |
| Server | **uvicorn** |
| DB driver | **psycopg2-binary** (PostgreSQL) |
| Auth | **python-jose** (JWT) + **passlib** (pbkdf2_sha256) |
| Uploads | **python-multipart** |
| HTTP client | **httpx** (async, for AI providers) |
| Config | **python-dotenv** |

### Infrastructure
- **Vercel** — hosting (dual service: Vite + FastAPI)
- **Neon** — managed PostgreSQL
- **Google Gemini / OpenAI / xAI / Groq** — AI providers

---

## 4. Frontend

### Entry & providers
`main.jsx` mounts `<App />` inside `<LanguageProvider>` and `<StrictMode>`. `App.jsx` wraps everything in `<AuthProvider>` + `<Router>`, adds a global `<Toaster>` (custom success/error styles) and a `<ChatbotGate>`.

### Pages (33)
**Public / Auth:** Landing, Login, Register, About. *(Home.jsx is dead code — not routed.)*
**User / Shared:** Dashboard, Search, Map, Donate, Emergency, HealthAI, MyRequests, MyDonations, MyVouchers, MedicalHistory, Verification, AccountVerification, Community, Inbox, Notifications, HelpCenter, Profile, Settings.
**Pharmacy:** PharmacyInventory, NearExpiry, PharmacyStats, PricingControl.
**Admin:** Admin, UsersManagement, MedicinesAnalytics, Reports, TeamManagement, AdminSettings.

### Key reusable components
| Component | Purpose |
|---|---|
| `ProtectedRoute` / `GuestRoute` | Role-based auth guards. |
| `BackButton` | Direction-aware back nav; hides on role home pages. |
| `NotificationBell` | Bell + live unread badge; polls every 30s and on window focus. |
| `LanguageToggle` | AR/EN switch. |
| `MedicineScanner` | Modal with camera/upload tabs → AI medicine identification. |
| `BarcodeScanner` | QR/barcode scanning via html5-qrcode. |
| `LocationPickerMap` | Leaflet map to drop a pickup marker. |
| `MedicineCard` | Medicine display card. |
| `RatingStars` / `VerifiedBadge` | Rating stars + verification checkmark. |
| `Chatbot` / `ChatbotGate` | Floating AI chat widget (auth-gated). |
| `ConfirmDialog` | Reusable confirm modal. |

### Layouts (`components/layouts/`)
`LayoutUser`, `LayoutPharmacy`, `LayoutAdmin` — each renders a sidebar nav + topbar (BackButton, LanguageToggle, NotificationBell, profile/inbox links), takes a `title` i18n key, and is RTL-aware (drawers slide from the correct side, logical CSS properties).

### Contexts
- **`AuthContext`** — `useAuth()` exposes `user`, `token`, `isLoading`, `login()`, `logout()`, and derived flags `isAuthenticated`, `isAdmin`, `isPharmacy`, `isUser`, `role`. Persisted in `localStorage`.
- **`LanguageContext`** — `useLang()` exposes `lang`, `dir`, `isRTL`, `t(key)`, `setLang()`, `toggle()`. Imperatively sets `<html lang>` / `<html dir>`. Defaults to Arabic/RTL.

### API layer (`src/api.js`)
A single shared axios instance:
- **Base URL:** `VITE_API_URL` → else PROD `/_backend/api/v1` → else dev `http://localhost:8000/api/v1`.
- **Request interceptor:** attaches `Authorization: Bearer <token>` from localStorage.
- **Response interceptor:** on `401` (except during login/register) clears session and redirects to `/login`.
- **`getApiError(error, fallback)`:** normalizes FastAPI error shapes into a display string.
- Exposes domain-grouped endpoint wrappers (Auth, Profile, Dashboard, Medicine, Inventory, Emergency, Admin, Health AI, Vouchers, Medical History, Inbox, Team).

### Build tooling
- Scripts: `dev`, `build` (`vite build`), `preview`, `lint`.
- `vite.config.js`: `react()` + `tailwindcss()` plugins; `manualChunks` split `admin`, `pharmacy`, and `vendor` bundles; `chunkSizeWarningLimit: 1000`.
- **Tailwind v4 CSS-first** — no `tailwind.config.js`; tokens live in `src/index.css` under `@theme` (emerald/teal primary scale, slate secondary, Cairo/Tajawal fonts, custom animations).

---

## 5. Backend

FastAPI app under global prefix **`/api/v1`**. Fully permissive CORS (`allow_origins=["*"]`). Tables auto-created on startup via a `lifespan` handler calling `init_db()`.

### API Endpoints

#### Auth — `/api/v1/auth`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | public | Register user; pharmacies start unverified. |
| POST | `/login` | public | OAuth2 password login → JWT + role/name/verified. |
| POST | `/verify-pharmacy/{user_id}` | admin | Verify a pharmacy; sends a "badge" notification. |
| GET | `/unverified-pharmacies` | admin | List pharmacies awaiting verification. |

#### Medicine & Donations — `/api/v1/medicine`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/donate` | user | Create a donation (auto-creates Medicine row). |
| GET | `/inventory` | public | List available donations (+ donor rating). Optional `q` search. |
| GET | `/me` | user | Own donations. |
| PATCH | `/donation/{id}` | owner | Update own donation. |
| DELETE | `/donation/{id}` | owner | Delete own donation. |

#### Requests / SOS — `/api/v1/requests`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/emergency` | user | Create an SOS request. |
| GET | `/me` | user | Own requests. |
| GET | `/all` | public | All requests (community board). |
| GET | `/stats/analytics` | admin | Totals, success rate, top-requested medicines. |
| GET | `/emergency-board` | public | Pending requests with nested responses. |
| POST | `/respond/{id}` | user | Respond to a request; **notifies requester**. |
| POST | `/approve/{id}` | donation owner | Approve against a donation; reserves it; pharmacies issue a voucher; **notifies requester**. |
| POST | `/{id}/feedback` | owner | Submit 1–5 rating + comment (only when fulfilled). |
| DELETE | `/admin/request/{id}` | admin | Delete any request. |
| PATCH / DELETE | `/my-request/{id}` | owner | Update / delete own request. |

#### AI — `/api/v1/chat`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/ask` | public | AI medical assistant (diabetes/hypertension scoped). |
| POST | `/identify-medicine` | public | Vision: identify medicine from a base64 photo → structured JSON + confidence. |

#### Pharmacy Inventory — `/api/v1/inventory`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/pharmacy` | pharmacy/admin | Own inventory (type, base_price, discount). |
| GET | `/near-expiry` | pharmacy/admin | Near-expiry items. |
| POST | `/pharmacy` | pharmacy/admin | Add inventory item. |
| PATCH | `/pharmacy/{id}` | owner | Update item (+ linked medicine). |
| DELETE | `/pharmacy/{id}` | owner | Delete item. |

#### Users — `/api/v1/users`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET / PATCH | `/me` | user | Own profile view / update. |
| POST | `/me/verify-documents` | user | Upload verification docs (multipart). |
| GET | `/me/notifications` | user | Own notifications. |
| POST | `/me/notifications/read-all` | user | Mark all read. |
| POST | `/me/report` | user | Submit a report. |
| GET | `/pharmacy/stats` | pharmacy/admin | Dispensing stats + rating. |
| GET | `/admin/stats` | admin | Platform-wide stats. |
| GET / PATCH | `/admin/reports[/{id}]` | admin | View / update report status. |
| POST | `/admin/users/{id}/ban` | admin | Deactivate a user. |
| GET / DELETE | `/admin/feedbacks[/{id}]` | admin | View / delete feedback. |
| DELETE | `/admin/donations/{id}` | admin | Delete any donation. |
| POST | `/admin/reservations/{id}/cancel` | admin | Cancel a reservation. |
| DELETE | `/admin/vouchers/{id}` | admin | Delete a voucher. |
| GET | `` (root) | admin | List all users (optional `role` filter). |
| PATCH / DELETE | `/{user_id}` | admin | Update / cascade-delete a user. |

#### Other routers
- **Vouchers** `/api/v1/vouchers`: `GET /me`, `POST /redeem/{id}`.
- **Medical History** `/api/v1/medical-history`: `GET/POST /reports`, `DELETE /reports/{id}`, `GET /logs`.
- **Inbox** `/api/v1/inbox`: `GET /chats`, `GET /messages/{user_id}`, `POST /messages` (**notifies recipient**).
- **Dashboard** `/api/v1/dashboard`: `GET /me` (stats, trust level, recent history).
- **Team** `/api/v1/team`: `GET /` (public), `POST/PATCH/DELETE` (admin).
- **Root** `GET /`: health check.

### Notification helper
`models/notification.py` exposes `create_notification(session, user_id, title, desc, type)` (adds a row; caller commits). Types: `info`, `success`, `warning`, `badge`. Fired on: response to your request, message to you, approval of your request, pharmacy verification.

### Cascade delete
`services/user_delete.py → delete_user_cascade()` manually removes all rows referencing a user (responses, requests, donations, reports, logs, notifications, vouchers, messages) before deleting the user.

### Utility scripts (`backend/`)
- `create_admin.py` — seeds a default admin if none exists.
- `migrate.py` — idempotent: runs `init_db()` then `ALTER TABLE`s any missing columns (safe to re-run).
- `alter_db.py` — older ad-hoc migration (superseded by `migrate.py`).

---

## 6. Database

**PostgreSQL** hosted on **Neon** (the code also supports SQLite locally — it branches on `DATABASE_URL.startswith("sqlite")`). Tables are created via `SQLModel.metadata.create_all(engine)` in `init_db()` on startup. Table names are the lowercased class names.

There are **no Python `Enum` types** — status/role fields are free-text strings with documented allowed values. **Alembic** is a listed dependency but unused; schema evolution is handled by the custom `migrate.py`.

### Tables (13)

| Table | Key columns | Foreign keys |
|---|---|---|
| **user** | id, email (unique), full_name, role, is_active, is_verified, phone, pharmacy_license/address/image_url, hashed_password, created_at | — |
| **medicine** | id, name, generic_name, manufacturer, category | — |
| **donation** | id, quantity, expiry_date, location, latitude, longitude, status, is_near_expiry, batch_info, price, type, base_price, discount_percentage, added_at | donor_id→user, medicine_id→medicine |
| **medicinerequest** | id, medicine_name, urgency, description, location, lat/long, status, reserved_donation_id, created_at | requester_id→user, reserved_donation_id→donation |
| **requestresponse** | id, message, created_at | request_id→medicinerequest, responder_id→user |
| **feedback** | id, rating (1–5), comment, created_at | user_id→user (author), target_id→user (recipient), donation_id→donation, request_id→medicinerequest |
| **voucher** | id (string PK), pharmacy, med, type, expiry, status | user_id→user |
| **message** | id, text, status, created_at | sender_id→user, receiver_id→user |
| **medicalreport** | id, name, type, size, file_url, date | user_id→user |
| **medicationlog** | id, med, note, date | user_id→user |
| **notification** | id, title, desc, type, is_new, created_at | user_id→user |
| **userreport** | id, subject, description, type, priority, status | user_id→user |
| **teammember** | id, name, role, bio, photo_url, github, linkedin, email, order | — (standalone) |

### Status / value conventions
| Field | Values |
|---|---|
| `user.role` | `user`, `pharmacy`, `admin` |
| `donation.status` | `available`, `reserved`, `delivered` |
| `donation.type` | `مجاني` (free), `خصم` (discount) |
| `medicinerequest.urgency` | `قصوى` (critical), `عالية` (high), `متوسطة` (medium) |
| `medicinerequest.status` | `pending`, `approved`, `fulfilled`, `cancelled` |
| `voucher.status` | `active`, `used` |
| `message.status` | `sent`, `read` |
| `userreport.priority` / `status` | `low/medium/high` · `open/investigating/resolved` |
| `notification.type` | `info`, `success`, `warning`, `badge` |

### Entity relationships
```
user ──┬─< donation >── medicine
       ├─< medicinerequest ──< requestresponse
       │        └─ reserved_donation_id → donation
       ├─< feedback (user_id author, target_id recipient) → donation / request
       ├─< voucher
       ├─< message (sender & receiver)
       ├─< medicalreport / medicationlog
       ├─< notification
       └─< userreport

teammember  (standalone, no FKs)
```
ORM `Relationship`s are declared only for User↔Donation, User↔MedicineRequest, Medicine↔Donation, and MedicineRequest↔RequestResponse; all other links are raw foreign keys.

---

## 7. Authentication & Authorization

- **Password hashing:** `passlib` with **pbkdf2_sha256** (chosen over bcrypt due to a Windows/Python bcrypt version conflict).
- **JWT issuance** (`core/security.py`): `create_access_token(subject)` encodes `{exp, sub: <email>}` with `SECRET_KEY` + `ALGORITHM`; default lifetime `ACCESS_TOKEN_EXPIRE_MINUTES` (fallback 30). The subject is the user's **email**.
- **Token validation** (`api/deps.py`): `OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")`; decodes the JWT, resolves the user by email, 401 on failure.
- **Dependency chain:**
  - `get_current_user` → authenticated user
  - `get_current_active_user` → requires `is_active`
  - `get_current_admin` → requires `role == "admin"`
  - `get_current_pharmacy` → requires `role in {pharmacy, admin}`
- **Login flow:** OAuth2 password grant where `username` = email.
- **Frontend:** stores the token in `localStorage`, attaches it on every request, and globally logs out on `401`.

---

## 8. AI Integration

Two-tier, resilient design: **backend proxy first, direct-browser Gemini fallback**.

### Backend (`app/api/chat.py`)
Multi-provider fallback chain built from whichever API keys are set, tried in order:
**Gemini → OpenAI → xAI (Grok) → Groq** (with a hardcoded Gemini key as last resort — see Security Notes).

- **`POST /chat/ask`** — Arabic system instruction constrains the assistant to **diabetes & hypertension** guidance with a "consult a doctor" disclaimer.
- **`POST /chat/identify-medicine`** — accepts a base64 image, returns structured fields: `name, generic_name, strength, form, manufacturer, expiry_date, description, confidence` (0–100). Gemini uses a JSON response schema; OpenAI-compatible providers use `response_format=json_object`.
- Default models (all env-overridable): Gemini `gemini-2.5-flash`, OpenAI `gpt-4o-mini`, Groq text `llama3-8b-8192`, xAI `grok-3-mini`/`grok-4`.

### Frontend (`src/services/gemini.js`)
- **`askGemini(message)`** — tries backend `/chat/ask`, then falls back to direct Gemini (temp 0.7, 1024 max tokens).
- **`identifyMedicineFromImage(file)`** — base64-encodes the file, tries backend `/chat/identify-medicine`, then direct Gemini Vision; robustly strips ```json fences, maps UNKNOWN/N/A→null, clamps confidence.
- Consumed by `Chatbot.jsx` (chat) and `MedicineScanner.jsx` / `Donate.jsx` (vision).

---

## 9. Internationalization (i18n)

- **Structure:** `src/i18n/translations.js` merges 6 modular locale files (`core`, `public`, `user`, `user2`, `admin`, `pharmacy`) into `{ ar: {...}, en: {...} }` (~2,357 keys total).
- **Keys:** flat dotted strings (e.g. `nav.dashboard`, `routes.search`, `landing.feature.search.title`).
- **Consumption:** `useLang().t(key)` looks up `translations[lang][key]`, falling back to Arabic, then the raw key.
- **RTL/LTR:** `LanguageProvider` derives `dir` from `lang` and imperatively sets `<html lang>` / `<html dir>`. Layouts use logical CSS (`start-*`, `end-*`, `ms-*`) and RTL-aware Framer Motion slide directions. Arabic-first fonts (Cairo/Tajawal). `index.html` defaults to `lang="ar" dir="rtl"`.

---

## 10. Deployment

Single root **`vercel.json`** using Vercel's `experimentalServices` multi-service model:

```json
{
  "rewrites": [
    { "source": "/api/v1/:path*", "destination": "/_backend/api/v1/:path*" }
  ],
  "experimentalServices": {
    "frontend": { "routePrefix": "/", "framework": "vite" },
    "backend":  { "entrypoint": "backend/main.py", "routePrefix": "/_backend", "framework": "fastapi" }
  }
}
```

- **frontend** — Vite build at `/`, served as the SPA. Output dir: default `dist/`.
- **backend** — FastAPI entrypoint `backend/main.py` (re-exports `app.main:app`), served at `/_backend`. Vercel installs `backend/requirements.txt` and runs it as serverless functions.
- **rewrites** — public `/api/v1/*` → `/_backend/api/v1/*`. *(Note: the frontend PROD base URL points directly at `/_backend/api/v1`, so this rewrite is effectively redundant — both reach the same backend.)*
- **Env vars** are supplied via the Vercel dashboard (local `.env` files are git-ignored).

**Build commands:** frontend `vite build`; backend none (dependency install + ASGI serve).

---

## 11. Environment Variables

> Names only — never commit real values. Local `.env` files are git-ignored; production values live in the Vercel dashboard. There is **no `.env.example`** in the repo (worth adding).

### Backend
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | DB connection string (PostgreSQL/Neon in prod; SQLite supported locally). |
| `SECRET_KEY` | JWT signing secret. |
| `ALGORITHM` | JWT signing algorithm (e.g. HS256). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime (default 30). |
| `GEMINI_API_KEY` | Google Gemini key (chat + vision). |
| `GEMINI_VISION_MODEL` | Gemini vision model (default `gemini-2.5-flash`). |
| `OPENAI_API_KEY` / `OPENAI_MODEL` / `OPENAI_VISION_MODEL` | OpenAI fallback provider. |
| `XAI_API_KEY` / `XAI_MODEL` / `XAI_VISION_MODEL` | xAI (Grok) fallback provider. |
| `GROQ_API_KEY` / `GROQ_MODEL` / `GROQ_VISION_MODEL` | Groq fallback provider. |

### Frontend (Vite — bundled at build time)
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Optional backend base URL override. |
| `VITE_GEMINI_KEY` | Client-side Gemini key (⚠️ exposed in the browser bundle). |
| `VITE_GEMINI_MODEL` | Client-side Gemini model (default `gemini-2.5-flash`). |

---

## 12. Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- A PostgreSQL database (or use SQLite locally)

### Frontend
```bash
# from project root
npm install
npm run dev          # http://localhost:5173
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows (PowerShell: venv\Scripts\Activate.ps1)
pip install -r requirements.txt

# create backend/.env with at least DATABASE_URL, SECRET_KEY, ALGORITHM,
# ACCESS_TOKEN_EXPIRE_MINUTES, GEMINI_API_KEY

python create_admin.py           # seed the admin account (first run)
python migrate.py                # apply any missing columns (safe to re-run)
uvicorn app.main:app --reload    # http://localhost:8000
```
In dev the frontend automatically targets `http://localhost:8000/api/v1` (no `VITE_API_URL` needed).

---

## 13. Security Notes

These are known items to address before a real production launch:

1. **CORS is fully open** (`allow_origins=["*"]` with credentials) — restrict to known origins in production.
2. **Hardcoded fallback Gemini key** in `app/api/chat.py` — an embedded secret; rotate and remove.
3. **Default admin credentials** in `create_admin.py` — change immediately after first login.
4. **`VITE_GEMINI_KEY` is exposed** in the browser bundle by design (client fallback) — prefer routing all AI through the backend proxy and restricting the key.
5. **AI endpoints are unauthenticated** (`/chat/ask`, `/chat/identify-medicine`) — consider rate-limiting/auth to prevent abuse.
6. **No centralized settings module** — env access is scattered; a `pydantic-settings` `Settings` object would centralize and validate config.
7. Some list endpoints (inbox, medical-history) **seed demo data** when empty — remove before production.

---

*Generated for the مُسند / Musnad graduation project.*
