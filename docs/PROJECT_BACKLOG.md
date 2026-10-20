# ScholarSync: Project Task Backlog & Sprint Roadmap

**Project Title:** ScholarSync: Cross-Platform AI-Powered Interactive Study Companion & Knowledge Workspace  
**Architecture:** Decoupled Client-Server (Next.js Frontend Client + Express.js REST API Server + MongoDB)  
**Methodology:** Agile / Scrum Sprint Framework

---

## 👥 Team Roles & Responsibilities

| Role | Default Assignee | Primary Focus Areas |
| :--- | :--- | :--- |
| **Project Lead & Backend API Architect** | Member 1 (Lead) | Architecture, Express REST API, Security, Middleware, API Docs |
| **Frontend Developer & UI/UX Specialist** | Member 2 | Next.js Client Views, Tailwind UI, PDF Reader UX, Interactive Widgets |
| **AI Systems & RAG Pipeline Engineer** | Member 3 | Groq LLM Pipelines, Context Retrieval, Flashcards/Quiz AI, Summarization |
| **Database & Cross-Platform Engineer** | Member 4 | Local Caching (IndexedDB/SQLite), Capacitor Mobile, Analytics & Aggregations |

---

## ✅ SPRINT 1: Foundation & Baseline MVP (COMPLETED)

These tasks represent the foundational architecture established for the project.

| Task ID | Component | Task Title | Description | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ARCH-01** | Architecture | Client-Server Architecture Decoupling | Partition repository into decoupled `frontend/` (Next.js 16) and `backend/` (Express.js) tiers. | Lead | **Done** |
| **BE-01** | Backend | Express REST API Server Setup | Build standalone Node.js Express server on port `5000` with CORS, routing, and error handlers. | Lead | **Done** |
| **DB-01** | Database | MongoDB Schemas & Connection | Implement Mongoose models for `Book`, `BookSegment`, `User`, `VoiceSession`, and `Otp`. | Member 4 | **Done** |
| **BE-02** | Backend | Book CRUD & Segment Ingestion | Build REST endpoints for book uploads, slug resolution, and text segment storage. | Lead | **Done** |
| **FE-01** | Frontend | Responsive Dashboard & Navigation | Implement responsive layout, Book Showcase grid, and navigation bar. | Member 2 | **Done** |
| **FE-02** | Frontend | PDF Drag-and-Drop Ingestion | Create client-side file dropzone with `pdfjs-dist` text parsing and cover rendering. | Member 2 | **Done** |
| **AI-01** | AI Engine | Groq RAG Contextual Q&A | Implement contextual retrieval pipeline and prompt engineering for cited book Q&A. | Member 3 | **Done** |
| **AI-02** | Voice AI | Vapi AI Conversational Agent | Integrate Vapi Web SDK for bi-directional voice tutoring with dynamic book context tool calls. | Member 3 | **Done** |
| **AUTH-01**| Auth | Clerk Authentication & Admin Panel | Integrate Clerk user auth and administrator management table for banning/promoting accounts. | Lead | **Done** |

---

## 📋 SPRINT 2: Core Enhancements & Study Tools (CURRENT SPRINT)

These actionable tasks allow each member to contribute individual code commits, PRs, and features.

### 🎨 Member 2: Frontend & UI/UX Specialist
- [ ] **FE-03: Reader Appearance & Accessibility Controls**
  - **Files to touch:** `frontend/app/books/[slug]/page.tsx`, `frontend/components/`
  - **Description:** Add controls for reading themes (Light, Sepia, Dark Mode), font scaling (A- / A+), and distraction-free full-screen toggle.
  - **Deliverable:** UI control bar above the book reader interface.
- [ ] **FE-04: Text Highlight & "Ask AI About Selection" Popup**
  - **Files to touch:** `frontend/components/ChatInterface.tsx`, `frontend/app/books/[slug]/page.tsx`
  - **Description:** When the user selects text within a document, show a contextual tooltip with options: "Explain this", "Summarize selection", or "Add to Notes".
  - **Deliverable:** Interactive selection toolbar passing quote context to chat input.
- [ ] **FE-05: Reading Statistics & Study Streak Widget**
  - **Files to touch:** `frontend/app/(root)/page.tsx`, `frontend/components/HeroSection.tsx`
  - **Description:** Build visual dashboard cards showing: total minutes studied this week, number of pages read, and a daily study streak badge (🔥 Days Streak).
  - **Deliverable:** Polished dashboard metric cards.

---

### 🧠 Member 3: AI Systems & RAG Pipeline Engineer
- [ ] **AI-03: Persistent Chat History Storage**
  - **Files to touch:** `backend/src/models/chat-history.model.ts`, `backend/src/controllers/chat.controller.ts`, `frontend/components/ChatInterface.tsx`
  - **Description:** Currently chat history resets when the browser reloads. Store message threads in MongoDB linked to `userId` and `bookId` so conversations persist across sessions.
  - **Deliverable:** GET and POST `/api/chat/history/:bookId` endpoints with auto-reloading history on UI.
