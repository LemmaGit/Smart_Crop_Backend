const mongoose = require('mongoose');

// Here remove the field contentType since the content is going to be 
// the text that is going to be send by the user and also add a field called
// imagePath to hold the url of the image uploaded, and the message should have
// either a content ie the user text or the image or both to proceed
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

    imagePath: {
      type: String,
      default: undefined
    },

    // contentType: {
    //   type: String,
    //   enum: ['text', 'image'],
    //   default: 'text',
    // },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: 'New Chat',
      trim: true,
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
