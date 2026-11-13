# 🎯 ScholarSync — Sprint Milestones & Deliverables

**Repository:** [AppDev-Group-1-CS-A/ScholarSync-Appdev](https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev)  
**Project Board:** [GitHub Projects #3 (Kanban)](https://github.com/orgs/AppDev-Group-1-CS-A/projects/3)  
**Milestones Tracker:** [GitHub Milestones](https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev/milestones)  

---

## 📌 Milestone Status Summary

| Milestone | Sprint Window | Status | Issues | Merged PRs | Focus Area |
|:---|:---:|:---:|:---:|:---:|:---|
| **[Sprint 1: Baseline Architecture & MVP](https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev/milestone/1)** | Oct 19 – Oct 26 | **Closed (100%)** | 8 Closed | PR #1 | Decoupled client/server, MongoDB, RAG, Vapi |
| **[Sprint 2: Core Enhancements & Tools](https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev/milestone/2)** | Oct 27 – Nov 12 | **Complete (100%)** | 23 Closed | 11 PRs | Reader controls, Quizzes, Chat history, Swagger |
| **[Sprint 3: Polish & Packaging](https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev/milestone/3)** | Nov 13 – Nov 27 | **In Progress** | Active | S3 Scope | Mobile APK, Desktop build, Note export, E2E QA |

---

## 📦 Milestone 1: Baseline Architecture & MVP (Sprint 1)
* **Status:** Closed • Oct 19 – Oct 26, 2026
* **Objective:** Establish decoupled multi-tier architecture, basic PDF parsing, and foundational AI/Voice hooks.

| Issue | Feature / Deliverable | Assignee | Priority | Merged PR |
|:---:|:---|:---|:---:|:---:|
| **#2** | Decouple multi-tier structure (frontend:3000 / backend:5000) | Keith Brian | High | PR #1 |
| **#3** | Standalone Express REST API with healthcheck | Keith Brian | High | PR #1 |
| **#4** | MongoDB Atlas integration & Mongoose models | Vincel Esguera | High | PR #1 |
| **#5** | Responsive dashboard layout & book shelf | Jerlyn / Aron | Medium | PR #1 |
| **#6** | Client-side PDF ingestion engine (`pdfjs-dist`) | Vencie Sales | High | PR #1 |
| **#7** | Groq Llama 3.3 70B RAG Q&A with citations | Keith Brian | High | PR #1 |
| **#8** | Vapi conversational voice tutoring webhook | Keith Brian | Medium | PR #1 |
| **#9** | Clerk user authentication & protected routes | Keith Brian | Medium | PR #1 |

---

## 🚀 Milestone 2: Core Enhancements & Study Tools (Sprint 2)
* **Status:** Complete • Oct 27 – Nov 12, 2026
* **Objective:** Deliver interactive learning tools, Swagger documentation, and automated data seeding.

| Issue | Feature / Deliverable | Assignee | Priority | Merged PR |
|:---:|:---|:---|:---:|:---:|
| **#26** | Mobile slide-out navigation drawer (`< 768px`) | Aron / Jerlyn | Medium | PR #31, #35 |
| **#27** | Reader appearance controls (Light, Sepia, Dark + Font) | Aron / Jerlyn | High | PR #37, #38 |
| **#28** | Interactive Swagger UI docs at `http://localhost:5000/api-docs` | Keith / Vincel | High | PR #33 |
| **#29** | Groq chapter summarization (`POST /api/chat/summary`) | Vencie / Vincel | High | PR #34 |
| **#30** | One-click demo textbook seeder (`POST /api/books/seed-demo`) | Vencie / Vincel | Medium | PR #36 |
| **#39** | Persistent AI chat conversation history in MongoDB | Vencie / Aron | High | PR #41 |
| **#40** | 5-Question AI practice quiz generator (JSON Mode) | Vencie / Jerlyn | High | PR #44 |
| **#43** | Vapi Voice assistant automated setup CLI | Keith Brian | Medium | PR #42 |
| **#45** | Role-based grading prep guides & Postman test suite | Full Team | High | PR #45 |
| **#46** | Fix PDF parser Webpack worker crash (`pdf.min.mjs`) | Vincel Esguera | High | PR #46 |
| **#48** | Standalone admin portal with passcode access (`/admin-login`) | Keith Brian | Medium | PR #48 |

---

## 🛡️ PM Milestone Verification Sign-off

```text
✓ Project Board Sync: 100% of Milestone 1 & 2 cards reside in "Done" on GitHub Projects #3.
✓ Regression Sign-off: Appearance controls verified not to wipe active chat history.
✓ API Verification: Swagger UI (/api-docs) executes all 10 REST endpoints with 200 OK.
✓ Zero Inconsistencies: Verified with GitHub API; all closed issues match merged PR branches.
```

