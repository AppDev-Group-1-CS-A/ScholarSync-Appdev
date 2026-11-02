/**
 * ScholarSync Vapi Automated Assistant Setup Script
 * 
 * Usage:
 *   node docs/vapi/setup_vapi_assistant.js [<YOUR_VAPI_PRIVATE_KEY>] [<YOUR_VAPI_PUBLIC_KEY>]
 *   OR simply run:
 *   npm run setup:vapi
 * 
 * What this does:
 * 1. Reads docs/vapi/assistant_config.json
 * 2. Creates the ScholarSync AI Tutor assistant on your new Vapi account via API
 * 3. Retrieves or asks for your Public API Key
 * 4. Automatically updates frontend/.env.local and .env with the new keys!
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function updateEnvFile(filePath, updates) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, "utf-8");
  for (const [key, value] of Object.entries(updates)) {
    if (!value) continue;
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content = content.trimEnd() + `\n${key}=${value}\n`;
    }
  }
  fs.writeFileSync(filePath, content, "utf-8");
  return true;
}

const configPath = path.join(__dirname, "assistant_config.json");
if (!fs.existsSync(configPath)) {
  console.error("❌ assistant_config.json not found at:", configPath);
  process.exit(1);
}

const assistantConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

async function setup() {
  console.log("========================================================");
  console.log("🎙️  ScholarSync Vapi Account Switcher / Auto-Setup");
  console.log("========================================================\n");

  let privateKey = process.argv[2] || process.env.VAPI_PRIVATE_KEY;
  let publicKey = process.argv[3] || process.env.VAPI_PUBLIC_KEY || null;

  if (!privateKey) {
    console.log("💡 Tip: You can find your keys at https://dashboard.vapi.ai/api-keys\n");
    privateKey = await ask("👉 Enter your Vapi Private Key: ");
  }

  if (!privateKey) {
    console.error("\n❌ Missing Vapi Private API Key. Setup aborted.");
    console.log("\nUsage:");
    console.log("  node docs/vapi/setup_vapi_assistant.js <PRIVATE_KEY> [PUBLIC_KEY]\n");
    process.exit(1);
  }

  console.log("\n🚀 Creating ScholarSync AI Tutor assistant on Vapi...");

  // 1. Create Assistant
  const res = await fetch("https://api.vapi.ai/assistant", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${privateKey.trim()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(assistantConfig)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`\n❌ Failed to create assistant (HTTP ${res.status}):`, errText);
    console.error("Please verify that your Private Key is valid and has not expired.");
    process.exit(1);
  }

  const assistant = await res.json();
  const assistantId = assistant.id;
  console.log(`✅ Assistant created successfully!`);
  console.log(`   Assistant Name: ${assistant.name}`);
  console.log(`   Assistant ID:   ${assistantId}`);

  // 2. Query Public API Key if not already supplied
  if (!publicKey) {
    try {
      const keysRes = await fetch("https://api.vapi.ai/api-key", {
        headers: {
          "Authorization": `Bearer ${privateKey.trim()}`
        }
      });
      if (keysRes.ok) {
        const keys = await keysRes.json();
        if (Array.isArray(keys) && keys.length > 0) {
          const foundPublic = keys.find(k => k.type === "public" || k.isPublic);
          publicKey = foundPublic?.key || keys.find(k => k.type !== "private")?.key || null;
        }
      }
    } catch (err) {
      // ignore
    }
  }

  // If still not found, ask user directly
  if (!publicKey) {
    publicKey = await ask("\n👉 Enter your Vapi Public Key (from https://dashboard.vapi.ai/api-keys): ");
  }

  // 3. Update env files
  const updates = {
    NEXT_PUBLIC_ASSISTANT_ID: assistantId,
    NEXT_PUBLIC_VAPI_API_KEY: publicKey || undefined,
  };

  const envLocalPath = path.join(__dirname, "../../frontend/.env.local");
  const rootEnvPath = path.join(__dirname, "../../.env");

  const updatedLocal = updateEnvFile(envLocalPath, updates);
  const updatedRoot = updateEnvFile(rootEnvPath, updates);

  console.log("\n========================================================");
  console.log("🎉 Setup Complete!");
  console.log("========================================================");
  console.log(`Assistant ID:   ${assistantId}`);
  if (publicKey) {
    console.log(`Public API Key: ${publicKey}`);
  }
  if (updatedLocal) console.log("✅ Updated frontend/.env.local");
  if (updatedRoot)  console.log("✅ Updated root .env");

  console.log("\n👉 Next steps:");
  console.log("1. Restart your frontend server (`npm run dev:frontend` or `npm run dev`)");
  console.log("2. Open any book and start Voice Mode to test your new free credits!");
}

setup().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
