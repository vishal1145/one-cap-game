import * as GameController from "./game.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminOnly } from "../../middlewares/role.middleware.js";
import { GAME_STATUS } from "../../constants/enums.js";

export default async function gameRoutes(app) {
  // ========================================
  // ADMIN ROUTES
  // ========================================

  /**
   * Create game (Admin only)
   */
  app.post(
    "/admin/games",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Games"],
        summary: "Create a new game (Admin only)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", maxLength: 100 },
            max_players: { type: "number", minimum: 2, maximum: 100, default: 20 },
          },
        },
      },
    },
    GameController.createGame
  );

  /**
   * Get all games (Admin only)
   */
  app.get(
    "/admin/games",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Games"],
        summary: "Get all games (Admin only)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1 },
            limit: { type: "number", default: 20 },
            status: { type: "string", enum: Object.values(GAME_STATUS) },
            search: { type: "string" },
          },
        },
      },
    },
    GameController.getGames
  );

  /**
   * Get game by ID (Admin only)
   */
  app.get(
    "/admin/games/:id",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Games"],
        summary: "Get game by ID (Admin only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    GameController.getGameById
  );

  /**
   * Add challenge to game (Admin only)
   */
  app.post(
    "/admin/games/:id/challenges",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Games"],
        summary: "Add challenge to game (Admin only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["challenge_id"],
          properties: {
            challenge_id: { type: "string" },
          },
        },
      },
    },
    GameController.addChallengeToGame
  );

  /**
   * Add multiple challenges to game (Admin only)
   */
  app.post(
    "/admin/games/:id/challenges/bulk",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Games"],
        summary: "Add multiple challenges to game (Admin only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["challenge_ids"],
          properties: {
            challenge_ids: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
            },
          },
        },
      },
    },
    GameController.addMultipleChallengesToGame
  );

  /**
   * Get game challenges (Admin only)
   */
  app.get(
    "/admin/games/:id/challenges",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Games"],
        summary: "Get game challenges (Admin only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    GameController.getGameChallenges
  );

  /**
   * Start game (Admin only)
   */
  app.post(
    "/admin/games/:id/start",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Games"],
        summary: "Start game (Admin only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    GameController.startGame
  );

  /**
   * End game (Admin only)
   */
  app.post(
    "/admin/games/:id/end",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Games"],
        summary: "End game (Admin only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    GameController.endGame
  );

  /**
   * Get game players (Admin only)
   */
  app.get(
    "/admin/games/:id/players",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Games"],
        summary: "Get game players (Admin only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    GameController.getGamePlayers
  );

  /**
   * Get game leaderboard (Admin only)
   */
  app.get(
    "/admin/games/:id/leaderboard",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Games"],
        summary: "Get game leaderboard (Admin only)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    GameController.getGameLeaderboardAdmin
  );

  // ========================================
  // USER ROUTES
  // ========================================

  /**
   * Join game via join code
   */
  app.post(
    "/games/join",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Games"],
        summary: "Join game via join code",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["join_code"],
          properties: {
            join_code: { type: "string", maxLength: 10 },
          },
        },
      },
    },
    GameController.joinGame
  );

  /**
   * Get game state
   */
  app.get(
    "/games/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Games"],
        summary: "Get game state",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    GameController.getGameState
  );

  /**
   * Get game leaderboard
   */
  app.get(
    "/games/:id/leaderboard",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Games"],
        summary: "Get game leaderboard",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    GameController.getGameLeaderboard
  );
}
