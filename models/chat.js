import mongoose from "mongoose";

// here the message should have a question and answer properties so when
// a chat is bookMarked then we respond with both
// or when the messages are fetched, in the frontend or here in the back format
// it as question and answer
const messageSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      enum: ["user", "bot"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    imagePath: {
      type: String,
      default: undefined,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const fullMessageSchema = new mongoose.Schema({
  message: {
    type: {
      question: {
        type: messageSchema,
        required: true
      },
      answer: {
        type: messageSchema,
        required: true
      }
    }
  }
})
const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: "New Chat",
      trim: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr),
        message: "Messages must be an array.",
      },
    },
    /*
    
    
    
    */
  },
  { timestamps: true },
);

export default mongoose.model("Chat", chatSchema);
