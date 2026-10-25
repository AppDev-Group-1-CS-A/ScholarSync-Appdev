# 📚 ScholarSync: Master Task & Feature Catalog

This document is your internal reference menu. You can review these tasks with your team, pick **1 or 2 small tasks per member** to test the git workflow, and hold the rest for later sprints.

---

## 🟢 Category 1: Quick Wins & Starter Tasks (Recommended for Testing)
*Best for getting your teammates familiar with cloning, creating branches, making commits, and opening their first Pull Request without risking breaking existing code.*

---

### Task 1.1: Reader Appearance Controls (Light / Sepia / Dark Mode)
- **Assigned to:** Frontend Developer / UI Designer
- **Difficulty:** 🟢 Easy (1–2 hours)
- **Value:** Highly noticeable visual feature for presentation; allows comfortable reading.
- **Files to modify:**
  - `frontend/app/books/[slug]/page.tsx`
  - `frontend/app/globals.css`
- **What to do:**
  1. Add a small toolbar on top of the book reader with three theme buttons:
     - **Light:** `#ffffff` background, dark text
     - **Sepia:** `#fbf0d9` background, `#5f4b32` text (classic paper feel)
     - **Dark:** `#1e1e2e` background, light gray text
  2. Add state `const [theme, setTheme] = useState<'light'|'sepia'|'dark'>('light')` and apply dynamic CSS classes to the reader container.
  3. Optional: Add font size adjustment buttons (`A-` and `A+`).

---

### Task 1.2: Reading Progress Bar & Scroll Indicator
- **Assigned to:** Frontend Developer
- **Difficulty:** 🟢 Easy (1 hour)
- **Value:** Gives instant user feedback while reading through long textbooks.
- **Files to modify:**
  - `frontend/app/books/[slug]/page.tsx`
- **What to do:**
  1. Add an event listener to the scroll container of the document.
  2. Calculate percentage: `(scrollTop / (scrollHeight - clientHeight)) * 100`.
  3. Display a sleek animated progress bar fixed at the top of the reader.

---

### Task 1.3: Interactive Swagger API Documentation (`/api-docs`)
- **Assigned to:** Backend Architect / Project Lead
- **Difficulty:** 🟢 Easy (1–2 hours)
- **Value:** Instructors love this. Allows testing every API route in the browser without needing Postman.
- **Files to modify:**
  - `backend/package.json`
  - `backend/src/server.ts`
- **What to do:**
  1. In `backend/`, install: `npm install swagger-ui-express swagger-jsdoc @types/swagger-ui-express`.
  2. Set up a simple Swagger definition in `backend/src/config/swagger.ts`.
  3. Mount `app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))`.
  4. Now visiting `http://localhost:5000/api-docs` opens a full interactive API portal!

---

### Task 1.4: Pre-set Sample Book One-Click Loader
- **Assigned to:** Database Engineer / Backend
- **Difficulty:** 🟢 Easy (1 hour)
- **Value:** Prevents the database from being empty on fresh setups; loads a demo book immediately.
- **Files to modify:**
  - `backend/src/routes/book.routes.ts`
  - `backend/src/controllers/book.controller.ts`
- **What to do:**
  1. Create a route `POST /api/books/seed-demo`.
  2. Insert a sample textbook (e.g. "Computer Science Fundamentals" with 3 pre-split segments) into MongoDB if the collection is empty.
  3. Adds instant demonstration capability during instructor grading.

---

## 🟡 Category 2: Medium Priority Core Features (Sprint 2)
*Meaningful functional improvements that show authentic ongoing development.*

---

### Task 2.1: Persistent Chat History per Book
- **Assigned to:** AI Engineer + Backend
- **Difficulty:** 🟡 Medium (1 day)
- **Value:** Solves a real problem—currently, refreshing the browser clears chat history.
- **Files to modify:**
  - `backend/src/models/chat-thread.model.ts` (New file)
  - `backend/src/controllers/chat.controller.ts`
  - `backend/src/routes/chat.routes.ts`
  - `frontend/components/ChatInterface.tsx`
- **What to do:**
  1. Create a schema in backend:
     ```ts
     { userId: String, bookId: ObjectId, role: String, content: String, timestamp: Date }
     ```
  2. Add `GET /api/chat/history/:bookId` and update `chat.controller.ts` to save messages to MongoDB.
  3. In `frontend/components/ChatInterface.tsx`, load past messages on component mount.

---

### Task 2.2: Automated Chapter / Section Summarizer
- **Assigned to:** AI Systems Engineer
- **Difficulty:** 🟡 Medium (3–4 hours)
- **Value:** Students can click "Summarize this chapter" rather than having to type a query.
- **Files to modify:**
  - `backend/src/controllers/chat.controller.ts`
  - `backend/src/routes/chat.routes.ts`
  - `frontend/app/books/[slug]/page.tsx`
