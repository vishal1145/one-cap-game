import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminOnly } from "../../middlewares/role.middleware.js";
import * as ChallengeController from "./challenge.controller.js";
import { CHALLENGE_VISIBILITY, CHALLENGE_STATUS } from "../../constants/enums.js";

export default async function challengeRoutes(app) {
  // Create challenge
  app.post(
    "/challenges",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Challenges"],
        summary: "Create a new challenge",
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: {
          type: "object",
          required: ["statements"],
          properties: {
            prompt: { type: "string" },
            chain_id: { type: "string" },
            parent_challenge_id: { type: "string" },
            statements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string", maxLength: 300 },
                  is_cap: { type: "boolean" },
                },
              },
              minItems: 3,
              maxItems: 10,
            },
            theme: { type: "string", maxLength: 50 },
            media: {
              type: "object",
              properties: {
                image_url: { type: "string" },
                voice_url: { type: "string" },
              },
            },
            visibility: {
              type: "string",
              enum: Object.values(CHALLENGE_VISIBILITY),
            },
          },
        },
      },
    },
    ChallengeController.createChallenge
  );

  // Get all challenges (Admin only)
  app.get(
    "/admin/challenges",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Challenges"],
        summary: "Get all challenges (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1 },
            limit: { type: "number", default: 20 },
            status: {
              type: "string",
              enum: Object.values(CHALLENGE_STATUS),
            },
            visibility: {
              type: "string",
              enum: Object.values(CHALLENGE_VISIBILITY),
            },
            chain_id: { type: "string" },
            creator_id: { type: "string" },
            search: { type: "string" },
          },
        },
      },
    },
    ChallengeController.getAllChallenges
  );

  // Get challenge by ID (Admin only)
  app.get(
    "/admin/challenges/:id",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Challenges"],
        summary: "Get challenge by ID (Admin only)",
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    ChallengeController.getChallengeById
  );

  // Get my challenges (User only)
  app.get(
    "/challenges/my",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Challenges"],
        summary: "Get my challenges (User only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1 },
            limit: { type: "number", default: 20 },
            status: {
              type: "string",
              enum: Object.values(CHALLENGE_STATUS),
            },
            visibility: {
              type: "string",
              enum: Object.values(CHALLENGE_VISIBILITY),
            },
            chain_id: { type: "string" },
            search: { type: "string" },
          },
        },
      },
    },
    ChallengeController.getMyChallenges
  );

  // Get my challenge by ID (User only)
  app.get(
    "/challenges/my/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Challenges"],
        summary: "Get my challenge by ID (User only)",
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    ChallengeController.getChallengeById
  );

  // Update share status of chalenge (User only)
  app.post(
    "/challenges/:id/share",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Challenges"],
        summary: "Share a challenge",
        body: {
          type: "object",
          required: ["share_context"],
          properties: {
            share_context: {
              type: "string",
              enum: Object.values(CHALLENGE_VISIBILITY),
            },
          },
        },
      },
    },
    ChallengeController.shareChallenge
  );

  // Submit guess challenge (User only)
  app.post(
    "/challenges/:id/guess",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Challenges", "Games"],
        summary: "Submit guess challenge (User only)",
        body: {
          type: "object",
          properties: {
            selected_index: { type: "number" },
          },
        },
      },
    },
    ChallengeController.submitGuessChallenge
  );
}
