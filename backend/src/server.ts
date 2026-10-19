import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/db";
import apiRoutes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup allowing frontend Next.js client
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev mode
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ScholarSync Backend REST API",
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use("/api", apiRoutes);

// Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Internal Server Error",
    });
  }
);

// Connect DB and start HTTP server
const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
    } else {
      console.warn("MONGODB_URI not defined yet in backend .env");
    }

    app.listen(PORT, () => {
      console.log(`===========================================`);
      console.log(`🚀 ScholarSync Backend Server is Running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🩺 Health: http://localhost:${PORT}/health`);
      console.log(`📚 API Root: http://localhost:${PORT}/api`);
      console.log(`===========================================`);
    });
  } catch (error) {
    console.error("Failed to start backend server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
