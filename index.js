import express from "express";
import cors from "cors";
import helmet from "helmet";

import { StatusCodes, getReasonPhrase } from "http-status-codes";
import {
  clerkMiddleware,
  clerkClient,
  getAuth,
} from "@clerk/express";

import chatRoutes from "./routes/chatRoutes.js";
import { errorHandler, errorConverter } from "./middlewares/error.js";
import ApiError from "./utils/ApiError.js";
// import { customRequireAuthToken } from "./middlewares/customRequireAuth.js";

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

app.get("/health", async (_req, res) => {
  const { userId } = getAuth(_req);

  if (!userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: "unauthorized" });
  }
  // Use Clerk's JS Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId);
  res.status(StatusCodes.OK).json({ status: "ok", user });
});

// Routes
app.use("/chat", chatRoutes);
app.use((req, res, next) => {
  console.log(req.originalUrl.toWellFormed());
  next(
    new ApiError(StatusCodes.NOT_FOUND, getReasonPhrase(StatusCodes.NOT_FOUND)),
  );
});

app.use(errorConverter);
app.use(errorHandler);

export default app;
