const mongoose = require('mongoose');

const connectDb = async (uri) => {
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }
  await mongoose.connect(uri);
};

module.exports = { connectDb };