- **What to do:**
  1. Create route `POST /api/chat/summary` taking `bookId` and optional page/segment range.
  2. Construct a Groq system prompt:
     *"Extract the 5 most important core concepts, definitions, and high-yield study takeaways from this text in bullet points."*
  3. Add a "Generate Summary" button in the book header with a slide-out drawer or modal.

---

### Task 2.3: Student Bookmarking & Personal Notes Drawer
- **Assigned to:** Frontend Developer + Backend
- **Difficulty:** 🟡 Medium (1 day)
- **Value:** Turns ScholarSync from a reader into a true personal study workspace.
- **Files to modify:**
  - `backend/src/models/note.model.ts` (New file)
  - `backend/src/controllers/note.controller.ts` (New file)
  - `frontend/app/books/[slug]/page.tsx`
- **What to do:**
  1. Create backend CRUD for user notes: `GET /api/notes/:bookId`, `POST /api/notes`.
  2. Add a collapsible "My Notes" sidebar tab in the book view where students can type thoughts or copy excerpts.

---

### Task 2.4: Study Telemetry & Time Tracker
- **Assigned to:** Database Engineer
- **Difficulty:** 🟡 Medium (3–4 hours)
- **Value:** Demonstrates MongoDB aggregation pipelines and telemetry metrics.
- **Files to modify:**
  - `backend/src/controllers/analytics.controller.ts` (New file)
  - `backend/src/routes/analytics.routes.ts` (New file)
  - `frontend/app/(root)/page.tsx`
- **What to do:**
  1. Add an interval heartbeat in the frontend that tracks reading time in minutes.
  2. Store time in `VoiceSession` or a `StudySession` collection.
  3. Write a MongoDB aggregation pipeline using `$group` to sum weekly study hours and display it on the dashboard.

---

## 🔴 Category 3: Advanced / High Impact Features (Sprint 3 & Final Defense)
*Impressive showcase features for final presentation.*

---

### Task 3.1: AI Flashcard & Multiple Choice Quiz Generator
- **Assigned to:** AI Systems Engineer + Frontend
- **Difficulty:** 🔴 Advanced (2 days)
- **Value:** High "wow" factor during final presentation.
- **What to do:**
  1. Use Groq with JSON Mode to output:
     ```json
     {
       "questions": [
         { "question": "...", "options": ["A", "B", "C", "D"], "correct": 1, "explanation": "..." }
       ]
     }
     ```
  2. Build an interactive interactive flashcard flip UI and quiz score tracker in the frontend.

---

### Task 3.2: Offline Document Caching with IndexedDB
- **Assigned to:** Database & Cross-Platform Engineer
- **Difficulty:** 🔴 Advanced (1–2 days)
- **Value:** Fulfills the hybrid persistence requirement in your proposal.
- **What to do:**
  1. Use browser `indexedDB` API to store downloaded text segments locally.
  2. When offline (`navigator.onLine === false`), serve book text from IndexedDB and show an "Offline Mode" banner.

---

### Task 3.3: Capacitor Mobile App Build (.apk)
- **Assigned to:** Cross-Platform Mobile Engineer
- **Difficulty:** 🔴 Advanced (1–2 days)
- **Value:** Proves cross-platform capability from your proposal.
- **What to do:**
  1. Run `npm install @capacitor/core @capacitor/cli @capacitor/android` in `frontend/`.
  2. Run `npx cap init` and `npx cap add android`.
  3. Export static build and build debug `.apk` using Android Studio.

---

## 💡 Recommended Starter Plan (To Test Your Workflow First)

Pick **1 small task per person / pair** for the next 2–3 days:

| Team Member | Assigned Starter Task | GitHub Issue | Why This One & How They Pair |
| :--- | :--- | :--- | :--- |
| **Keith Brian Laranjo (Lead)** | **System Integration & Branch Reviews** | PR Reviews & Dev Server | Oversees local environment setup, reviews PRs from all members, ensures zero conflicts. |
| **Aron Avila & Jerlyn Valdez** | **Mobile Hamburger Menu & Slide-out Drawer** | **[MOB-01] (#26)** | Aron codes the component on his laptop while Jerlyn tests mobile responsiveness and UI flow. |
| **Aron Avila & Jerlyn Valdez** | **Reader Appearance Controls & Themes** | **[FE-01] (#27)** | Aron manages React state & font scaling while Jerlyn designs Sepia/Dark palettes and mobile touch targets. |
| **Vencie Sales & Vincel Esguera** | **Automated Chapter Key Takeaways** | **[AI-01] (#29)** | Connects Groq LLM with a dedicated summarization prompt (`POST /api/chat/summary`). |
| **Vincel Esguera & Vencie Sales** | **One-Click Demo Textbook Seeder** | **[DB-01] (#30)** | Populates local MongoDB so the instructor never sees an empty bookshelf during demo. |
| **Crystil Tubog & Keith / Vencie** | **Interactive Swagger / OpenAPI Docs** | **[BE-01] (#28)** | Crystil structures API route specifications and descriptions while pairing on code implementation. |
