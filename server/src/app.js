import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./config/database.js";
import initializeDatabase from "./config/init.js";

// Import routes
import bidsRouter from "./routes/bids.js";
import contractsRouter from "./routes/contracts.js";
import settlementsRouter from "./routes/settlements.js";
import pricesRouter from "./routes/prices.js";

// Import jobs
import bidProcessingJob from "./jobs/bidProcessingJob.js";
import settlementJob from "./jobs/settlementJob.js";
import clearingPriceJob from "./jobs/clearingPriceJob.js";

// Import services
import gridStatusService from "./services/gridStatusService.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Frontend URL
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/bids", bidsRouter);
app.use("/api/contracts", contractsRouter);
app.use("/api/settlements", settlementsRouter);
app.use("/api/prices", pricesRouter);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    await pool.query("SELECT NOW()");

    // Test GridStatus API connection
    const gridStatusOk = await gridStatusService.testConnection();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      gridStatus: gridStatusOk ? "connected" : "error",
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Manual clearing price trigger (for testing)
app.post("/api/admin/run-settlement", async (req, res) => {
  try {
    const result = await clearingPriceJob.runOnce();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual bid process trigger (for testing)
app.post("/api/admin/run-bid-processing", async (req, res) => {
  try {
    const result = await bidProcessingJob.runOnce();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual settlement trigger (for testing)
app.post("/api/admin/run-settlement", async (req, res) => {
  try {
    const result = await settlementJob.runOnce();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  res.status(error.status || 500).json({
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  try {
    // Initialize database
    console.log("Initializing database...");
    await initializeDatabase();

    // Test GridStatus connection
    console.log("Testing GridStatus API connection...");
    const gridStatusOk = await gridStatusService.testConnection();
    if (!gridStatusOk && process.env.NODE_ENV !== "development") {
      throw new Error("GridStatus API connection failed");
    }

    // Start all background jobs
    console.log("Starting background jobs...");

    // Import and start all job schedulers

    // Start each job's cron scheduler
    settlementJob.start(); // Every 5 minutes - process settlements
    bidProcessingJob.start(); // Every 15 minutes - clear pending bids
    clearingPriceJob.start(); // Daily at 9 AM - fetch clearing prices

    console.log("All background jobs started successfully");

    // Start server
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`Energy Trading API server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("Settlement job: Every 5 minutes");
      console.log("Bid clearing job: Every 15 minutes");
      console.log("Clearing price job: Daily at 2 PM PST");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
