# ScholarSync Backend REST API

Standalone Node.js + Express + TypeScript RESTful API server for **ScholarSync**.

## 🛠️ Tech Stack
- **Framework:** Express.js 4 (TypeScript)
- **Database:** MongoDB via Mongoose ODM
- **AI / LLM:** Groq SDK (Llama 3.3 70B Versatile / GPT-OSS 120B)
- **Storage:** Vercel Blob SDK
- **Runtime:** Node.js (v20+ LTS)
- **Dev Runner:** `tsx`

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your actual credentials in `.env`:
- `MONGODB_URI`
- `GROQ_API_KEY`
- `BLOB_READ_WRITE_TOKEN`
- `PORT=5000`

### 3. Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 📡 REST API Documentation

### Health Check
- **`GET /health`** - Verifies server status.

### 📚 Books
- **`GET /api/books?userId=<userId>&search=<query>`** - Get books for a user (with optional search filter).
- **`GET /api/books/check/:title`** - Check if a book with the given title already exists.
- **`GET /api/books/slug/:slug`** - Get full details of a specific book by its slug.
- **`GET /api/books/:id/search?q=<query>&limit=5`** - Keyword & text search within book segments.
- **`POST /api/books`** - Create a new book record.
- **`POST /api/books/:id/segments`** - Save parsed text segments for a book.
- **`DELETE /api/books/:id`** - Delete a book, its segments, sessions, and blob storage files.

### 🤖 AI Study Assistant (RAG Chat)
- **`POST /api/chat`** - Ask a contextual question about a book.
  ```json
  {
    "bookId": "651234abcd...",
    "bookTitle": "Computer Science 101",
    "userMessage": "What is binary search?",
    "history": []
  }
  ```

### 🎙️ Voice Tutoring Sessions
- **`POST /api/session/start`** - Record the start of a voice tutoring session.
- **`POST /api/session/end`** - Record the duration and conclusion of a voice tutoring session.

### 👥 User & Admin Management
- **`GET /api/admin/users`** - List all users and their book counts.
- **`PATCH /api/admin/users/:id/role`** - Toggle user role between `user` and `admin`.
- **`PATCH /api/admin/users/:id/ban`** - Toggle user status between `active` and `banned`.
- **`DELETE /api/admin/users/:id`** - Remove a user and their uploaded materials.
- **`POST /api/admin/sync-user`** - Sync or upsert user profile on sign-in.

### 🎧 Vapi Webhook & Uploads
- **`ALL /api/vapi/search-book`** - Vapi AI function call handler for book content retrieval.
- **`POST /api/vapi/log`** - Remote telemetry log handler.
- **`POST /api/upload`** - Generates client upload token for Vercel Blob.
