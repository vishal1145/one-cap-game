import Game from "./game.model.js";
import GamePlayer from "./game-player.model.js";
import GameChallenge from "./game-challenge.model.js";
import GameGuess from "./game-guess.model.js";
import Challenge from "../challenges/challenge.model.js";
import { GAME_STATUS } from "../../constants/enums.js";

// ========================================
// ADMIN SERVICES
// ========================================

/**
 * Create a new game (Admin only)
 */
export const createGame = async ({ adminId, payload }) => {
  const { title, max_players = 20 } = payload;

  // Generate unique join code
  const join_code = await Game.generateJoinCode();

  const game = await Game.create({
    title,
    max_players,
    join_code,
    created_by: adminId,
    status: GAME_STATUS.DRAFT,
  });

  return game;
};

/**
 * Add challenge to game (Admin only)
 */
export const addChallengeToGame = async ({ gameId, challengeId }) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  if (game.status !== GAME_STATUS.DRAFT) {
    throw new Error("Can only add challenges to draft games");
  }

  // Check if challenge exists
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    throw new Error("Challenge not found");
  }

  // Get current order (max order + 1)
  const maxOrder = await GameChallenge.findOne({ game_id: gameId })
    .sort({ order: -1 })
    .select("order")
    .lean();

  const order = maxOrder ? maxOrder.order + 1 : 1;

  // Add challenge to game
  const gameChallenge = await GameChallenge.create({
    game_id: gameId,
    challenge_id: challengeId,
    order,
  });

  return gameChallenge.populate("challenge_id");
};

/**
 * Add multiple challenges to game (Admin only)
 */
export const addMultipleChallengesToGame = async ({ gameId, challengeIds }) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  if (game.status !== GAME_STATUS.DRAFT) {
    throw new Error("Can only add challenges to draft games");
  }

  // Validate all challenges exist
  const challenges = await Challenge.find({ _id: { $in: challengeIds } });
  if (challenges.length !== challengeIds.length) {
    throw new Error("One or more challenges not found");
  }

  // Get current max order
  const maxOrder = await GameChallenge.findOne({ game_id: gameId })
    .sort({ order: -1 })
    .select("order")
    .lean();

  let startOrder = maxOrder ? maxOrder.order + 1 : 1;

  // Create game challenges for all selected challenges
  const gameChallenges = [];
  for (const challengeId of challengeIds) {
    // Check if challenge already added
    const existing = await GameChallenge.findOne({ game_id: gameId, challenge_id: challengeId });
    if (!existing) {
      const gameChallenge = await GameChallenge.create({
        game_id: gameId,
        challenge_id: challengeId,
        order: startOrder++,
      });
      gameChallenges.push(gameChallenge);
    }
  }

  // Populate challenge details
  const populatedChallenges = await GameChallenge.find({
    _id: { $in: gameChallenges.map((gc) => gc._id) },
  }).populate("challenge_id");

  return populatedChallenges;
};

/**
 * Start game (Admin only)
 */
export const startGame = async ({ gameId }) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  if (game.status !== GAME_STATUS.DRAFT) {
    throw new Error("Game already started or ended");
  }

  // Check if game has challenges
  const challengeCount = await GameChallenge.countDocuments({ game_id: gameId });
  if (challengeCount === 0) {
    throw new Error("Cannot start game without challenges");
  }

  // Update game status
  game.status = GAME_STATUS.LIVE;
  game.started_at = new Date();
  await game.save();

  return game;
};

/**
 * End game (Admin only)
 */
export const endGame = async ({ gameId }) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  if (game.status !== GAME_STATUS.LIVE) {
    throw new Error("Game is not live");
  }

  // Update game status
  game.status = GAME_STATUS.ENDED;
  game.ended_at = new Date();
  game.is_challenge_active = false;
  await game.save();

  return game;
};

/**
 * Get all games (Admin only)
 */
