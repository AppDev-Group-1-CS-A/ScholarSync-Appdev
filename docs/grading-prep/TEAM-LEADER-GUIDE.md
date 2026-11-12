# 🔵 Team Leader (TL) Role — Comprehensive Grading Preparation Guide

**Assigned to:** Keith Brian Laranjo  
**GitHub:** [@Kenc01](https://github.com/Kenc01) / [@keithbrianlaranjo82](https://github.com/keithbrianlaranjo82)  
**Repo:** [AppDev-Group-1-CS-A/ScholarSync-Appdev](https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev)  
**Official Rubric Reference:** `docs/rubrics/Team Leader Rubrics.pdf`

---

## 📌 Executive Summary: What the Instructor Will Check

As the **Team Leader**, you are graded not just on writing code, but on your **architectural vision, integration oversight, and leadership across all three functional roles (Developer, QA, Project Manager)**:

```text
                                  ┌─────────────────────────────┐
                                  │      TEAM LEADER (Keith)    │
                                  │  • Architecture & Standards │
                                  │  • Merge Conflict Resolver  │
                                  │  • Team Observer & Mentor   │
                                  └──────────────┬──────────────┘
                    ┌────────────────────────────┼────────────────────────────┐
                    ▼                            ▼                            ▼
      ┌───────────────────────────┐┌───────────────────────────┐┌───────────────────────────┐
      │      DEVELOPER (Aron)     ││      QA LEAD (Vencie)     ││       PM (Cristyl)        │
      │ • Reader UI Themes (#27)  ││ • 10 Postman Endpoints    ││ • GitHub Project Board    │
      │ • Study Pane & Workspace  ││ • PR Reviews & Approvals  ││ • Master Documentation    │
      │ • Chat History UI (#41)   ││ • Issue Logging & Tests   ││ • Sprint Velocity & Rules │
      └───────────────────────────┘└───────────────────────────┘└───────────────────────────┘
```

> [!IMPORTANT]
> **Instructor Rubric Notes (From Official Team Leader Grading Sheet):**
> - *"Team Leaders are responsible for keeping the project going by managing each member to cooperate and contribute to the project."*
> - *"Team Leaders are given the authority to override a task from the Project Manager, QA, and Developer. But if the Leader chooses to be a Developer, they are not allowed to take on the task of a QA."*
> - *"Team Leaders are tasked to check on the Team for their cooperation. Any findings detrimental to the team, the Team Leaders are required to notify the Instructor to take action on inactive members."*
> - *"Do not pressure the members to participate if they refuse to contribute; this will reflect on them and not to the leader."*

---

## 🏆 Scoring 4/4 (Exemplary) on Every Rubric Criteria

| Rubric Criteria | Developing / Low Score (1–2 pts) | What You Must Show for Exemplary (4 pts) |
|---|---|---|
| **1. Repository Architecture & Health** | Messy repo, stale branches, broken builds, missing documentation. | Enforces clean decoupled architecture (`/frontend` on Next.js 19 + `/backend` on Express/TypeScript), `.gitignore` protecting secrets, interactive Swagger UI (`/api-docs`), and up-to-date `README.md`. |
| **2. Merge Conflict & Integration Supervision** | Broken builds on primary branch; leaves members to struggle with conflicts. | Oversees branch integration into `main`, assisted in resolving merge conflicts, ensured schema consistency across PRs. |
| **3. Team Activity & Velocity** | Heavy workload imbalance; inactive members ignored. | Monitored team velocity weekly, assigned scoped starter tasks (`docs/TASK_IDEAS.md`), paired weaker members with role leads. |
| **4. Team Coordination & Communication** | Team works in silos with zero alignment; conflicting code. | Facilitated clear cross-role communication: Dev pushes branch → QA tests & approves → PM merges & updates board. |
| **5. Overall Milestone Delivery** | Incomplete deliverables; stalled sprint goals. | Delivered all milestone requirements on schedule: Multi-tier architecture, RAG textbook querying, AI quiz generator, Voice assistant integration. |

---

## 🏛️ PART 1: The ScholarSync Architecture (Explain This First)

When asked to explain the system, give this high-level architectural walkthrough:

### 1. Decoupled Multi-Tier Structure
Unlike monolithic student projects where frontend and backend are tangled, ScholarSync is strictly partitioned:
- **Frontend (`/frontend` on Port 3000):**
  - **Framework:** Next.js 19 (App Router) + Tailwind CSS + Lucide Icons.
  - **Authentication:** Clerk client SDK for secure session management.
  - **Client Parsing:** `pdfjs-dist` for browser-based text extraction.
  - **Stateful UI:** Reader appearance switcher, collapsible study sidebar, active recall studio with flashcards.
- **Backend Server (`/backend` on Port 5000):**
  - **Runtime & Language:** Node.js (v20+ LTS), Express.js, TypeScript.
  - **Database:** MongoDB Atlas via Mongoose ODM (strictly structured schemas for Users, Books, BookSegments, ChatMessages, VoiceSessions).
  - **AI Pipeline:** Groq SDK utilizing high-throughput LLaMA models with contextual RAG chunking.
  - **API Documentation:** Interactive Swagger UI at `http://localhost:5000/api-docs`.
  - **Storage:** Vercel Blob storage for textbook PDF hosting.

### 2. The Data Flow Loop
```text
[PDF Upload] ──► [Client Text Chunking] ──► [MongoDB BookSegments]
                                                     │
                                                     ▼
[Student Question] ───────────────► [Backend RAG Keyword / Regex Search]
                                                     │
                                                     ▼
[LLM Tutor Output] ◄────────────── [Groq Prompt + Segment Context]
```

---

## 👥 PART 2: Defending and Overseeing Every Role

The instructor will likely ask: *"How did your team work together?"* or *"Walk me through how a feature went from idea to production."*

### 1. Overseeing the Developer (Aron Avila)
- **What Aron Built:** Reader appearance controls (Light, Sepia, Dark themes), font scaling (14px–22px), Claude-style collapsible sidebar, fullscreen canvas mode, and chat history UI.
- **Your Leadership Role:** You reviewed his UI PRs (#37), ensured responsive flexbox styling, and integrated his frontend layout with your backend RAG chat engine.

### 2. Overseeing the QA Lead (John Vencie Sales)
- **What Vencie Built & Tested:** Groq chapter summary (`POST /api/chat/summary`), practice quiz generator (`POST /api/chat/quiz`), chat message persistence, and the 10-endpoint Postman test suite.
- **Your Leadership Role:** You assisted in debugging Groq model deprecations, added request body fallbacks (accepting both `bookTitle` and `title`), and provided Swagger API documentation so QA could cross-verify Postman requests against OpenAPI schemas.

### 3. Overseeing the Project Manager (Cristyl Tubog)
- **What Cristyl Managed:** GitHub Projects Kanban board, task validity, issue priorities (High/Med/Low), PR merge gatekeeping (merging PRs #32, #33, #36, #37, #41, #42, #44), and repository documentation.
- **Your Leadership Role:** You established the Git branching workflow (`feature/<name>` → PR → QA Test → PM Merge) and ensured documentation (`PROJECT_PROPOSAL.md`, root `README.md`) accurately reflected the code.

---

## 🛡️ PART 3: Explaining Workload Balance & Low-Activity Members

> [!WARNING]
> **Instructor Rubric Note:**
> *"Team Leaders are tasked to check on the Team for their cooperation. Any findings that are detrimental to the team, the Team Leaders are required to notify the Instructor. Do not pressure members; inactivity reflects on them, not the leader."*

Two members have fewer commits:
- **Jerlyn Valdez (2 commits):** Built the Mobile Navigation Drawer (`feature/MobileNav`, PR #35).
- **Vincel Esguera (1 commit):** Built the Demo Book Database Seeder (`POST /api/books/seed-demo`, PR #36).

### How to Answer if the Instructor Asks: *"Why do Jerlyn and Vincel have fewer commits?"*
> **Scripted Answer:**  
> *"As Team Leader, I assigned scoped modular tasks to each member based on their technical experience:  
> - Jerlyn was assigned specifically to Mobile Usability & UI components (PR #35 for the mobile drawer with body scroll locking and profile state), and paired with John Vencie to assist in QA testing.  
> - Vincel was assigned to Data Operations (PR #36 for the one-click demo database seeder), and paired with Cristyl to assist in Project Board organization and documentation.  
> While the commit count is smaller, their features were critical: Vincel's seeder enables our one-click Postman demo, and Jerlyn's drawer ensures mobile responsiveness. I kept regular check-ins open and gave every member clear issues to contribute without overloading them."*

---

## 🗣️ PART 4: Tough Instructor Questions & High-Scoring Answers

### Q1: "How did you manage merge conflicts and branch protection?"
> **Answer:**  
> *"We enforced a strict branch workflow where direct pushes to `main` were discouraged. All work took place on dedicated feature branches (e.g., `feature/fe-01-reader-appearance`, `feature/ai-02-quiz-generator`). When merge conflicts arose—such as when both Aron and Vencie touched `ChatInterface.tsx`—I supervised the merge resolution locally by pulling both branches, confirming TypeScript compilation, verifying that chat persistence didn't break theme styling, and having Cristyl sign off on the final merge."*

### Q2: "What architectural decisions did you make to prevent system failure?"
> **Answer:**  
> *"Three major architectural choices:  
> 1. **Decoupled Architecture:** Separating Next.js and Express into distinct ports (3000 and 5000) so frontend UI crashes never take down the REST API or database connections.  
> 2. **RAG Context Fallback:** In `generatePracticeQuiz` and `chatWithBook`, if a book has no text segments indexed yet, rather than failing with a 500 error, we catch it gracefully and fall back to foundational textbook knowledge with structured prompt constraints.  
> 3. **Input Parameter Resiliency:** On endpoints like `/api/chat/quiz`, we accept both `title` and `bookTitle` to ensure zero breaking changes across frontend components."*

### Q3: "What tools did you use to maintain repository health?"
> **Answer:**  
> *"I implemented several automated and documentation safeguards:  
> - **Interactive Swagger UI (`/api-docs`):** Documented all REST routes so the team could test endpoints interactively without external dependencies.  
> - **Centralized Postman Collection:** Exported full test suites with environments for reproducible QA.  
> - **Environment Protection:** Added strict `.gitignore` rules and `.env.example` templates to prevent secret leaking.  
> - **DevOps Master Task Catalog (`docs/TASK_IDEAS.md`):** Provided clear, bite-sized tasks with file paths and acceptance criteria so teammates always had a roadmap."*

---

## 📋 Pre-Grading Team Leader Checklist

- [ ] Run `git status` — ensure working tree is clean on `main`.
- [ ] Confirm backend starts with `npm run dev` in `backend/` without errors.
- [ ] Confirm frontend starts with `npm run dev` in `frontend/` without errors.
- [ ] Open `http://localhost:5000/api-docs` in a browser tab — confirm Swagger loads.
- [ ] Open the GitHub repo Insights/Network tab — confirm branches are cleanly merged into `main`.
- [ ] Ensure all 4 grading guides exist in `docs/grading-prep/`:
  - `DEVELOPER-GUIDE.md` (Aron)
  - `QA-GUIDE.md` (Vencie + Jerlyn)
  - `PROJECT-MANAGER-GUIDE.md` (Cristyl + Vincel)
  - `TEAM-LEADER-GUIDE.md` (Keith)
- [ ] Hold a 15-minute quick mock run with the team before grading so everyone speaks confidently.

