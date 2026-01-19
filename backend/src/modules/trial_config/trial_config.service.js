import TrialConfig from "./trial_config.model.js";

class TrialConfigService {
  create(data) {
    return TrialConfig.create(data);
  }

  getAll() {
    return TrialConfig.find().sort({ createdAt: -1 });
  }

  getById(id) {
    return TrialConfig.findById(id);
  }

  update(id, data) {
    return TrialConfig.findByIdAndUpdate(id, data, { new: true });
  }

  delete(id) {
    return TrialConfig.findByIdAndDelete(id);
  }
}

/**
 * Seeds default trial config if collection is empty
 * Runs ONLY on server startup
 */
export const seedTrialConfigIfEmpty = async () => {
  try {
    const count = await TrialConfig.countDocuments();

    if (count === 0) {
      await TrialConfig.create({
        enabled: true,
        trial_duration_days: 3,
        eligibility: "new_users",
        downgrade_behavior: "automatic",
        paywall_timing_days: 0,
        soft_downgrade_enabled: true,
      });

      console.log("✅ TrialConfig seeded");
    } else {
      console.log("ℹ️ TrialConfig already exists, skipping seed");
    }
  } catch (error) {
    console.error("❌ TrialConfig seed failed:", error);
    throw error;
  }
};


export default new TrialConfigService();
