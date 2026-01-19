import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    reporter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    target_type: {
      type: String,
      enum: ["user", "chain", "challenge"],
      required: true,
      index: true,
    },

    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    reason: {
      type: String,
      required: true,
      maxlength: 200,
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "actioned"],
      default: "pending",
      index: true,
    },

    action_taken: {
      type: String,
      default: null, // ban, mute, delete, warning
    },

    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", ReportSchema);
