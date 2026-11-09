# 💻 ScholarSync — Teammate Local Installation & Setup Guide

This guide is designed for **every team member** to clone and run ScholarSync smoothly on their own laptop (Windows / Mac).

---

## ⚡ Quick Summary (The 4 Steps)
1. **Prerequisites:** Install Node.js v20+ and Git.
2. **Clone the Repo:** `git clone https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev.git`
3. **Copy the `.env` Files:** Put the team environment keys into `backend/.env` and `frontend/.env.local`.
4. **Install & Run:** Run the backend on Terminal 1, and frontend on Terminal 2.

---

## 🛠️ Step 1: Check Prerequisites

Open your terminal (PowerShell on Windows, or Terminal on Mac) and verify Node.js:

```bash
node -v
npm -v
```
> If you don't have Node.js or it is below v18, download and install **Node.js LTS (v20 or v22)** from [nodejs.org](https://nodejs.org).

---

## 📥 Step 2: Clone & Open the Repository

```bash
git clone https://github.com/AppDev-Group-1-CS-A/ScholarSync-Appdev.git
cd ScholarSync-Appdev
```

---

## 🔑 Step 3: Set Up Environment Variables (`.env`)

Because API keys and database credentials are kept out of GitHub for security, you need to create **two local environment files**. 

Ask **Keith (Team Leader)** for the shared team `.env` values, or copy from your team discord/chat:

### File 1: `backend/.env`
Create a file named `.env` inside the `backend/` folder:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000

# Central MongoDB Atlas Database (Ask team leader for team URI)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/scholarsync?retryWrites=true&w=majority

# Groq LLM API Key (Ask team leader for team key)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Vercel Blob Storage Token
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here
```

### File 2: `frontend/.env.local`
Create a file named `.env.local` inside the `frontend/` folder:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000

# Clerk Authentication (Ask team leader for team Clerk keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Vapi (Voice AI)
NEXT_PUBLIC_ASSISTANT_ID=your_vapi_assistant_id
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key
```

---

## 📦 Step 4: Install Dependencies

ScholarSync is a decoupled architecture (`/backend` and `/frontend`). You must install dependencies in **both folders**:

```bash
# Option A: One command from root folder
npm run install:all

# OR Option B: Manual install in each directory
cd backend && npm install
cd ../frontend && npm install
```

---

## 🚀 Step 5: Run the Project (Open 2 Terminals)

Because the client and server run on different ports, you run them simultaneously in **two separate terminal tabs**:

### Terminal 1: Backend Server (Port 5000)
```bash
cd backend
npm run dev
```
✅ **Expected Output:**
```text
Server running on http://localhost:5000
Connected to MongoDB
Swagger UI available at http://localhost:5000/api-docs
```

### Terminal 2: Frontend Client (Port 3000)
```bash
cd frontend
npm run dev
```
✅ **Expected Output:**
```text
▲ Next.js 15.x
- Local: http://localhost:3000
✓ Ready in 2.8s
```

Now open your browser and go to:
👉 **`http://localhost:3000`**

---

## 🧪 Step 6: Verify It's Working (1-Minute Check)

1. Open **`http://localhost:5000/health`** in your browser. You should see `{"status":"ok"}`.
2. Open **`http://localhost:5000/api-docs`**. You should see the interactive Swagger UI.
3. Open **`http://localhost:3000`**. You should see the ScholarSync landing page and sign-in button.
4. **Seed Demo Data:**
   - If your book dashboard is empty, make a quick POST request in Postman to `http://localhost:5000/api/books/seed-demo` (or let John Vencie run Step 02 in Postman). Refresh the browser — you will see the **Introduction to Computer Science** textbook!

---

## ❓ Troubleshooting Common Errors

### 1. `Port 5000 or 3000 already in use`
- **Cause:** Another background node process didn't close properly.
- **Fix (Windows):** Open PowerShell as administrator and run:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
  ```
  Or simply restart your computer.

### 2. `Missing MONGODB_URI or GROQ_API_KEY`
- **Cause:** You forgot to create `backend/.env` or placed it in the root folder instead of `backend/`.
- **Fix:** Ensure the file is placed at `backend/.env`.

### 3. `Clerk Authentication Error`
- **Cause:** You forgot to create `frontend/.env.local`.
- **Fix:** Ensure `frontend/.env.local` contains `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.

