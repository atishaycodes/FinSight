import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes        from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import budgetRoutes      from "./routes/budget.routes.js";
import analyticsRoutes   from "./routes/analytics.routes.js";
import categoryRoutes    from "./routes/category.routes.js";
import { errorHandler }  from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT ?? 4000;

// ── Middleware ──────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL ?? "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets",      budgetRoutes);
app.use("/api/analytics",    analyticsRoutes);
app.use("/api/categories",   categoryRoutes);

// ── 404 ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ─────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Finsight API  →  http://localhost:${PORT}`);
  console.log(`    ENV: ${process.env.NODE_ENV ?? "development"}\n`);
});

export default app;
