# 🎙️ ScholarSync Vapi Voice Assistant Setup & Backup

This folder contains the complete, reusable configuration for the ScholarSync AI Voice Assistant so you can recreate or deploy the assistant on any fresh Vapi account in seconds.

---

## 📁 Files in this directory

1. **`assistant_config.json`**: The complete assistant JSON payload including:
   - OpenAI `gpt-4o` model configuration
   - System prompt with academic tutor personality
   - `searchBook` tool definition with schema parameters (`query`, `bookId`)
   - 11Labs voice parameters (`Rachel` / `21m00Tcm4TlvDq8ikWAM`)
   - Server webhook URL pointing to `http://localhost:5000/api/vapi/search-book`
   - Silence timeout and duration limits

2. **`setup_vapi_assistant.js`**: Automated Node.js script to create the assistant on any new Vapi account via their REST API.

---

## ⚡ How to Set Up a New Vapi Account in Seconds

### Method 1: Automated Script (Recommended)
1. Sign up for a new account at [https://vapi.ai](https://vapi.ai) ($10 in free credits).
2. Go to **API Keys** on your Vapi Dashboard ([https://dashboard.vapi.ai/api-keys](https://dashboard.vapi.ai/api-keys)).
3. In your project root terminal, run:
   ```bash
   npm run setup:vapi
   ```
   *(It will prompt you to paste your Private Key and Public Key, create the assistant with all tools, and automatically update `.env` and `frontend/.env.local`!)*
4. Restart your frontend server (`npm run dev:frontend` or `npm run dev`) and you're good to go!

---

### Method 2: Manual Update
If you already created an assistant in your new Vapi account dashboard:
1. Copy your **Public Key** and **Assistant ID**.
2. Open both `.env` and `frontend/.env.local`.
3. Update these two lines:
   ```env
   NEXT_PUBLIC_VAPI_API_KEY=<your_new_public_key>
   NEXT_PUBLIC_ASSISTANT_ID=<your_new_assistant_id>
   ```
4. Restart your frontend server.
