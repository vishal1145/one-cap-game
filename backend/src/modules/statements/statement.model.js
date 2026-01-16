import mongoose from "mongoose";
import {
    STATEMENT_TYPE,
    STATEMENT_DIFFICULTY,
    STATEMENT_STATUS,
} from "../../constants/enums.js";

const StatementSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(STATEMENT_TYPE),
      required: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: Object.values(STATEMENT_DIFFICULTY),
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(STATEMENT_STATUS),
      default: STATEMENT_STATUS.LIVE,
      index: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    correct_guesses: {
      type: Number,
      default: 0,
    },

    wrong_guesses: {
      type: Number,
      default: 0,
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

StatementSchema.index({ category: 1, difficulty: 1, status: 1 });
StatementSchema.index({ type: 1 });

export default mongoose.model("Statement", StatementSchema);
