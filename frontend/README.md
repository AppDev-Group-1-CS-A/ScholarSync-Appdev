# ScholarSync Frontend Client

Next.js 16 (React 19) pure client-side web application for **ScholarSync**, consuming the backend REST API.

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (React 19, TypeScript)
- **Styling:** Tailwind CSS & Lucide Icons
- **Auth:** Clerk SDK
- **Voice AI:** Vapi Web SDK
- **PDF Processing:** `pdfjs-dist`
- **Markdown & Citations:** `react-markdown` & `remark-gfm`

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Ensure `NEXT_PUBLIC_BACKEND_URL` is set to `http://localhost:5000` (or your deployed backend URL).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.
