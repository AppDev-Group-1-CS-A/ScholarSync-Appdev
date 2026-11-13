# 🟣 Project Manager (PM) Role — Grading Preparation Guide

**Assigned to:** Cristyl Tubog  
**Support:** Vincel Esguera (assists with board updates, documentation sync, and task verification)  
**GitHub:** [@tubogcristyl](https://github.com/tubogcristyl)  
**Repo:** [AppDev-Group-1-CS-A/ScholarSync-Appdev](https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev)  
**Official Rubric Reference:** `docs/rubrics/Project Manager Rubrics.pdf`

---

## 📌 Executive Summary: What the Instructor Will Check

According to the official rubric and your instructor's criteria, the **Project Manager** is evaluated on two core pillars and five strict criteria:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PROJECT MANAGER PILLARS                               │
├──────────────────────────────────────┬──────────────────────────────────────┤
│       1. PROJECT BOARD & ISSUES      │       2. PROJECT DOCUMENTATION       │
│  • Kanban Board Structure & Columns  │  • System Architecture & README      │
│  • Task priorities (High/Med/Low)    │  • Project Proposal & Specs          │
│  • Validity & status of tasks        │  • Swagger API Docs (/api-docs)      │
│  • Bug reports with reproduction steps│  • Postman API Documentation        │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

> [!IMPORTANT]
> **Instructor Rubric Note (From Official Grading Sheet):**
> *"Project Managers are responsible for managing the Issues and Project board of the repository. Any found inconsistencies in the project board/issues and the actual project shall reflect on the Project Manager's rating."*
> *"Project Managers are responsible to confirm the validity and status of a task and should update the project board accordingly."*
> *"Project Managers are tasked to always remind the developers on the specific task needed to be done."*
> *"Project Managers should set task priority accordingly to set team's goal."*

---

## 🏆 Scoring 4/4 (Exemplary) on Every Rubric Criteria

| Rubric Criteria | What "Needs Improvement" (1 pt) looks like | What You Must Show for "Exemplary" (4 pts) |
|---|---|---|
| **1. Local Testing & Verification** | Skips local testing; approves code blindly. | Pulls PR branches locally (`git checkout <branch>`), runs `npm run dev`, and verifies features against requirements and edge cases. |
| **2. Detailed Bug Reporting** | Logs vague issues or communicates informally in chat. | Logs structured bug reports on GitHub Issues with: Steps to Reproduce, Expected vs. Actual, Screenshots, and Console/Server Logs. |
| **3. PR Review Timeliness** | Delays reviews past sprint deadline; bottlenecks team. | Reviews and processes assigned PRs within **24 hours** to maintain steady velocity. |
| **4. Review Depth & Feedback** | Approves PRs with empty comments or "LGTM". | Leaves constructive inline comments on code logic, performance, security, and UI/UX responsiveness. |
| **5. Regression Testing & Sign-off** | Merges with unresolved bugs; doesn't re-test. | Verifies that new merges do not break existing features (e.g. reader theme changes don't break chat, new endpoints don't break database indexing). |

---

## 📋 PART 1: The Project Board Setup (GitHub Projects)

If your GitHub Project Board isn't 100% up to date, set it up immediately using **GitHub Projects (v2 / Board view)**:

### 1. Board Columns
Organize the board into 5 standard Agile Kanban columns:

```text
[ 📋 Backlog ] ──► [ 📌 To Do ] ──► [ ⏳ In Progress ] ──► [ 🔍 In Review / QA ] ──► [ ✅ Done ]
```

- **Backlog:** Future feature ideas (e.g., Audio export, offline PWA caching, spaced repetition stats).
- **To Do:** Prioritized tasks for the current sprint with assignees.
- **In Progress:** Branches actively being coded by developers.
- **In Review / QA:** PR opened; awaiting local testing, QA verification, and merge approval.
- **Done:** Merged into `main`, verified with zero regressions, and closed.

### 2. Standard Issue Fields & Metadata
Every single card on the board must have:
- **Title:** Clear and prefixed (e.g., `[FE-01] Reader Appearance Controls`, `[AI-02] Quiz Generator`, `[BUG] Fix Quiz Title Request Payload`).
- **Assignee:** The specific member responsible (Aron, Vencie, Jerlyn, Vincel, or Keith).
- **Priority Label:** `priority: high`, `priority: medium`, `priority: low`.
- **Category Label:** `frontend`, `backend`, `ai-service`, `documentation`, `qa-testing`, `bug`.
- **Milestone:** `Sprint 1 - Core Architecture`, `Sprint 2 - Interactive AI & Study Tools`.

### 3. Task Mapping: Project Reality vs. Project Board

Ensure all completed work matches cards in the **Done** column:

| Issue ID | Feature Title | Assignee | Status on Board | Merged PR |
|---|---|---|---|---|
| **#27** | `[FE-01] Reader Appearance Controls (Light/Sepia/Dark)` | Aron Avila | **Done** | PR #37 |
| **#28** | `[BE-01] Interactive Swagger UI (/api-docs)` | Keith / Vincel | **Done** | PR #33 |
| **#30** | `[DB-01] Demo Book Database Seeder Endpoint` | Vincel Esguera | **Done** | PR #36 |
| **#34** | `[AI-01] Groq Chapter Summary Endpoint` | John Vencie Sales | **Done** | PR #34 |
| **#35** | `[FE-02] Mobile Navigation Drawer & Drawer State` | Jerlyn Valdez | **Done** | PR #35 |
| **#41** | `[STUDY-01] Persistent Chat Conversation History` | Aron / Vencie | **Done** | PR #41 |
| **#42** | `[DOCS-01] Vapi Voice Assistant Setup & Rubrics` | Keith Brian | **Done** | PR #42 |
| **#44** | `[AI-02] Practice Quiz & Multiple Choice Generator` | John Vencie Sales | **Done** | PR #44 |

---

## 📑 PART 2: Project Documentation Ownership

As Project Manager, you must know where all documentation lives and be ready to open and present it:

### 1. Root Repository README (`README.md`)
- **Key Sections:**
  - Multi-tier decoupled architecture diagram (`/frontend` on port 3000, `/backend` on port 5000).
  - Prerequisites (`Node.js v20+`, `MongoDB URI`, `Groq API Key`, `Clerk Authentication`).
  - Installation and startup commands (`npm run dev` at root, or individual workspaces).
  - Core features overview (Active Recall, Voice Tutoring, Flashcards, AI Quizzes).

### 2. Comprehensive Project Proposal (`docs/PROJECT_PROPOSAL.md`)
- **Key Sections to Highlight:**
  - **Section 1: Executive Summary** — Why ScholarSync exists (addressing passive reading fatigue through active recall and contextual AI).
  - **Section 2: Architecture & Tech Stack** — Next.js 19, TypeScript, Express.js, MongoDB, Groq LLM (Llama 3.3 70B), Vapi voice engine.
  - **Section 3: Scope of Work & Features** — Feature matrix and 6-member pod structure.
  - **Section 4: Resource Requirements** — Tools, environment, and version control strategy.

### 3. Sprint Milestones Log (`docs/MILESTONES.md`)
- **Key Sections to Highlight:**
  - **Milestone 1 (Sprint 1: Baseline Architecture & MVP):** Decoupled architecture, Express API, MongoDB schemas, basic Groq RAG.
  - **Milestone 2 (Sprint 2: Core Enhancements & Study Tools):** Reader controls, chat persistence, quiz generator, summary endpoint, demo seeder, admin portal.
  - **PM Milestone Sign-Off:** Verification table proving zero inconsistencies with GitHub Project Board #3.

### 4. Development Roadmap & Timeline (`docs/ROADMAP.md`)
- **Key Sections to Highlight:**
  - **Sprint Progression:** Visual flowchart showing Sprint 1 -> Sprint 2 -> Sprint 3 -> Final Defense.
  - **Sprint 3 Work Packages:** Export tools, voice telemetry, Capacitor mobile APK, and automated E2E tests.
  - **Kanban Governance:** 5-column board flow and priority matrix (`high`, `medium`, `low`).

### 5. Interactive API Documentation (Swagger UI)
- **Live URL:** `http://localhost:5000/api-docs`
- **Location:** `backend/src/config/swagger.ts`
- **Why it matters:** Proves the team follows professional software engineering standards; allows live execution of REST routes in the browser.

### 6. Postman API Collection
- **Location:** `docs/ScholarSync_Postman_Collection.json`
- **Why it matters:** Shows API test suites for automated and manual verification.

---

## 🐛 PART 3: Bug Logging & Issue Lifecycle (Templates)

To get an **Exemplary (4 pts)** in Bug Reporting, ensure at least 2–3 resolved or active bug tickets follow this professional format:

### Bug Issue Template
```markdown
### 🐛 Bug Description
When sending a request to the quiz generation endpoint with `title` instead of `bookTitle`, the server responded with a 400 Bad Request error.

### 🔁 Steps to Reproduce
1. Start backend server on `http://localhost:5000`.
2. Send POST request to `/api/chat/quiz`.
3. Provide payload: `{ "bookId": "6715...", "title": "Calculus I" }`.
4. Observe error response: `Missing bookTitle`.

### 🎯 Expected Behavior
The endpoint should accept either `bookTitle` or `title` as valid parameters for frontend compatibility.

### 🔍 Actual Behavior
Returns HTTP 400 with `{ "success": false, "error": "Missing bookId or bookTitle" }`.

### 💻 Environment & Logs
- OS: Windows 11
- Backend: Node.js v20.x, Express 4.x
- Commit: `e38ce02`

### 🏷️ Resolution
Resolved in PR #44 / Commit `303d276` by adding fallback:
`const bookTitle = rawBookTitle || title || "this textbook";`
```

---

## 🗣️ PART 4: Sample Instructor Interview Q&A (Cristyl)

### Q1: "As the Project Manager, how did you track and manage tasks across the team?"
> **Answer:**  
> *"I managed our workflow using a centralized GitHub Kanban Project Board split into Backlog, To Do, In Progress, In Review/QA, and Done. Every single deliverable was created as a GitHub Issue labeled with priority (High, Medium, Low) and domain (Frontend, Backend, AI). I monitored task validity so that developers only worked on scoped features, and tasks only moved to 'Done' after local testing, QA verification, and successful branch merges."*

### Q2: "How did you ensure that merged pull requests didn't break existing features (Regression Testing)?"
> **Answer:**  
> *"Before merging any PR, we pulled the feature branch locally and performed verification against both standard use cases and edge cases. For instance, when Aron submitted PR #37 for Reader Appearance Controls, I tested that switching between Light, Sepia, and Dark modes did not clear active chat history or disable the AI study sidebar. Once verified locally, I merged the PR and notified QA to run regression tests on the main branch."*

### Q3: "What documentation does this project have, and who is responsible for it?"
> **Answer:**  
> *"I oversaw the overall documentation package, which includes:  
> 1. Our comprehensive Project Proposal in `docs/PROJECT_PROPOSAL.md` covering system architecture, objectives, and tech stack.  
> 2. Root and workspace READMEs with quick-start guides and environment configurations.  
> 3. Interactive Swagger API documentation available at `http://localhost:5000/api-docs`.  
> 4. Exported Postman test collections in `docs/ScholarSync_Postman_Collection.json` for API testing."*

### Q4: "How did you handle delays or when a developer was blocked?"
> **Answer:**  
> *"I conducted regular check-ins to monitor team velocity. Whenever a developer encountered a roadblock—for example, schema mismatch on the quiz endpoint or CORS issues between frontend port 3000 and backend port 5000—I tagged the appropriate backend lead or architect, prioritized the fix on the board, and ensured the PR was reviewed within 24 hours to keep development moving."*

---

## 👥 PART 5: Vincel's Support Role (PM Co-Pilot)

**Vincel Esguera** is partnered with you to support Project Management and Data Operations:
- [ ] **Board Maintenance:** Vincel double-checks that all closed PRs have their associated issues moved to **Done**.
- [ ] **Database Seeder Documentation:** Vincel documents how the `POST /api/books/seed-demo` endpoint works so anyone testing the app can seed demo data in one click.
- [ ] **Meeting Notes & Sprint Log:** Vincel keeps a short Markdown log of sprint dates, completed features, and next steps in `docs/SPRINT_LOG.md`.

---

## 🛡️ Quick Reference Card (Print This!)

```
PROJECT MANAGER QUICK REFERENCE — Cristyl Tubog
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ROLES & RESPONSIBILITIES:
  • Owner of GitHub Project Board (Kanban) & GitHub Issues
  • Enforcer of task priorities (High / Medium / Low)
  • Primary PR Merge Gatekeeper (Merged PRs #32, #33, #36, #37, #41, #42, #44)
  • Custodian of Project Documentation (Proposal, README, Swagger)

KEY FILES TO SHOW THE INSTRUCTOR:
  1. GitHub Projects Board (Browser) — https://github.com/orgs/AppDev-Group-1-CS-A/projects/3
  2. docs/MILESTONES.md (Sprint Milestones & Delivered Features Log)
  3. docs/ROADMAP.md (High-Level Sprint Timeline & Kanban Matrix)
  4. docs/PROJECT_PROPOSAL.md (System Architecture & Member Roles)
  5. README.md (Root Architecture & Setup)
  6. http://localhost:5000/api-docs (Swagger UI)
  7. docs/ScholarSync_Postman_Collection.json (API Suite)

THE 5 RUBRIC TARGETS (Aiming for 4/4):
  1. Local Testing: Checked out branches, tested npm run dev locally
  2. Bug Reporting: Structured issues with steps to reproduce & logs
  3. Timely Reviews: Reviewed & merged PRs within 24-48 hours
  4. Constructive Feedback: Code quality, UI responsiveness, error handling
  5. Regression Sign-off: Tested that new features don't break old ones
```

---

## ⚠️ Pre-Grading PM Checklist (Do These Before Presentation Day)

- [ ] Open GitHub → Projects: Confirm every member (Aron, Vencie, Jerlyn, Vincel, Keith) has tasks assigned.
- [ ] Confirm no orphaned issues remain in "In Progress" if the PR is already merged.
- [ ] Check PR descriptions for #32, #33, #36, #37, #41, #42, #44 — ensure each has a concise summary.
- [ ] Run both servers (`npm run dev`) and test `http://localhost:5000/api-docs` to ensure Swagger renders cleanly.
- [ ] Keep `docs/PROJECT_PROPOSAL.md` open in a tab ready to display during the presentation.
- [ ] Rehearse the sample interview answers with the team.

