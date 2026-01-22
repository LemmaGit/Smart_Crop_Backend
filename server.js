import "dotenv/config";
import { StatusCodes } from "http-status-codes";
import { connectDb } from "./config/db.js";
import app from "./index.js";

const PORT = process.env.PORT || 3000;
let server;

const start = async () => {
  try {
    // await connectDb(
    //   "mongodb+srv://<username>:<password>@smartcrop.x1n8twl.mongodb.net/"
    //     .replace("<username>", process.env.MONGODB_USERNAME)
    //     .replace("<password>", process.env.MONGODB_PASSWORD)
    // );
    await connectDb(process.env.MONGODB_LOCAL_URI);

    server = app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT} 👍`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exitCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

start();

const exitHandler = () => {
  if (server)
    server.close(() => {
      console.log("Server Closed");
      process.exit(1);
    });
  else process.exit(1);
};

const unExpectedErrorHandler = (error) => {
  console.log(error);
  exitHandler();
};

process.on("uncaughtException", unExpectedErrorHandler);
process.on("unhandledRejection", unExpectedErrorHandler);
