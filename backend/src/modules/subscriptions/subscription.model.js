import mongoose from "mongoose";
import { SUBSCRIPTION_PLAN_TYPE, SUBSCRIPTION_STATUS, PAYMENT_PROVIDER } from "../../constants/enums.js";

const SubscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PLAN_TYPE),
      required: true,
      index: true,
    },
    started_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expires_at: {
      type: Date,
      required: true,
      index: true,
    },
    payment_provider: {
      type: String,
      enum: Object.values(PAYMENT_PROVIDER),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE,
      index: true,
    },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ user_id: 1, status: 1 });
SubscriptionSchema.index({ expires_at: 1 });

export default mongoose.model("Subscription", SubscriptionSchema);
