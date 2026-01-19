import Challenge from "./challenge.model.js";
import Chain from "../chains/chain.model.js";
import User from "../users/user.model.js";
import ChallengeGuess from "./challenge-guess.model.js";
import { notifyChallengeCreated } from "../../utils/notifications.js";
import { CHALLENGE_VISIBILITY, CHAIN_VISIBILITY, CHALLENGE_STATUS } from "../../constants/enums.js";

export const createChallenge = async (userId, payload) => {
  let chainId = null;

  if (payload.parent_challenge_id) {
    const parentChallenge = await Challenge.findById(
      payload.parent_challenge_id
    );

    if (!parentChallenge) {
      throw new Error("Parent challenge not found");
    }

    // Agar parent ke paas chain already hai
    if (parentChallenge.chain_id) {
      chainId = parentChallenge.chain_id;
    }
  }
  // Create challenge
  const challenge = await Challenge.create({
    ...payload,
    creator_id: userId,
    chain_id: chainId,
  });

  // Get user info for notification
  const user = await User.findById(userId).select("username").lean();

  // Create notification for new challenge
  await notifyChallengeCreated(
    challenge._id.toString(),
    chainId?.toString() || null,
    userId.toString(),
    user?.username || "User"
  );

  return challenge;
};

export const getChallenges = async ({ user, filters }) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    visibility,
    chain_id,
    creator_id,
  } = filters;

  const query = {};

  // Apply filters
  if (status) {
    query.status = status;
  }

  if (visibility) {
    query.visibility = visibility;
  }

  if (chain_id) {
    query.chain_id = chain_id;
  }

  if (creator_id) {
    query.creator_id = creator_id;
  }

  // Build search conditions
  const searchConditions = [];
  if (search) {
    searchConditions.push(
      { theme: { $regex: search, $options: "i" } },
      { "statements.text": { $regex: search, $options: "i" } }
    );
  }

  // Build access control for non-admin users
  const accessConditions = [];
  if (user.role !== "admin") {
    accessConditions.push(
      { creator_id: user.userId },
      { visibility: { $ne: "direct" } }
    );
  }

  // Combine all conditions
  const allConditions = [];
  if (Object.keys(query).length > 0) {
    allConditions.push(query);
  }
  if (accessConditions.length > 0) {
    allConditions.push({ $or: accessConditions });
  }
  if (searchConditions.length > 0) {
    allConditions.push({ $or: searchConditions });
  }

  const finalQuery = allConditions.length > 1 ? { $and: allConditions } : allConditions[0] || {};

  const skip = (page - 1) * limit;

  const [challenges, total] = await Promise.all([
    Challenge.find(finalQuery)
      .populate("chain_id", "title visibility")
      .populate("creator_id", "username email")
      .populate("parent_challenge_id", "statements")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),

    Challenge.countDocuments(finalQuery),
  ]);

  return {
    challenges,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getChallengeById = async ({ challengeId, user }) => {
  const challenge = await Challenge.findById(challengeId)
    .populate("chain_id", "title visibility")
    .populate("creator_id", "username email")
    .populate("parent_challenge_id", "statements")
    .lean();

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  // Access control: users can only see their own challenges or non-direct visibility
  if (user.role !== "admin") {
    const creatorId = challenge.creator_id?._id?.toString() || challenge.creator_id?.toString();
    if (creatorId !== user.userId && challenge.visibility === "direct") {
      throw new Error("Unauthorized access");
    }
  }

  return challenge;
};

export const shareChallenge = async (userId, challengeId, payload) => {
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) throw new Error("Challenge not found");

  if (challenge.creator_id.toString() !== userId) {
    throw new Error("Not allowed to share this challenge");
  }

  if (challenge.status !== CHALLENGE_STATUS.ACTIVE) {
    challenge.visibility =
      payload.share_context === CHALLENGE_VISIBILITY.STORY
        ? CHALLENGE_VISIBILITY.STORY
        : CHALLENGE_VISIBILITY.DIRECT;

    challenge.status = CHALLENGE_STATUS.ACTIVE;
  }

  if (!challenge.chain_id) {
    let chainVisibility = CHAIN_VISIBILITY.PRIVATE;

    if (payload.share_context === CHALLENGE_VISIBILITY.STORY) {
      chainVisibility = CHAIN_VISIBILITY.PUBLIC;
    } else if (payload.share_context === CHALLENGE_VISIBILITY.DIRECT) {
      chainVisibility = CHAIN_VISIBILITY.PRIVATE;
    }

    const chain = await Chain.create({
      title: "Cap Chain",
      starter_id: userId,
      visibility: chainVisibility,
      // total_challenges: 1,
      // total_participants: 1,
    });

    challenge.chain_id = chain._id;
  }

  const existingChallenge = await Challenge.findOne({
    chain_id: challenge.chain_id,
    creator_id: userId,
  });

  const isNewParticipant = !existingChallenge;

  const updateData = {
    $inc: {
      total_challenges: 1,
    },
  };

  if (isNewParticipant) {
    updateData.$inc.total_participants = 1;
  }

  await Chain.findByIdAndUpdate(challenge.chain_id, updateData);

  await challenge.save();
  return challenge;
};

export const submitGuessChallenge = async ({ challengeId, userId, selectedIndex }) => {
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) throw new Error("Challenge not found");

  const correctIndex = challenge.statements.findIndex((s) => s.is_cap);
  const isCorrect = selectedIndex === correctIndex;

  const guess = await ChallengeGuess.create({
    challenge_id: challengeId,
    user_id: userId,
    selected_index: selectedIndex,
    is_correct: isCorrect,
    points_earned: isCorrect ? 10 : 0,
  });

  return guess;
};