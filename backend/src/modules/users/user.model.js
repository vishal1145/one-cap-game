import mongoose from "mongoose";
import { USER_ROLES, USER_STATUS, SUBSCRIPTION_PLAN } from "../../constants/enums.js";

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true, index: true, lowercase: true, trim: true },
  email: { type: String, unique: true, sparse: true, index: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true, index: true },
  avatar_url: { type: String, default: `${process.env.BASE_URL}/public/avatars/default-avatar.png` },

  auth_provider: {
    type: String,
    enum: ["phone", "google", "apple"],
    required: true,
    index: true,
  },

  auth_provider_id: {
    type: String,
    default: null, // googleId / appleId
    index: true,
  },

  role: { type: String, enum: Object.values(USER_ROLES), default: USER_ROLES.USER },
  status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE },

  chains: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chain" }],
  challenges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Challenge" }],
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
  password_hash: { type: String, default: null },
  last_login_at: Date,
  is_reported: {
    type: Boolean,
    default: false,
    index: true,
  },

  reported_count: {
    type: Number,
    default: 0,
  },

  subscription_type: {
    type: String,
    enum: Object.values(SUBSCRIPTION_PLAN),
    default: SUBSCRIPTION_PLAN.FREE
  },

  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    default: null,
    index: true,
  },

  trial_started_at: Date,
  trial_expires_at: Date,

  has_taken_trial_before: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

UserSchema.index({ is_reported: 1 });

export default mongoose.model("User", UserSchema);
