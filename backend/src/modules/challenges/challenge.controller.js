import * as ChallengeService from "./challenge.service.js";

export const createChallenge = async (req, reply) => {
  try {
    const userId = req.user.userId;
    const payload  = req.body;

    // if (!chain_id) {
    //   return reply.code(400).send({
    //     success: false,
    //     message: "chain_id is required",
    //   });
    // }

    const challenge = await ChallengeService.createChallenge(
      userId,
      // chain_id,
      payload
    );

    return reply.send({
      success: true,
      challenge,
      message: "Challenge created successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const getAllChallenges = async (req, reply) => {
  try {
    const challenges = await ChallengeService.getChallenges({
      user: req.user,
      filters: req.query,
    });

    return reply.send({
      success: true,
      ...challenges,
      message: "Challenges fetched successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const getMyChallenges = async (req, reply) => {
  try {
    const challenges = await ChallengeService.getChallenges({
      user: req.user,
      filters: { ...req.query, creator_id: req.user.userId },
    });

    return reply.send({
      success: true,
      ...challenges,
      message: "My challenges fetched successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const getChallengeById = async (req, reply) => {
  try {
    const challenge = await ChallengeService.getChallengeById({
      challengeId: req.params.id,
      user: req.user,
    });

    return reply.send({
      success: true,
      challenge,
      message: "Challenge fetched successfully",
    });
  } catch (err) {
    return reply.code(403).send({
      success: false,
      message: err.message,
    });
  }
};

export const shareChallenge = async (req, reply) => {
  try {
    const challenge = await ChallengeService.shareChallenge(
      req.user.userId,
      req.params.id,
      req.body
    );

    return reply.send({
      success: true,
      challenge,
      message: "Challenge shared successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};