export const getGames = async ({ filters }) => {
  const { page = 1, limit = 20, status, search } = filters;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { join_code: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [games, total] = await Promise.all([
    Game.find(query)
      .populate("created_by", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Game.countDocuments(query),
  ]);

  // Add player count to each game
  const gamesWithStats = await Promise.all(
    games.map(async (game) => {
      const playerCount = await GamePlayer.countDocuments({ game_id: game._id });
      const challengeCount = await GameChallenge.countDocuments({ game_id: game._id });
      return {
        ...game,
        player_count: playerCount,
        challenge_count: challengeCount,
      };
    })
  );

  return {
    games: gamesWithStats,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get game players (Admin only)
 */
export const getGamePlayers = async ({ gameId }) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  const players = await GamePlayer.find({ game_id: gameId })
    .populate("user_id", "username email avatar")
    .sort({ score: -1, joined_at: 1 })
    .lean();

  return players;
};

/**
 * Get game challenges (Admin only)
 */
export const getGameChallenges = async ({ gameId }) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  const challenges = await GameChallenge.find({ game_id: gameId })
    .populate("challenge_id")
    .sort({ order: 1 })
    .lean();

  return challenges;
};

// ========================================
// USER SERVICES
// ========================================

/**
 * Join game via join code
 */
export const joinGame = async ({ userId, joinCode }) => {
  const game = await Game.findOne({ join_code: joinCode.toUpperCase() });
  if (!game) {
    throw new Error("Invalid join code");
  }

  if (game.status !== GAME_STATUS.LIVE) {
    throw new Error("Game is not live");
  }

  // Check if max players reached
  const playerCount = await GamePlayer.countDocuments({ game_id: game._id });
  if (playerCount >= game.max_players) {
    throw new Error("Game is full");
  }

  // Check if user already joined
  const existingPlayer = await GamePlayer.findOne({
    game_id: game._id,
    user_id: userId,
  });

  if (existingPlayer) {
    throw new Error("You have already joined this game");
  }

  // Add player to game
  const gamePlayer = await GamePlayer.create({
    game_id: game._id,
    user_id: userId,
  });

  return gamePlayer.populate("user_id", "username avatar");
};

/**
 * Get game state
 */
export const getGameState = async ({ userId, gameId }) => {
  const game = await Game.findById(gameId)
    .populate("created_by", "username")
    .lean();

  if (!game) {
    throw new Error("Game not found");
  }

  // Check if user is a player
  const isPlayer = await GamePlayer.findOne({
    game_id: gameId,
    user_id: userId,
  });

  if (!isPlayer && game.created_by._id.toString() !== userId) {
    throw new Error("You are not part of this game");
  }

  // Get all players with scores
  const players = await GamePlayer.find({ game_id: gameId })
    .populate("user_id", "username avatar")
    .sort({ score: -1, joined_at: 1 })
    .lean();

  // Get current challenge if game is live
  let currentChallenge = null;
  if (game.status === GAME_STATUS.LIVE && game.is_challenge_active) {
    const gameChallenge = await GameChallenge.findOne({
      game_id: gameId,
      order: game.current_challenge_index + 1,
    })
      .populate("challenge_id")
      .lean();

    if (gameChallenge) {
      currentChallenge = gameChallenge.challenge_id;
    }
  }

  // Get total challenges
  const totalChallenges = await GameChallenge.countDocuments({ game_id: gameId });

  return {
    game,
    players,
    current_challenge: currentChallenge,
    total_challenges: totalChallenges,
  };
};

/**
 * Get game by ID
 */
export const getGameById = async ({ gameId }) => {
  const game = await Game.findById(gameId)
    .populate("created_by", "username email")
    .lean();

  if (!game) {
    throw new Error("Game not found");
  }

  const playerCount = await GamePlayer.countDocuments({ game_id: gameId });
  const challengeCount = await GameChallenge.countDocuments({ game_id: gameId });

  return {
    ...game,
    player_count: playerCount,
    challenge_count: challengeCount,
  };
};

/**
 * Get game leaderboard
 */
export const getGameLeaderboard = async ({ gameId }) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  const leaderboard = await GamePlayer.find({ game_id: gameId })
    .populate("user_id", "username avatar")
    .sort({ score: -1, joined_at: 1 })
    .lean();

  return leaderboard;
};

// ========================================
// SOCKET SERVICES (used by socket handlers)
// ========================================

/**
 * Submit guess (called from socket)
 */
export const submitGuess = async ({ gameId, challengeId, userId, selectedIndex }) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  if (!game.is_challenge_active) {
    throw new Error("No active challenge");
  }

  // Check if user already guessed
  const existingGuess = await GameGuess.findOne({
    game_id: gameId,
    challenge_id: challengeId,
    user_id: userId,
  });

  if (existingGuess) {
    throw new Error("You have already guessed");
  }

  // Get challenge and check answer
  const challenge = await Challenge.findById(challengeId).lean();
  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const correctIndex = challenge.statements.findIndex((s) => s.is_cap);
  const isCorrect = selectedIndex === correctIndex;

  // Calculate points
  const pointsEarned = isCorrect ? 10 : 0;

  // Save guess
  const guess = await GameGuess.create({
    game_id: gameId,
    challenge_id: challengeId,
    user_id: userId,
    selected_index: selectedIndex,
    is_correct: isCorrect,
    points_earned: pointsEarned,
  });

  // Update player score
  if (isCorrect) {
    await GamePlayer.updateOne(
      { game_id: gameId, user_id: userId },
      { $inc: { score: pointsEarned } }
    );
  }

  return {
    guess,
    is_correct: isCorrect,
    points_earned: pointsEarned,
  };
};

