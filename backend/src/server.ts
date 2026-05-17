// src/server.ts
// Entry point — sets up Express, connects to MongoDB, and registers all routes

import "dotenv/config"; // loads .env into process.env
import express from "express";
import cors from "cors";
import { connectDB } from "./lib/db.js";

// ─── Route imports ────────────────────────────────────────────────────────────
import patientsRouter from "./routes/patients.js";
import bookingsRouter from "./routes/bookings.js";
import postsRouter from "./routes/posts.js";
import checkoutsRouter from "./routes/checkouts.js";
import contactsRouter from "./routes/contacts.js";
import dashboardRouter from "./routes/dashboard.js";
import webhooksRouter from "./routes/webhooks.js";

const app = express();
const PORT = process.env.PORT ?? 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// Allow requests from the frontend (set FRONTEND_URL in .env)
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);

// Parse JSON bodies — the webhook route overrides this with express.raw()
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use("/api/patients", patientsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/checkouts", checkoutsRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/webhooks", webhooksRouter);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({ message: "Dental CRM API is running ✓" });
});

// ─── Start ────────────────────────────────────────────────────────────────────

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
