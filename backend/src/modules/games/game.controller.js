import * as GameService from "./game.service.js";

// ========================================
// ADMIN CONTROLLERS
// ========================================

/**
 * Create game (Admin only)
 */
export const createGame = async (req, reply) => {
  try {
    const game = await GameService.createGame({
      adminId: req.user.userId,
      payload: req.body,
    });

    return reply.code(201).send({
      success: true,
      game,
      message: "Game created successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Add challenge to game (Admin only)
 */
export const addChallengeToGame = async (req, reply) => {
  try {
    const gameChallenge = await GameService.addChallengeToGame({
      gameId: req.params.id,
      challengeId: req.body.challenge_id,
    });

    return reply.send({
      success: true,
      gameChallenge,
      message: "Challenge added to game successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Add multiple challenges to game (Admin only)
 */
export const addMultipleChallengesToGame = async (req, reply) => {
  try {
    const gameChallenges = await GameService.addMultipleChallengesToGame({
      gameId: req.params.id,
      challengeIds: req.body.challenge_ids,
    });

    return reply.send({
      success: true,
      gameChallenges,
      count: gameChallenges.length,
      message: `${gameChallenges.length} challenge(s) added to game successfully`,
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Start game (Admin only)
 */
export const startGame = async (req, reply) => {
  try {
    const game = await GameService.startGame({
      gameId: req.params.id,
    });

    return reply.send({
      success: true,
      game,
      message: "Game started successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

/**
 * End game (Admin only)
 */
export const endGame = async (req, reply) => {
  try {
    const game = await GameService.endGame({
      gameId: req.params.id,
    });

    return reply.send({
      success: true,
      game,
      message: "Game ended successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get all games (Admin only)
 */
export const getGames = async (req, reply) => {
  try {
    const result = await GameService.getGames({
      filters: req.query,
    });

    return reply.send({
      success: true,
      ...result,
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get game by ID (Admin only)
 */
export const getGameById = async (req, reply) => {
  try {
    const game = await GameService.getGameById({
      gameId: req.params.id,
    });

    return reply.send({
      success: true,
      game,
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get game players (Admin only)
 */
export const getGamePlayers = async (req, reply) => {
  try {
    const players = await GameService.getGamePlayers({
      gameId: req.params.id,
    });

    return reply.send({
      success: true,
      players,
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get game challenges (Admin only)
 */
export const getGameChallenges = async (req, reply) => {
  try {
    const challenges = await GameService.getGameChallenges({
      gameId: req.params.id,
    });

    return reply.send({
      success: true,
      challenges,
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get game leaderboard (Admin only)
 */
export const getGameLeaderboardAdmin = async (req, reply) => {
  try {
    const leaderboard = await GameService.getGameLeaderboard({
      gameId: req.params.id,
    });

    return reply.send({
      success: true,
      leaderboard,
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// USER CONTROLLERS
// ========================================

/**
 * Join game via join code
 */
export const joinGame = async (req, reply) => {
  try {
    const gamePlayer = await GameService.joinGame({
      userId: req.user.userId,
      joinCode: req.body.join_code,
    });

    return reply.send({
      success: true,
      gamePlayer,
      message: "Joined game successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get game state
 */
export const getGameState = async (req, reply) => {
  try {
    const gameState = await GameService.getGameState({
      userId: req.user.userId,
      gameId: req.params.id,
    });

    return reply.send({
      success: true,
      ...gameState,
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get game leaderboard
 */
export const getGameLeaderboard = async (req, reply) => {
  try {
    const leaderboard = await GameService.getGameLeaderboard({
      gameId: req.params.id,
    });

    return reply.send({
      success: true,
      leaderboard,
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};
