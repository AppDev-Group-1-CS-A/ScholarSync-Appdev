# PROJECT PROPOSAL

**Project Title:** ScholarSync: Cross-Platform AI-Powered Interactive Study Companion & Knowledge Workspace  

**Submitted By:** Group 1 (CS-A)  
**Members & Roles:**  
- **Keith Brian Laranjo** – Team Leader & Full-Stack System Architect  
- **John Vencie R. Sales** – Developer (Frontend & Backend Engineer)  
- **Vincel Esguera** – Developer (Frontend & Backend Engineer)  
- **Aron Avila** – Project Manager (Documentation & Taskboard Lead)  
- **Jerlyn Valdez** – Project Manager (Documentation & Taskboard Support)  
- **Cristyl Tubog** – Quality Assurance (QA) Tester & Review Specialist  

**Submitted To:** Course Instructor — Application Development  
**Date:** November 2026  

---

## 1. Executive Summary

### 1.1 Project Overview
In higher education and self-directed study, students and researchers routinely encounter voluminous learning materials, such as comprehensive textbooks, syllabus packets, and research papers. Traditional digital readers only allow passive reading, resulting in cognitive fatigue, low information retention, and fragmented study habits.

**ScholarSync** is an intelligent, cross-platform learning companion and knowledge workspace engineered to convert static documents (PDFs and textbooks) into conversational, interactive knowledge bases. Through natural language querying, retrieval-augmented generation (RAG) with strict page/paragraph citations, and hands-free voice tutoring, ScholarSync creates an active learning loop. The platform empowers learners to master their curriculum faster, seamlessly transitioning across web browsers, desktop computers, and mobile devices.

### 1.2 Core Objectives
1. **Develop a Unified Cross-Platform Client:** Deliver a single, responsive application supporting Web browsers (Chrome, Edge, Firefox, Safari), Desktop workstations (Windows and macOS native builds), and Mobile environments (Android and iOS).
2. **Build a Local RESTful API Backend:** Construct a modular, fully documented RESTful API running on a local development server (`localhost:3000` / `localhost:5000`) managing authentication, book document processing, AI queries, and telemetry sessions.
3. **Implement Hybrid Data Persistence & Central Management:** Ensure high reliability by incorporating local client-side data persistence (caching documents and study notes for offline study) synchronized with centralized MongoDB database management for cross-device access.

---

## 2. System Architecture & Tech Stack

### 2.1 Frontend Platforms
- **Cross-Platform Framework:** Next.js (React 19) with Tailwind CSS, bundled with **Capacitor** for mobile runtimes and **Electron** for native desktop distribution.
- **Mobile Support:** Android (.apk) and iOS client packages configured via Capacitor plugins, leveraging native storage and audio drivers.
- **Web Support:** Modern progressive web application accessible across all standard web browsers (Google Chrome, Mozilla Firefox, Safari, Microsoft Edge).
- **Desktop Support:** Native desktop packages (.exe installer for Windows, .dmg / universal binary for macOS) wrapped via Electron.

### 2.2 Backend & Data Storage
- **Development Environment:** Node.js (v20+ LTS) running locally on `localhost`.
- **Framework / Language:** TypeScript, Next.js API Route Handlers / Express REST architecture, Zod validation schemas.
- **Database Management System (DBMS):**
  - **Central Database:** MongoDB (via Mongoose ODM) storing user profiles, book metadata, text embeddings/segments, chat histories, and voice session metrics.
  - **Local Persistence Layer:** IndexedDB (for Web & Desktop) and SQLite / Capacitor Storage (for Mobile) for local document caching and offline note access.
- **Authentication Method:** Secure JWT (JSON Web Tokens) with HTTP-only cookies, bcrypt password hashing, and role-based session validation.
- **AI & Processing Pipeline:**
  - **Document Parsing:** `pdfjs-dist` for client/server PDF text extraction and semantic chunking.
  - **Large Language Model (LLM):** Groq SDK (Llama 3.3 70B Versatile) for ultra-low latency contextual question-answering and summarization.
  - **Voice Tutoring:** Vapi AI Web/Mobile SDK for real-time bi-directional conversational voice tutoring.

---

## 3. Scope of Work & Features

### 3.1 Feature Matrix

