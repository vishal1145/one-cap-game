import mongoose from "mongoose";
import {
    NOTIFICATION_TYPE,
    NOTIFICATION_CATEGORY,
} from "../../constants/enums.js";

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
      default: NOTIFICATION_TYPE.INFO,
      index: true,
    },

    category: {
      type: String,
      enum: Object.values(NOTIFICATION_CATEGORY),
      required: true,
      default: NOTIFICATION_CATEGORY.SYSTEM,
      index: true,
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    read_at: {
      type: Date,
      default: null,
    },

    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Optional metadata for linking to related entities
    related_entity_type: {
      type: String,
      enum: ["user", "statement", "chain", "challenge", null],
      default: null,
    },

    related_entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipient_id: 1, read: 1 });
NotificationSchema.index({ category: 1, type: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);
