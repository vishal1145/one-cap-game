import * as GameService from "../modules/games/game.service.js";
import jwt from "jsonwebtoken";

/**
 * Socket.IO authentication middleware
 */
const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.role = decoded.role;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
};

/**
 * Admin-only middleware for socket
 */
const adminOnly = (socket, next) => {
  if (socket.role !== "admin") {
    return next(new Error("Authorization error: Admin access required"));
  }
  next();
};

/**
 * Setup game socket handlers
 */
export const setupGameSocket = (io) => {
  const gameNamespace = io.of("/game");

  // Apply authentication middleware
  gameNamespace.use(authenticateSocket);

  gameNamespace.on("connection", (socket) => {
    console.log(`🔌 User ${socket.userId} connected to game namespace`);

    // ===========================================
    // 🟢 USER: Join game room
    // ===========================================
    socket.on("join_game", async ({ gameId }, callback) => {
      try {
        // Verify user is part of the game
        const gameState = await GameService.getGameState({
          userId: socket.userId,
          gameId,
        });

        // Join socket room
        socket.join(`game_${gameId}`);
        socket.currentGameId = gameId;

        console.log(`👤 User ${socket.userId} joined game ${gameId}`);

        // Send current game state to the user
        callback({
          success: true,
          game: gameState.game,
          players: gameState.players,
          current_challenge: gameState.current_challenge,
        });

        // Notify all players that someone joined
        gameNamespace.to(`game_${gameId}`).emit("player_joined", {
          user_id: socket.userId,
          players: gameState.players,
        });
      } catch (err) {
        console.error("Error joining game:", err);
        callback({
          success: false,
          message: err.message,
        });
      }
    });

    // ===========================================
    // 🔥 ADMIN: Start challenge
    // ===========================================
    socket.on("start_challenge", async ({ gameId, challengeOrder }, callback) => {
      try {
        // Verify admin
        if (socket.role !== "admin") {
          throw new Error("Only admins can start challenges");
        }

        const gameChallenge = await GameService.startChallenge({
          gameId,
          challengeOrder,
        });

        console.log(`🎯 Challenge ${challengeOrder} started in game ${gameId}`);

        // Broadcast to all players
        gameNamespace.to(`game_${gameId}`).emit("challenge_started", {
          challenge: gameChallenge.challenge_id,
          order: challengeOrder,
        });

        if (callback) {
          callback({
            success: true,
            challenge: gameChallenge.challenge_id,
          });
        }
      } catch (err) {
        console.error("Error starting challenge:", err);
        if (callback) {
          callback({
            success: false,
            message: err.message,
          });
        }
      }
    });

    // ===========================================
    // 🧠 USER: Submit guess
    // ===========================================
    socket.on("submit_guess", async ({ gameId, challengeId, selected_index }, callback) => {
      try {
        const result = await GameService.submitGuess({
          gameId,
          challengeId,
          userId: socket.userId,
          selectedIndex: selected_index,
        });

        console.log(
          `✅ User ${socket.userId} guessed in game ${gameId}, correct: ${result.is_correct}`
        );

        // Send confirmation to user
        callback({
          success: true,
          is_correct: result.is_correct,
          points_earned: result.points_earned,
          message: "Guess submitted successfully",
        });

        // Notify admin that someone guessed (optional)
        gameNamespace.to(`game_${gameId}`).emit("guess_received", {
          user_id: socket.userId,
        });
      } catch (err) {
        console.error("Error submitting guess:", err);
        callback({
          success: false,
          message: err.message,
        });
      }
    });

    // ===========================================
    // ⏱️ ADMIN: Close guessing
    // ===========================================
    socket.on("close_guessing", async ({ gameId }, callback) => {
      try {
        // Verify admin
        if (socket.role !== "admin") {
          throw new Error("Only admins can close guessing");
        }

        await GameService.closeGuessing({ gameId });

        console.log(`🔒 Guessing closed for game ${gameId}`);

        // Broadcast to all players
        gameNamespace.to(`game_${gameId}`).emit("guess_closed", {
          message: "Guessing is now closed",
        });

        if (callback) {
          callback({
            success: true,
          });
        }
      } catch (err) {
        console.error("Error closing guessing:", err);
        if (callback) {
          callback({
            success: false,
            message: err.message,
          });
        }
      }
    });

    // ===========================================
    // 🎉 ADMIN: Reveal results
    // ===========================================
    socket.on("reveal_results", async ({ gameId, challengeId }, callback) => {
      try {
        // Verify admin
        if (socket.role !== "admin") {
          throw new Error("Only admins can reveal results");
        }

        const results = await GameService.getChallengeResults({
          gameId,
          challengeId,
        });

        console.log(`🏆 Results revealed for game ${gameId}`);

        // Broadcast results to all players
        gameNamespace.to(`game_${gameId}`).emit("challenge_result", {
          correct_statement_index: results.correct_statement_index,
          leaderboard: results.leaderboard,
          stats: results.stats,
        });

        if (callback) {
          callback({
            success: true,
            results,
          });
        }
      } catch (err) {
        console.error("Error revealing results:", err);
        if (callback) {
          callback({
            success: false,
            message: err.message,
          });
        }
      }
    });

    // ===========================================
    // ➡️ ADMIN: Next challenge
    // ===========================================
    socket.on("next_challenge", async ({ gameId }, callback) => {
      try {
        // Verify admin
        if (socket.role !== "admin") {
          throw new Error("Only admins can move to next challenge");
        }

        const nextChallenge = await GameService.getNextChallenge({ gameId });

        if (!nextChallenge) {
          // No more challenges - game should end
          gameNamespace.to(`game_${gameId}`).emit("game_complete", {
            message: "All challenges completed!",
          });

          if (callback) {
            callback({
              success: true,
              has_next: false,
            });
          }
          return;
        }

        if (callback) {
          callback({
            success: true,
            has_next: true,
            next_challenge: nextChallenge,
          });
        }
      } catch (err) {
        console.error("Error getting next challenge:", err);
        if (callback) {
          callback({
            success: false,
            message: err.message,
          });
        }
      }
    });

    // ===========================================
    // 🎮 ADMIN: End game
    // ===========================================
    socket.on("end_game", async ({ gameId }, callback) => {
      try {
        // Verify admin
        if (socket.role !== "admin") {
          throw new Error("Only admins can end the game");
        }

        const game = await GameService.endGame({ gameId });
        const leaderboard = await GameService.getGameLeaderboard({ gameId });

        console.log(`🏁 Game ${gameId} ended`);

        // Broadcast game end to all players
        gameNamespace.to(`game_${gameId}`).emit("game_ended", {
          game,
          leaderboard,
          message: "Game has ended!",
        });

        if (callback) {
          callback({
            success: true,
            game,
            leaderboard,
          });
        }
      } catch (err) {
        console.error("Error ending game:", err);
        if (callback) {
          callback({
            success: false,
            message: err.message,
          });
        }
      }
    });

    // ===========================================
    // 🔌 Disconnect
    // ===========================================
    socket.on("disconnect", () => {
      console.log(`🔌 User ${socket.userId} disconnected from game namespace`);
      if (socket.currentGameId) {
        gameNamespace.to(`game_${socket.currentGameId}`).emit("player_disconnected", {
          user_id: socket.userId,
        });
      }
    });
  });

  console.log("🎮 Game socket namespace initialized");
};