| Module | Feature | Description | Platform Support |
| :--- | :--- | :--- | :--- |
| **Authentication & Profile** | Secure Auth & Session Management | User registration, login with JWT tokens, encrypted credentials, and personal profile management. | Web, Mobile, Desktop |
| **Document Processing** | PDF Parsing & Chunking Engine | Upload textbooks and research PDFs; automatically extract text, divide into structured segments, and calculate page indices. | Web, Desktop (Full Upload); Mobile (Read & Sync) |
| **Library Management** | Personal Bookshelf & Showcase | Dashboard displaying user's uploaded materials, reading progress, search filters, and pre-indexed sample literature. | Web, Mobile, Desktop |
| **AI Study Assistant** | Neural Context RAG Chat | Natural language Q&A against document content with exact page and paragraph citations to prevent AI hallucinations. | Web, Mobile, Desktop |
| **Voice Tutoring** | Hands-Free Voice Agent | Conversational speech-to-speech AI tutor powered by Vapi AI for auditory learners and active recall sessions. | Web, Mobile, Desktop |
| **Offline Persistence** | Local Document Cache | Caching downloaded document chunks and recent conversations locally on device for offline access. | Web (IndexedDB), Mobile (SQLite), Desktop (Electron Storage) |
| **Study Tools** | Smart Summaries & Notes | Automated generation of key chapter takeaways, study notes, and flashcard-ready insights. | Web, Mobile, Desktop |

### 3.2 Out of Scope
- Proprietary DRM-protected e-book format decryption (e.g., Apple Books FairPlay or Amazon Kindle formats).
- Offline speech-to-speech AI generation (voice LLM processing requires cloud connectivity to LLM/TTS endpoints).
- Collaborative multi-user simultaneous document editing (e.g., live multi-cursor Google Docs editing).

### 3.3 Team Work Breakdown & Responsibility Matrix (6-Member Pod Structure)

| Member | Assigned Role | Functional Pod | Primary Modules & Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Keith Brian Laranjo** | **Team Leader & Full-Stack System Architect** | Lead & Architecture | Decoupled multi-tier architecture, repository governance, branch protection, authentication (Clerk), cross-module supervision, and overall project direction. |
| **John Vencie R. Sales** | **Developer (Frontend & Backend Engineer)** | Development | Feature implementation, Groq chapter summary (`POST /api/chat/summary`), 5-question AI quiz generator (`POST /api/chat/quiz`), responsive reader canvas, and fullscreen toggle. |
| **Vincel Esguera** | **Developer (Frontend & Backend Engineer)** | Development | One-click demo textbook seeder utility ([#30](https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev/issues/30), PR [#36](https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev/pull/36)), MongoDB collection management, feature development, and UI component implementation. |
| **Aron Avila** | **Project Manager (Documentation & Taskboard Lead)** | Management & Docs | GitHub Project Board (Kanban), task prioritization, PR merge gatekeeping, system specifications & proposal maintenance, sprint planning, and progress tracking. |
| **Jerlyn Valdez** | **Project Manager (Documentation & Taskboard Support)** | Management & Docs | Documentation authoring, meeting minutes, task assignment coordination, project timeline management, and deliverable tracking support. |
| **Cristyl Tubog** | **Quality Assurance (QA) Tester & Review Specialist** | QA & Testing | 10-endpoint Postman test suite, PR review verification, testing issue logging, mobile responsive QA testing, cross-platform validation, and bug reporting. |

---

## 4. Resource Requirements

### 4.1 Hardware
- Development workstations running Windows 10/11 or macOS with a minimum of 8 GB RAM (16 GB recommended for running emulators).
- Physical Android and/or iOS test devices for live mobile hardware validation (microphone access, audio playback, storage).

### 4.2 Software Tools
- **IDE:** Visual Studio Code / Antigravity IDE.
- **Runtimes & Package Managers:** Node.js (v20+), npm / pnpm, Python (utility scripts).
- **Mobile Toolchains:** Android Studio (Android SDK, Android Virtual Device emulators), Xcode (for iOS builds if macOS is available).
- **API Testing & Database Tools:** Postman or Thunder Client for RESTful API testing, MongoDB Compass for database inspection.
- **Browser Suite:** Chrome DevTools, Firefox Developer Edition.

### 4.3 Version Control
- **Platform:** GitHub repository.
- **Workflow:** Git Flow branching strategy (`main` for stable production releases, `develop` for integration, and dedicated `feature/*` branches with pull request code reviews).
