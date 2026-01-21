const express = require("express");
const cors = require("cors");
const { z } = require("zod");
const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const { ClerkExpressWithAuth, clerkMiddleware } = require("@clerk/express");

const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(clerkMiddleware());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(ClerkExpressWithAuth());

// Health
app.get("/health", (_req, res) =>
  res.status(StatusCodes.OK).json({ status: "ok" }),
);

// Routes
app.use("/chat", chatRoutes);
app.use("/users", userRoutes);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof z.ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Validation failed",
      errors: err.issues,
    });
  }

  const status =
    err.status || err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  return res.status(status).json({
    message: err.message || getReasonPhrase(status),
  });
});

module.exports = app;
