import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      enum: ["user", "model"],
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    imagePath: {
      type: String,
      default: undefined,
    },

  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

messageSchema.pre("validate", function () {
  if (!this.content && !this.imagePath) {
    throw new ApiError(400, "Either content or imagePath must be provided");
  }
});

const fullMessageSchema = new mongoose.Schema(
  {
    question: {
      type: messageSchema,
      required: true,
    },
    answer: {
      type: messageSchema,
      required: true,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
  },
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
      default: "New Chat",
      trim: true,
      // unique: true,
    },
    messages: {
      type: [fullMessageSchema],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr),
        message: "Messages must be an array.",
      },
    }
  },
  { timestamps: true },
);

export default mongoose.model("Chat", chatSchema);
