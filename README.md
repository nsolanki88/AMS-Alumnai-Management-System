# AMS+ — Alumni Management & AI-Powered Engagement System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend: React + Vite + Tailwind](https://img.shields.io/badge/Frontend-React_18_|_Vite_|_Tailwind-38bdf8)](frontend)
[![Backend: Node.js + Express + Prisma](https://img.shields.io/badge/Backend-Node.js_|_Express_|_Prisma-68a063)](backend)
[![AI Service: FastAPI + Python](https://img.shields.io/badge/AI_Service-FastAPI_|_Python_3.10+-009688)](ai-service)
[![SRS v2: Compliant](https://img.shields.io/badge/Specification-SRS_v2_Authoritative-success)](docs)

> **AMS+** is an enterprise-grade full-stack web platform and AI microservice suite built strictly to the **SRS v2 specification**. It addresses the critical disconnect between academic institutions and their alumni through automated profile discovery, confidence-weighted matching, human-in-the-loop verification, intelligent doubt routing, structured mentorship, and batch community engagement.

---

## 🏛️ System Architecture

AMS+ follows a modern, distributed, service-oriented architecture:

```
                            ┌────────────────────────────────────────┐
                            │        React 18 + Tailwind SPA         │
                            │   (Vite, React Router v6, Recharts)    │
                            └───────────────────┬────────────────────┘
                                                │ REST API / JWT
                                                ▼
                            ┌────────────────────────────────────────┐
                            │       Node.js + Express Backend        │
                            │  (RBAC 5 Roles, Prisma ORM, PDFKit,    │
                            │   Rate Limiting, Audit Logging)        │
                            └───────┬────────────────────────┬───────┘
                                    │                        │
                      HTTP / JSON   │                        │ Prisma Client
                                    ▼                        ▼
         ┌──────────────────────────────────────┐  ┌─────────────────────────┐
         │     Python FastAPI AI Microservice   │  │    SQLite / PostgreSQL  │
         │  - Profile Matching & Confidence     │  │  (20 Relational Models) │
         │  - NLP Doubt Skill Extraction        │  └─────────────────────────┘
         │  - TF-IDF / Cosine Recommendations   │
         │  - Chatbot Intent & Entity Parsing   │
         │  * Deterministic Node.js Fallback    │
         └──────────────────────────────────────┘
```

---

## 👥 5-Tier Role-Based Access Control (RBAC)

AMS+ enforces strict RBAC across exactly **5 user roles**. Per SRS v2, there is **NO** 6th company/recruiter role.

| Role | Default Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **`STUDENT`** | `student@example.com` | `Password123!` | Directory browse (redacted contacts), post doubts, request 1-on-1 mentorship, register for workshops, engage in batch communities, RBAC-safe chatbot. |
| **`ALUMNI`** | `alumni@example.com` | `Password123!` | Manage profile & privacy settings (`PUBLIC`, `BATCH_ONLY`, `PRIVATE`), answer routed doubts, manage mentorship availability & requests, submit referral chains (A→B→C), participate in batch feed. |
| **`FACULTY`** | `faculty@example.com` | `Password123!` | Endorse alumni answers, issue guest lecture / workshop invitations, view departmental engagement analytics, browse verified alumni. |
| **`COUNCIL`** | `council@example.com` | `Password123!` | Bulk upload historical CSVs, identify unregistered alumni, trigger AI discovery, inspect confidence scores, human-in-the-loop verify/reject candidates, track outreach logs (>90-day alert), audit referral chains, export PDF reports. |
| **`ADMIN`** | `admin@example.com` | `Password123!` | Full system governance, user status management (activate/suspend), comprehensive audit log inspection, AI threshold configuration, PDF analytics export, master permissions. |

---

## ⚡ Quick Start & Run Commands

### Prerequisites
- **Node.js**: v18.0.0 or later (`node -v`)
- **npm**: v9.0.0 or later (`npm -v`)
- **Python**: v3.10 or later (`python3 --version` - optional if using Node.js built-in AI fallback)

---

### Step 1: Clone and Setup Backend

```bash
cd backend

# 1. Install Node.js dependencies
npm install

# 2. Configure environment variables (pre-configured for SQLite)
cp .env.example .env

# 3. Generate Prisma client and initialize database
npx prisma generate
npx prisma db push

# 4. Seed database with 5 persona accounts and historical records
npm run seed

# 5. Run backend automated tests (35+ test assertions)
npm test

# 6. Start backend development server (Runs on port 5000)
npm run dev
```

---

### Step 2: Setup and Launch Frontend

```bash
cd ../frontend

# 1. Install frontend dependencies
npm install

# 2. Build for production or start Vite development server
npm run dev
```
*Frontend opens at: **`http://localhost:5173`***

---

### Step 3: (Optional) Launch Python FastAPI AI Service

> **Note**: AMS+ features an automatic **Resilient AI Gateway**. If the FastAPI service is running, backend delegates NLP, matching, and scoring to it. If offline, backend seamlessly switches to its deterministic local fallback engine with zero downtime.

```bash
cd ../ai-service

# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run FastAPI microservice on port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*AI Swagger Docs: **`http://localhost:8000/docs`***

---

## 📋 Comprehensive Feature Matrix (SRS v2 Compliance)

### 1. Data Ingestion & Unregistered Identification
- **CSV Bulk Ingestion**: Robust streaming CSV upload with roll number deduplication and column mapping preview.
- **Unregistered Alumni Identifier**: Automatically queries historical alumni records with no linked registered user account (`userId IS NULL`).
- **Sample Datasets Included**: `backend/src/seed/sample_alumni_data.csv` (10 real records) and `backend/src/seed/duplicate_test_alumni.csv` (duplicate test).

### 2. AI Discovery & Multi-Factor Confidence Scoring
- **Discovery Engine**: Weighted matching algorithm evaluating 7 key parameters:
  - Name similarity (Levenshtein / Token Match): 25%
  - College/Institution match: 20%
  - Graduation Year proximity: 15%
  - Department / Branch: 15%
  - Company: 10%
  - Job Role / Designation: 10%
  - Location: 5%
- **Score Classification**:
  - `High Confidence` (>= 80%): Recommended for fast-track council verification.
  - `Medium Confidence` (50% - 79%): Requires council manual inspection.
  - `Low Confidence` (< 50%): Flagged as uncertain or duplicate.
- **Human-in-the-Loop Safeguard**: AI-discovered profiles **NEVER** automatically become verified alumni. Only Council or Admin can mark as `VERIFIED`.

### 3. Verification & Automated Lifecycle
- **Council Verification Workbench**: Inspect side-by-side college records vs public web profile links.
- **Automated Lifecycle Hooks**: On `VERIFIED`, system:
  1. Updates `PotentialMatch` to `VERIFIED`.
  2. Updates `AlumniRecord` verification status.
  3. Automatically finds or creates the corresponding `BatchGroup` (e.g., "Batch of 2021 - Computer Science").
  4. Automatically enrolls the alumni into their batch group.
  5. Records an immutable audit log entry.
  6. Dispatches notification to Council.

### 4. Privacy & Directory
- **Contact Redaction**: Students and Faculty never see private phone numbers or personal emails in public directory searches.
- **Granular Visibility Modes**: Alumni can toggle between `PUBLIC`, `BATCH_ONLY`, and `PRIVATE`.

### 5. Academic Support & Intelligent Doubt Routing
- **AI Skill & Topic Extraction**: Identifies domain (`Web Development`, `Machine Learning`, `Cloud`, etc.) and urgency from question text.
- **Alumni Recommendation**: Matches questions against Alumni skills and bio using TF-IDF token intersection.
- **Faculty Endorsements**: Faculty can endorse high-quality alumni answers, boosting answer credibility.

### 6. Mentorship & Workshop Management
- **1-on-1 Sessions**: Students can request sessions; Alumni can accept, decline, or reschedule.
- **Faculty Workshop Invitations**: Faculty can send guest lecture invitations to alumni with topic, date, and honorarium details.

### 7. Referral Chain Tracking
- **Chain Traceability**: Tracks multi-hop referral chains (`A -> B -> C`) to measure network reach and prevent fraud.
- **Council Audit**: Council inspects referral validity before official institutional endorsement.

### 8. RBAC-Enforced AI Chatbot
- **Context-Aware Assistance**: Chatbot understands natural language queries for directories, mentorship, doubts, and council statistics.
- **Security Boundaries**: Students asking for unverified candidates or council data receive strict RBAC denials.

### 9. Analytics & PDFKit Reporting
- **Interactive Visualizations**: Recharts-powered Funnels, Batch Distribution charts, and KPI cards.
- **Executive PDF Export**: Council and Admin can download formatted PDF reports with key engagement metrics.

---

## 🧪 Testing & Verification

Run the comprehensive test suite in `backend/`:

```bash
cd backend
npm test
```

The test suite validates:
1. **Authentication & Rate Limiting**: Registration, login, 5-failed-attempts account lockout, JWT generation.
2. **RBAC Security Boundaries**: Student attempting to verify alumni (HTTP 403 Forbidden), Council permitted (HTTP 200).
3. **CSV Ingestion & Deduplication**: Rejecting duplicate roll numbers across CSV rows and existing database records.
4. **AI Discovery Scoring**: Name, college, year, and branch weighted score calculation.
5. **Human-in-the-Loop Verification**: Match status transitions and automated batch group assignment.
6. **Directory Privacy Redaction**: Personal contact masking for unauthorized roles.
7. **Chatbot RBAC Enforcement**: Role-sensitive query evaluation.

---

## 📂 Project Structure

```
ams-plus/
├── ai-service/                   # Python FastAPI Microservice
│   ├── app/
│   │   ├── main.py               # FastAPI App & Middleware
│   │   ├── routers/              # discovery, doubts, recommendations, chatbot
│   │   ├── schemas/              # Pydantic v2 Request/Response Schemas
│   │   └── services/             # Discovery, NLP, TF-IDF Recommender, Chatbot
│   ├── requirements.txt          # fastapi, uvicorn, pydantic, scikit-learn
│   └── tests/                    # Pytest endpoint tests
├── backend/                      # Node.js + Express Backend API
│   ├── prisma/
│   │   └── schema.prisma         # 20 Relational Models
│   ├── src/
│   │   ├── config/               # Prisma singleton & environment config
│   │   ├── controllers/          # 14 Role-focused controllers
│   │   ├── middleware/           # auth, rbac, rateLimiter, errorHandler, validation
│   │   ├── routes/               # Modular Express routes
│   │   ├── seed/                 # Realistic seed data (5 roles, 10 records, 2 CSVs)
│   │   ├── services/             # AI Gateway + Fallback, Audit, PDFKit, OTP, Email
│   │   ├── app.js                # Express app setup
│   │   └── server.js             # HTTP server bootstrap
│   ├── tests/                    # Automated Node.js integration tests
│   ├── .env.example
│   └── package.json
├── frontend/                     # React 18 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, AppLayout, Chatbot, Notifications
│   │   ├── context/              # AuthContext (JWT + refresh token handling)
│   │   ├── pages/
│   │   │   ├── admin/            # Dashboard, Users, Audit Logs, Settings
│   │   │   ├── alumni/           # Dashboard, Profile, Doubts, Mentorship, Calendar, Referrals
│   │   │   ├── council/          # Dashboard, Bulk Upload, Unregistered, Verification, Outreach, Referrals, Groups, Analytics
│   │   │   ├── faculty/          # Dashboard, Directory, Invitations, Analytics
│   │   │   ├── student/          # Dashboard, Directory, Doubts, Mentors, Workshops, Community
│   │   │   └── ...               # Login, Register, OTP, Forgot/Reset Password, Landing
│   │   ├── services/             # Axios API client with interceptors
│   │   ├── App.jsx               # React Router v6 with ProtectedRoute
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── docker/                       # Docker & Compose deployment configs
│   ├── docker-compose.yml        # Multi-container orchestration (Postgres, Backend, AI, Frontend)
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── ai-service.Dockerfile
├── docs/                         # Architecture, Database, API, AI, Security, Demo
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── ai.md
│   ├── security.md
│   └── demo.md
└── postman/                      # Ready-to-import Postman Collection
    └── AMS_Plus_API_Collection.json
```

---

## 🔒 Security & Privacy Features

- **Passwords**: Hashed with `bcrypt` (10 rounds).
- **Session Security**: Short-lived JWT access tokens (8 hours) + cryptographically secure Refresh Tokens stored in DB.
- **Brute Force Protection**: Account lockout after 5 consecutive failed login attempts.
- **Rate Limiting**: Tiered IP rate limiting (100 req/15min general, 10 req/15min for auth endpoints).
- **Data Protection**: Zero exposure of personal email addresses or phone numbers to students or faculty in search results.
- **Audit Logging**: Immutable audit trails for all verification decisions, outreach logs, and administrative actions.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
