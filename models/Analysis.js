import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Analysis", analysisSchema);