/**
 * Start challenge (called from socket)
 */
export const startChallenge = async ({ gameId, challengeOrder }) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  if (game.status !== GAME_STATUS.LIVE) {
    throw new Error("Game is not live");
  }

  // Get challenge by order
  const gameChallenge = await GameChallenge.findOne({
    game_id: gameId,
    order: challengeOrder,
  }).populate("challenge_id");

  if (!gameChallenge) {
    throw new Error("Challenge not found");
  }

  // Update game state
  game.current_challenge_index = challengeOrder - 1;
  game.is_challenge_active = true;
  await game.save();

  // Update challenge start time
  gameChallenge.started_at = new Date();
  await gameChallenge.save();

  return gameChallenge;
};

/**
 * Close guessing (called from socket)
 */
export const closeGuessing = async ({ gameId }) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  game.is_challenge_active = false;
  await game.save();

  return game;
};

/**
 * Get challenge results (called from socket)
 */
export const getChallengeResults = async ({ gameId, challengeId }) => {
  const challenge = await Challenge.findById(challengeId).lean();
  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const correctIndex = challenge.statements.findIndex((s) => s.is_cap);

  // Get updated leaderboard
  const leaderboard = await GamePlayer.find({ game_id: gameId })
    .populate("user_id", "username avatar")
    .sort({ score: -1, joined_at: 1 })
    .lean();

  // Get guess stats for this challenge
  const guesses = await GameGuess.find({
    game_id: gameId,
    challenge_id: challengeId,
  }).lean();

  const totalGuesses = guesses.length;
  const correctGuesses = guesses.filter((g) => g.is_correct).length;

  return {
    correct_statement_index: correctIndex,
    leaderboard,
    stats: {
      total_guesses: totalGuesses,
      correct_guesses: correctGuesses,
    },
  };
};

/**
 * Get next challenge (called from socket)
 */
export const getNextChallenge = async ({ gameId }) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  const nextOrder = game.current_challenge_index + 2;

  const nextChallenge = await GameChallenge.findOne({
    game_id: gameId,
    order: nextOrder,
  }).populate("challenge_id");

  return nextChallenge;
};
