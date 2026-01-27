import express from "express";
import cors from "cors";
import helmet from "helmet";

import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { clerkMiddleware } from "@clerk/express";

import chatRoutes from "./routes/chatRoutes.js";
import { errorHandler, errorConverter } from "./middlewares/error.js";
import ApiError from "./utils/ApiError.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(clerkMiddleware());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/chat", chatRoutes);
app.use((req, res, next) => {
  next(
    new ApiError(StatusCodes.NOT_FOUND, getReasonPhrase(StatusCodes.NOT_FOUND)),
  );
});

app.use(errorConverter);
app.use(errorHandler);

export default app;
