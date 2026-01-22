import express from "express";
import cors from "cors";
import helmet from "helmet";
// const xss = require("xss-clean");
// const mongoSanitize = require("express-mongo-sanitize");
import { z } from "zod";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { requireAuth } from "@clerk/express";

import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
// app.use(xss());
// app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true }));

app.get("/health", requireAuth(), (_req, res) =>
  res.status(StatusCodes.OK).json({ status: "ok", user: _req.auth }),
);
// app.get("/health", (_req, res) =>
//   res.status(StatusCodes.OK).json({ status: "ok" }),
// );

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

export default app;
