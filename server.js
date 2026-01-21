const dotenv = require('dotenv');
const { StatusCodes } = require('http-status-codes');
const app = require('./index');
const { connectDb } = require('./config/db');

dotenv.config();

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDb(process.env.MONGODB_URI);
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API ready on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error.message);
    process.exitCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

start();
