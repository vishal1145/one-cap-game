import mongoose from "mongoose";
import {
  CHAIN_VISIBILITY,
  CHAIN_STATUS,
} from "../../constants/enums.js";

const ChainSchema = new mongoose.Schema(
  {
    // 🔗 Identity
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    starter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🌍 Visibility & lifecycle
    visibility: {
      type: String,
      enum: Object.values(CHAIN_VISIBILITY),
      default: CHAIN_VISIBILITY.PRIVATE,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(CHAIN_STATUS),
      default: CHAIN_STATUS.ACTIVE,
      index: true,
    },

    // ⏳ Expiry (story chains)
    expires_at: {
      type: Date,
      default: null,
      index: true,
    },

    // 📊 Counters (VERY IMPORTANT)
    total_challenges: {
      type: Number,
      default: 0,
    },

    total_participants: {
      type: Number,
      default: 0,
    },

    // 🔥 Viral metrics (admin / analytics)
    growth_velocity: {
      type: Number,
      default: 0,
    },

    // 🛡️ Moderation
    is_muted: {
      type: Boolean,
      default: false,
      index: true,
    },

    muted_reason: {
      type: String,
      default: null,
    },

    muted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ChainSchema.index({ title: 1 });
ChainSchema.index({ starter_id: 1 });
ChainSchema.index({ visibility: 1 });
ChainSchema.index({ createdAt: -1 });

export default mongoose.model("Chain", ChainSchema);
