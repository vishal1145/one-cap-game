import { authMiddleware } from "../../middlewares/auth.middleware.js";
import * as ChainController from "./chain.controller.js";
import { CHAIN_VISIBILITY, CHAIN_STATUS } from "../../constants/enums.js";
import { adminOnly } from "../../middlewares/role.middleware.js";

export default async function chainRoutes(app) {
  app.post(
    "/chains",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Chains"],
        summary: "Create a new chain",
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            visibility: { type: "string", enum: Object.values(CHAIN_VISIBILITY) },
            status: { type: "string", enum: Object.values(CHAIN_STATUS) },
            expires_at: { type: "string", format: "date-time" },
          },
        },
      },
    },
    ChainController.createChain
  );

  app.get("/admin/chains", {
    preHandler: [authMiddleware, adminOnly],
    schema: {
      tags: ["Admin", "Chains"],
      summary: "Get all chains (Admin only)",
      querystring: {
        type: "object",
        properties: {
          visibility: { type: "string", enum: Object.values(CHAIN_VISIBILITY) },
          search: { type: "string" },
          page: { type: "number" },
          limit: { type: "number" },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  }, ChainController.getAllChains);

  app.get(
    "/admin/chains/:id",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Chains"],
        summary: "Get chain by ID (Admin only)",
        params: {
          type: "object",
          properties: { id: { type: "string" } },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    ChainController.getChainById
  );

  app.get("/chains/my", {
    preHandler: [authMiddleware],
    schema: {
      tags: ["Chains"],
      summary: "Get my chains (User only)",
      querystring: {
        type: "object",
        properties: {
          visibility: { type: "string", enum: Object.values(CHAIN_VISIBILITY) },
          search: { type: "string" },
          page: { type: "number" },
          limit: { type: "number" },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  }, ChainController.getMyChains);

  app.get(
    "/chains/my/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Chains"],
        summary: "Get my chain by ID (User only)",
        params: {
          type: "object",
          properties: { id: { type: "string" } },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    ChainController.getChainById
  );
}

