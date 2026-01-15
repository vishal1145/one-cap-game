import * as ChainService from "./chain.service.js";

export const createChain = async (req, reply) => {
  try {
    const userId = req.user.userId;
    const chain = await ChainService.createChain(userId, req.body);

    return reply.send({
      success: true,
      chain,
      message: "Chain created successfully",
    });
  } catch (err) {
    return reply.code(400).send({ success: false, message: err.message });
  }
};

export const getAllChains = async (req, reply) => {
  try {
    const chains = await ChainService.getChains({
      user: req.user,
      filters: req.query,
    });

    return reply.send({ success: true, chains, message: "Chains fetched successfully" });
  } catch (err) {
    return reply.code(400).send({ success: false, message: err.message });
  }
};

export const getMyChains = async (req, reply) => {
  try {
    const chains = await ChainService.getChains({
      user: req.user,
      filters: req.query,
    });

    return reply.send({ success: true, chains, message: "My chains fetched successfully" });
  } catch (err) {
    return reply.code(400).send({ success: false, message: err.message });
  }
};

export const getChainById = async (req, reply) => {
  try {
    const chain = await ChainService.getChainById({
      chainId: req.params.id,
      user: req.user,
    });

    return reply.send({ success: true, chain, message: "Chain fetched successfully" });
  } catch (err) {
    return reply.code(403).send({ success: false, message: err.message });
  }
};