# ScholarSync: Interactive Study Companion & Knowledge Workspace

ScholarSync is an AI-powered academic learning workspace engineered to convert static textbooks and PDF documents into interactive, conversational knowledge bases with precise page/paragraph citations and voice tutoring.

---

## 🏛️ System Architecture: Separated Multi-Tier Structure

As per strict software engineering principles and project specifications, the application is strictly partitioned into two decoupled layers:

```text
ScholarSync-Appdev/
├── backend/                       # RESTful API Server (Port 5000)
│   ├── src/
│   │   ├── config/                # MongoDB Database Connection
│   │   ├── controllers/           # API Handlers (Books, AI Chat, Voice Sessions, Admin)
│   │   ├── models/                # Mongoose Database Schemas
│   │   ├── routes/                # Modular REST Endpoints
│   │   ├── types/                 # Server-side TypeScript interfaces
│   │   ├── utils/                 # Slugs, regex security, text chunking
│   │   └── server.ts              # Express.js Server Entrypoint
│   ├── .env.example
│   ├── package.json
│   └── README.md                  # REST API & Postman Guide
│
├── frontend/                      # Client Application (Port 3000)
│   ├── app/                       # Next.js App Router (Pure Client Views)
│   │   ├── (auth)/                # Sign-in & Sign-up views
│   │   ├── (root)/                # Dashboard & Admin panel
│   │   └── books/[slug]/          # Book reader & AI workspace
│   ├── components/                # Modular React UI Components
│   ├── hooks/                     # Custom Hooks (useSession, useVapi)
│   ├── lib/actions/               # HTTP REST Client Connectors
│   ├── public/                    # Assets, logos, and banners
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
└── package.json                   # Root workspace management
```

### 1. Backend Server (`/backend`)
- **Technology:** Node.js (v20+ LTS), Express.js, TypeScript, Mongoose ODM.
- **Port:** `http://localhost:5000`
- **Responsibilities:**
  - Database persistence (MongoDB collections for Users, Books, Segments, and Telemetry).
  - Retrieval-Augmented Generation (RAG) queries with Groq AI.
  - Vapi speech assistant webhooks.
  - Role-based user and administrative management.
  - Fully testable independently via Postman / Thunder Client.

### 2. Frontend Client (`/frontend`)
- **Technology:** Next.js 16 (React 19), Tailwind CSS, Lucide Icons, Clerk.
- **Port:** `http://localhost:3000`
- **Responsibilities:**
  - Responsive study dashboard, PDF drag-and-drop uploader, reading views.
  - Communicates with the backend exclusively via standard HTTP REST API requests.
  - Does NOT contain any database schemas, direct database drivers, or backend server code.

---

## ⚡ Quick Start Guide

### Step 1: Install Dependencies
Open two terminal windows (or run from the respective directories):

```bash
# In the backend directory:
cd backend
npm install

# In the frontend directory:
cd frontend
npm install
```

### Step 2: Configure Environment Variables
- Copy `backend/.env.example` to `backend/.env` and insert your MongoDB URI and Groq API Key.
- Copy `frontend/.env.example` to `frontend/.env.local` and insert your Clerk API keys.

### Step 3: Run Both Services
In terminal 1 (start backend server first):
```bash
cd backend
npm run dev
# Starts on http://localhost:5000
```

In terminal 2 (start frontend client):
```bash
cd frontend
npm run dev
# Starts on http://localhost:3000
```

---

## 📡 REST API Summary (Postman Ready)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health status |
| `GET` | `/api/books?userId={id}&search={q}` | Retrieve user library with optional search |
| `GET` | `/api/books/slug/:slug` | Retrieve book metadata by unique slug |
| `GET` | `/api/books/:id/search?q={query}` | Search indexed text segments |
| `POST` | `/api/books` | Create a new book entry |
| `POST` | `/api/books/:id/segments` | Save extracted PDF text segments |
| `DELETE`| `/api/books/:id` | Remove a book and its segments |
| `POST` | `/api/chat` | Send question to Groq AI RAG pipeline |
| `POST` | `/api/session/start` | Start voice tutoring session |
| `POST` | `/api/session/end` | Conclude voice tutoring session |
| `GET` | `/api/admin/users` | List all users and book statistics |
| `PATCH`| `/api/admin/users/:id/role` | Toggle user role (`user` / `admin`) |
| `PATCH`| `/api/admin/users/:id/ban` | Toggle user status (`active` / `banned`) |
| `DELETE`| `/api/admin/users/:id` | Admin delete user account |
