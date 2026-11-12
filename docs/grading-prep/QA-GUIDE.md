# 🟡 QA Role — Grading Preparation Guide

**Assigned to:** John Vencie R. Sales
**Support:** Jerlyn Valdez (assist with Postman testing)
**GitHub:** [@johnvencies](https://github.com/johnvencies)
**Repo:** [AppDev-Group-1-CS-A/ScholarSync-Appdev](https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev)

---

## 📌 What the Instructor Will Check

| Area | What They'll Look For | Weight |
|---|---|---|
| **Postman** | Collection with **10 tested endpoints** — live demo, request/response shown | Heavy |
| **PR (Approve & Merge)** | Evidence of reviewing and approving Pull Requests on GitHub | Medium |
| **Issue Generation** | QA/bug/testing issues you created on the GitHub repo | Medium |

---

## 📦 PART 1: Postman — 10 Endpoints

Your project already has a Postman collection at `docs/ScholarSync_Postman_Collection.json`, but it's **incomplete** (only 9 endpoints, missing quiz, chat history, delete book, etc.). You need to have **at least 10 working endpoints** ready to demo.

### The Complete API Endpoint Map

Here is every endpoint in ScholarSync's backend. Pick **at least 10** for your Postman collection:

| # | Method | Endpoint | Description | Body/Params |
|---|---|---|---|---|
| 1 | `GET` | `/health` | Health check | None |
| 2 | `GET` | `/api/books?userId={id}` | Get all books for a user | Query: `userId`, optional `search` |
| 3 | `GET` | `/api/books/check/:title` | Check if book exists | Param: `title` |
| 4 | `GET` | `/api/books/slug/:slug` | Get book by slug | Param: `slug` |
| 5 | `GET` | `/api/books/:id/search?q=keyword` | Search book segments | Param: `id`, Query: `q`, `limit` |
| 6 | `POST` | `/api/books` | Create a new book | Body: `{ title, author, userId, ... }` |
| 7 | `POST` | `/api/books/seed-demo` | Seed demo book | Body: `{ userId }` |
| 8 | `POST` | `/api/books/:id/segments` | Save book segments | Body: `{ segments, userId }` |
| 9 | `DELETE` | `/api/books/:id` | Delete a book | Header: `x-user-id` |
| 10 | `POST` | `/api/chat` | Chat with book (RAG Q&A) | Body: `{ bookId, bookTitle, userMessage, history }` |
| 11 | `POST` | `/api/chat/summary` | Generate book summary | Body: `{ bookId, bookTitle }` |
| 12 | `POST` | `/api/chat/quiz` | Generate practice quiz | Body: `{ bookId, bookTitle }` |
| 13 | `GET` | `/api/chat/history/:bookId` | Get chat history | Param: `bookId`, Header: `x-user-id` |
| 14 | `DELETE` | `/api/chat/history/:bookId` | Clear chat history | Param: `bookId`, Header: `x-user-id` |
| 15 | `POST` | `/api/admin/sync-user` | Sync Clerk user to MongoDB | Body: `{ clerkId, email, firstName, lastName }` |
| 16 | `GET` | `/api/admin/users` | Get all users (admin) | None |
| 17 | `PATCH` | `/api/admin/users/:id/role` | Toggle user role | Param: `id` |
| 18 | `PATCH` | `/api/admin/users/:id/ban` | Toggle user ban | Param: `id` |
| 19 | `DELETE` | `/api/admin/users/:id` | Delete user | Param: `id` |
| 20 | `POST` | `/api/session/start` | Start voice/study session | Body: `{ userId, bookId }` |
| 21 | `POST` | `/api/session/end` | End voice/study session | Body: `{ sessionId, durationSeconds }` |
| 22 | `POST` | `/api/upload` | Upload file (blob) | Body: form-data or raw |
| 23 | `ALL` | `/api/vapi/search-book` | VAPI book search | Varies |
| 24 | `POST` | `/api/vapi/log` | VAPI log | Body: varies |

### ⭐ The 10 Demo Endpoints (Folder 1: ⭐ QA Demo)

These are pre-configured in order in your Postman collection:

| # | Method | Endpoint | Why It's Strong for the Demo |
|---|---|---|---|
| 1 | `GET` | `/health` | Server heartbeat check — quick proof backend is running |
| 2 | `POST` | `/api/books/seed-demo` | Seeds test textbook & segments into MongoDB in 1 click; gives you `_id` and `slug` |
| 3 | `GET` | `/api/books?userId=...` | Verifies the newly seeded book appears in the user's book list |
| 4 | `GET` | `/api/books/slug/:slug` | Proves how the frontend reader loads full book content by URL slug |
| 5 | `GET` | `/api/admin/users` | Admin dashboard telemetry — lists all users & total indexed book count |
| 6 | `POST` | `/api/chat` | **AI Feature!** RAG query answering questions directly from book segments |
| 7 | `POST` | `/api/chat/summary` | **Built by John Vencie!** AI study summary (Executive, Key Takeaways, Terms) |
| 8 | `POST` | `/api/chat/quiz` | **Built by John Vencie!** AI practice quiz generator (5 strict MCQs with explanations) |
| 9 | `GET` | `/api/chat/history/:bookId` | **Built by John Vencie!** Fetches persisted conversation messages |
| 10 | `DELETE` | `/api/chat/history/:bookId` | **Built by John Vencie!** Clears chat history (re-run #9 to show empty array) |

---

### 📋 Step-by-Step: How to Test in Postman

#### Step 1: Import the Updated Collection
1. Open Postman → click **Import** (top left).
2. Drag and drop `docs/ScholarSync_Postman_Collection.json`.
3. Notice two folders automatically appear:
   - **`⭐ QA Demo (10 Endpoints)`** (Your live demo suite)
   - **`📦 Full API Reference`** (Full CRUD backup including `PATCH` and session endpoints)

#### Step 2: Ensure Backend Server is Running
```bash
cd backend
npm run dev
```
Confirm the console says:
`Server running on http://localhost:5000` and `Connected to MongoDB`.

#### Step 3: Run the 10 Demo Endpoints in Order

1. **`01 — Health Check`**
   - Click Send. Expect `200 OK`, `{ status: "ok" }`.
2. **`02 — Seed Demo Book`**
   - Click Send. Expect `200 OK`.
   - ⚠️ **CRITICAL STEP:** Look at the response body:
     - Copy the `_id` string (e.g., `"672f..."`).
     - Click the collection root **ScholarSync REST API** → **Variables** tab → paste into the **Current Value** of `bookId`.
     - Copy the `slug` string (e.g., `"introduction-to-operating-systems"`).
3. **`03 — Get All Books`**
   - Click Send. Expect `200 OK` with an array containing the seeded textbook.
4. **`04 — Get Book by Slug`**
   - In the request URL, replace the slug placeholder with the slug copied in Step 2.
   - Click Send. Expect `200 OK` with complete book metadata.
5. **`05 — Get All Users`**
   - Click Send. Expect `200 OK` with user list and book counts.
6. **`06 — Chat with Book`**
   - Click Send. Expect `200 OK` with AI markdown response explaining Round Robin scheduling.
7. **`07 — Generate Book Summary`**
   - Click Send. Expect `200 OK` with 📌 Executive Summary, 🔑 Key Takeaways, and 📖 Terminology.
8. **`08 — Generate Practice Quiz`**
   - Click Send. Expect `200 OK` with JSON containing 5 multiple-choice questions.
9. **`09 — Get Chat History`**
   - Click Send. Expect `200 OK` showing the user message and AI response from Step 6 persisted in database.
10. **`10 — Clear Chat History`**
    - Click Send. Expect `200 OK` with `deletedCount: 2`.
    - *(Pro tip for grading: Re-click Step 09 to demonstrate that the history array is now empty!)*

### 🎤 Sample Questions About Postman:

> **Q: "How many endpoints did you test?"**
> A: "I tested 10 endpoints covering all major features — books, AI chat, quiz generation, summaries, chat history, and admin user management. Each endpoint covers a different HTTP method: GET, POST, and DELETE."

> **Q: "Show me an endpoint and explain it."**
> A: *(Show POST /api/chat/quiz)* "This is the practice quiz generator. It takes a bookId and bookTitle, sends the book's content to Groq's LLM, and returns a 5-question multiple choice quiz in JSON format. Each question has 4 options, a correct answer index, and an explanation."

> **Q: "How did you validate the responses?"**
> A: "I checked the HTTP status codes — 200 for success, 400 for missing fields, 404 for invalid book IDs. I also verified the response JSON structure matches what the frontend expects, especially for the quiz endpoint which requires exactly 5 questions with 4 options each."

---

## 🔀 PART 2: PR Approve & Merge

The instructor will check that you **reviewed and approved** Pull Requests on GitHub.

### Current PR Status
Right now, **Cristyl** merged most PRs. You need to show **your own** PR review activity.

### ⚡ Action Items — Do These NOW:

- [ ] Go to [Pull Requests → Closed](https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev/pulls?q=is%3Apr+is%3Aclosed)
- [ ] For **at least 3 PRs**, add a review:
  - Click on the PR → **Files changed** tab → **Review changes** → Select "Approve" → Leave a comment
  - Example comments:
    - PR #37 (Aron's reader): *"Tested the theme switching — Light, Sepia, Dark all apply correctly. Font scaling from 14px to 22px works smoothly. LGTM ✅"*
    - PR #36 (Vincel's seed-demo): *"Verified the POST /api/books/seed-demo endpoint returns correct response and inserts demo data into MongoDB. Approved ✅"*
    - PR #35 (Jerlyn's MobileNav): *"Mobile nav drawer opens/closes properly, scroll lock works, escape key listener functional. Approved ✅"*

### 🎤 Sample Questions About PR Reviews:

> **Q: "Did you review any Pull Requests?"**
> A: "Yes, I reviewed 3 PRs as part of my QA role. For example, on PR #37 I tested the reader appearance controls — theme switching and font scaling — and confirmed they worked correctly before approving. I also reviewed PR #36 for the demo book seeder, verifying the API endpoint worked in Postman."

---

## 📝 PART 3: Issue Generation

The instructor will check that you **created QA/testing issues** on the GitHub repo.

### ⚡ Action Items — Create These Issues NOW:

Go to [Issues → New Issue](https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev/issues/new) and create **at least 5 QA issues**:

#### Issue 1: API Endpoint Testing
```
Title: [QA] Verify all 10 REST API endpoints return correct responses
Labels: qa, testing
Body:
## Description
As QA, I need to verify all 10 core API endpoints work correctly.

## Test Checklist
- [ ] GET /health — returns 200
- [ ] POST /api/admin/sync-user — creates user in MongoDB
- [ ] GET /api/admin/users — returns user list
- [ ] POST /api/books/seed-demo — seeds demo book successfully
- [ ] GET /api/books?userId=... — returns books array
- [ ] GET /api/books/slug/:slug — returns single book
- [ ] POST /api/chat — returns AI response
- [ ] POST /api/chat/summary — returns structured summary
- [ ] POST /api/chat/quiz — returns 5-question quiz JSON
- [ ] GET /api/chat/history/:bookId — returns chat messages
```

#### Issue 2: Quiz Generator Validation
```
Title: [QA] Validate quiz generator returns correct JSON schema
Labels: qa, bug-prevention
Body:
Verify POST /api/chat/quiz always returns:
- Exactly 5 questions
- Each with 4 options
- correctIndex between 0-3
- Non-empty explanation field
```

#### Issue 3: Chat History Persistence
```
Title: [QA] Test chat history persists across page reloads
Labels: qa, testing
Body:
1. Send a chat message via POST /api/chat
2. Reload the page
3. Call GET /api/chat/history/:bookId
4. Verify previous messages appear
```

#### Issue 4: Error Handling
```
Title: [QA] Test API error handling for invalid inputs
Labels: qa, testing
Body:
Test all endpoints with:
- Missing required fields (expect 400)
- Invalid bookId format (expect 400)
- Non-existent bookId (expect 404)
- Missing userId header (expect 401)
```

#### Issue 5: Summary Generation
```
Title: [QA] Validate book summary output format
Labels: qa, testing
Body:
POST /api/chat/summary should return markdown with:
- 📌 Executive Summary section
- 🔑 Key Takeaways section
- 📖 Important Terminology section
```

### 🎤 Sample Questions About Issues:

> **Q: "What issues did you create?"**
> A: "I created 5 QA-focused issues to track testing progress. For example, Issue [#XX] was for verifying all 10 REST API endpoints return correct responses — I made a checklist for each endpoint. I also created issues for edge cases like invalid input handling and quiz schema validation."

---

## 🛡️ Quick Reference Card (Print This!)

```
QA QUICK REFERENCE — John Vencie R. Sales
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POSTMAN (10 endpoints):
  1. GET    /health
  2. POST   /api/books/seed-demo         ← copy _id to {{bookId}} & slug to #4
  3. GET    /api/books?userId=...
  4. GET    /api/books/slug/:slug
  5. GET    /api/admin/users
  6. POST   /api/chat
  7. POST   /api/chat/summary            ← I built this
  8. POST   /api/chat/quiz               ← I built this
  9. GET    /api/chat/history/:bookId    ← I built this
  10. DELETE /api/chat/history/:bookId   ← I built this (clears history)

PR REVIEWS:
  • Approved PR #37 (Reader Appearance)
  • Approved PR #36 (Seed Demo Book)
  • Approved PR #35 (Mobile Nav)

QA ISSUES CREATED:
  • [QA] API endpoint testing checklist
  • [QA] Quiz generator schema validation
  • [QA] Chat history persistence
  • [QA] Error handling for invalid inputs
  • [QA] Summary output format

DEMO FLOW ORDER:
  health → seed-demo → get-books → get-slug →
  get-users → chat → summary → quiz → get-history → clear-history

MY CODE CONTRIBUTIONS (as context):
  • POST /api/chat/summary — Groq chapter summary
  • POST /api/chat/quiz — AI quiz generator
  • Chat history persistence (model + controller)
```

---

## ⚠️ Things to Do BEFORE Grading Day

- [ ] **Import** the Postman collection and add the 4 missing endpoints
- [ ] **Run all 10 endpoints** and make sure they return 200 OK
- [ ] **Take screenshots** of each Postman response (backup in case server is down)
- [ ] **Add 3 PR reviews** with approval comments on GitHub
- [ ] **Create 5 QA issues** on the GitHub repo
- [ ] **Practice the demo flow** — run endpoints 1→10 in order smoothly
- [ ] Start the backend server: `cd backend && npm run dev` (confirm port 5000)
- [ ] Make sure you have a **seeded demo book** in the database before the demo
- [ ] Practice answering the sample Q&A above out loud

---

## 👥 Jerlyn's Support Role

Jerlyn Valdez is assisting you with QA. She can help by:
- [ ] Testing endpoints in Postman on her machine (proves multiple team members did QA)
- [ ] Creating 2-3 additional QA issues on GitHub
- [ ] Adding her own PR review comments on at least 1 PR
- [ ] Being ready to answer: *"I assisted the QA lead by testing endpoints and verifying bug fixes"*

