# AMS+ System Architecture

## Overview
AMS+ (Alumni Management & AI-Powered Engagement System) is designed using a modern **3-Tier Enterprise Architecture**:
1. **Presentation Tier**: React Single Page Application (Vite + Tailwind CSS + Lucide Icons + Recharts).
2. **Application Tier**: Node.js & Express.js REST API providing RBAC enforcement, session management, auditing, and business pipelines.
3. **AI Service Tier**: Python FastAPI microservice executing NLP-based public profile matching, transparent weighted confidence scoring, question classification, and chatbot intent parsing.
4. **Data Tier**: Relational Database modeled with Prisma ORM (SQLite for local out-of-the-box development, PostgreSQL for Docker / Production).

```
[ Browser / Client: React SPA ]
             |
             v (HTTPS / REST + JWT Bearer)
[ Node.js + Express Application Tier ]
  - JWT Authentication & 5-Role RBAC Middleware
  - CSV/Excel Import & Deduplication Engine
  - Verification & Batch Community Engine
  - Mentorship, Workshops, and Doubt Q&A Routing
  - In-app & Email Notification Dispatcher
  - Audit Log Collector
  - PDFKit Report Generator
     |                           |
     | (Prisma Client)           | (Internal HTTP / REST)
     v                           v
[ Database Tier ]        [ Python FastAPI AI Service ]
  - Users & Profiles       - Heuristic & NLP Discovery Engine
  - Alumni Records         - Weighted Confidence Scoring
  - Potential Matches      - Question Categorizer & Skill Extractor
  - Doubts & Posts         - Alumni Recommendation Ranker
  - Audit Logs             - Natural Language Chatbot Parser
```

## Key Architectural Principles
- **Mandatory Human-in-the-Loop Verification**: AI discovered candidates are always stored with `status: "pending"` and never auto-linked to official institutional records without Council approval.
- **Strict Role-Based Access Control**: Route protection on both frontend and backend (`STUDENT`, `ALUMNI`, `FACULTY`, `COUNCIL`, `ADMIN`).
- **Resilient Fallback**: The Node.js application contains a localized fallback gateway ensuring 100% feature availability even if the Python AI microservice is temporarily starting or offline.
