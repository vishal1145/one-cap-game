import mongoose from "mongoose";

const TrialConfigSchema = new mongoose.Schema(
  {
    pro_trial_enabled: {
      type: Boolean,
      default: false, // ON / OFF
      index: true,
    },

    trial_duration_days: {
      type: Number,
      enum: [3, 5, 7, 14],
      default: 7,
    },

    paywall_after_days: {
      type: Number,
      default: 0, // 0 = immediate
      min: 0,
    },

    trial_eligibility: {
      type: String,
      enum: ["new_users", "returning", "campaign", "all"],
      default: "new_users",
      index: true,
    },

    downgrade_behavior: {
      type: String,
      enum: ["automatic", "soft_prompt", "hard_block"],
      default: "soft_prompt",
    },
  },
  {
    timestamps: true,
    collection: "trial_configs",
  }
);

export default mongoose.model("TrialConfig", TrialConfigSchema);
