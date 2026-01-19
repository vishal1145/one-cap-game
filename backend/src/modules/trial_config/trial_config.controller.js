import trialConfigService from "./trial_config.service.js";


export const list = async (req, reply) => {
  const configs = await trialConfigService.getAll();
  reply.send(configs);
};

export const get = async (req, reply) => {
  const { id } = req.params;
  const config = await trialConfigService.getById(id);
  reply.send(config);
};

export const update = async (req, reply) => {
  try {
    const { id } = req.params;

    if (!id) {
      return reply.status(400).send({
        success: false,
        message: "ID is required",
      });
    }

    const config = await trialConfigService.update(id, req.body);

    return reply.send({
      success: true,
      data: config,
      message: "Trial config updated successfully",
    });
  } catch (error) {
    console.error("❌ Trial config update error:", error);

    return reply.status(500).send({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