- [ ] **AI-04: AI-Generated Chapter Summaries & Key Takeaways**
  - **Files to touch:** `backend/src/controllers/chat.controller.ts`, `frontend/app/books/[slug]/page.tsx`
  - **Description:** Create an endpoint and prompt pipeline that analyzes segment batches and produces high-yield chapter bullet points, definitions, and takeaways.
  - **Deliverable:** POST `/api/chat/summary` endpoint and a "Generate Chapter Summary" modal tab in the book view.
- [ ] **AI-05: Smart Quiz & Flashcard Generator**
  - **Files to touch:** `backend/src/controllers/study.controller.ts`, `backend/src/routes/study.routes.ts`, `frontend/components/QuizModal.tsx`
  - **Description:** Use Groq LLM to automatically generate 5 multiple-choice questions or interactive flashcards based on any uploaded book segment.
  - **Deliverable:** JSON output schema for quizzes with question, 4 choices, correct answer, and explanation.

---

### 💾 Member 4: Database & Cross-Platform Engineer
- [ ] **DB-02: Client-Side Offline Caching with IndexedDB**
  - **Files to touch:** `frontend/lib/offline-storage.ts`, `frontend/hooks/useOfflineBook.ts`
  - **Description:** Implement local caching using IndexedDB (e.g., `idb` or native API) to store downloaded book text and recent AI answers for offline reading.
  - **Deliverable:** Indicator in the UI showing "Available Offline" when network is disconnected.
- [ ] **DB-03: Study Telemetry & Aggregation Analytics Pipeline**
  - **Files to touch:** `backend/src/controllers/analytics.controller.ts`, `backend/src/routes/analytics.routes.ts`
  - **Description:** Implement MongoDB aggregation queries (`$group`, `$match`, `$sum`) to compute weekly study duration, most reviewed books, and voice session duration per user.
  - **Deliverable:** GET `/api/analytics/study-time` returning structured chart data.
- [ ] **MOB-01: Capacitor Cross-Platform Mobile Environment Setup**
  - **Files to touch:** `frontend/capacitor.config.ts`, `frontend/package.json`
  - **Description:** Initialize `@capacitor/core` and `@capacitor/android` in the frontend so the Next.js app can be wrapped and previewed as an Android application.
  - **Deliverable:** Working `npx cap run android` configuration.

---

### 🛠️ Member 1: Project Lead & Backend API Architect
- [ ] **BE-03: Swagger / OpenAPI Interactive Documentation**
  - **Files to touch:** `backend/src/config/swagger.ts`, `backend/src/server.ts`
  - **Description:** Install and configure `swagger-ui-express` to serve interactive API documentation at `http://localhost:5000/api-docs` (vital for instructor testing).
  - **Deliverable:** Live browser GUI to test all REST endpoints without Postman.
- [ ] **BE-04: API Rate Limiting & Zod Request Validation Middleware**
  - **Files to touch:** `backend/src/middleware/rate-limiter.ts`, `backend/src/middleware/validate.ts`
  - **Description:** Add IP-based rate limiting (`express-rate-limit`) to prevent API abuse, and a generic Zod validator middleware for request body sanitation.
  - **Deliverable:** Safe protection against brute force and malformed payloads.
- [ ] **BE-05: Study Notes & Flashcards Persistence CRUD**
  - **Files to touch:** `backend/src/models/note.model.ts`, `backend/src/controllers/note.controller.ts`, `backend/src/routes/note.routes.ts`
  - **Description:** Create dedicated REST API endpoints for users to save, edit, and delete personal book notes and saved flashcards.
  - **Deliverable:** Full CRUD endpoints under `/api/notes`.

---

## 🔮 SPRINT 3: Polish, Export Tools & Presentation (FUTURE SPRINT)

| Task ID | Category | Task Description | Suggested Owner |
| :--- | :--- | :--- | :--- |
| **EXP-01** | Study Tools | Export Study Notes & Summary to Markdown / PDF file | Member 2 |
| **AI-06** | AI Engine | Voice Session Transcript Review & Key Moments Highlight | Member 3 |
| **MOB-02** | Mobile | Native microphone & audio permissions optimization for mobile | Member 4 |
| **TEST-01**| Quality Assurance | Automated REST API testing suite using Jest & Supertest | Member 1 |
| **DOC-01** | Documentation | Final Project Defense Slides, Architecture Diagram, and Demo Video | All Members |

---

## 📊 Suggested GitHub Project Board Setup

To show continuous progress on GitHub:
1. Go to your GitHub repository -> **Projects** -> **New Project** -> Select **Board template**.
2. Create 4 columns:
   - 📌 **Backlog** (Sprint 2 & 3 tasks)
   - ⏳ **In Progress** (Tasks actively assigned)
   - 🔍 **In Review / Pull Request** (Code waiting to be merged)
   - ✅ **Done** (Sprint 1 tasks already completed)
3. Convert each item from this document into a GitHub Issue and tag the corresponding team member.
