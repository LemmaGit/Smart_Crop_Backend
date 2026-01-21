require('dotenv').config();
const { StatusCodes } = require('http-status-codes');
const { connectDb } = require('./config/db');
const app = require('./index');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // await connectDb(
    //   "mongodb+srv://<username>:<password>@smartcrop.x1n8twl.mongodb.net/"
    //     .replace("<username>", process.env.MONGODB_USERNAME)
    //     .replace("<password>", process.env.MONGODB_PASSWORD)
    // );
    await connectDb(process.env.MONGODB_LOCAL_URI);

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT} 👍`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exitCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

start();
