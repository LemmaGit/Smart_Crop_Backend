const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    contentType: {
      type: String,
      enum: ['text', 'image'],
      default: 'text',
    },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr),
        message: 'Messages must be an array.',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
