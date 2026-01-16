import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminOnly } from "../../middlewares/role.middleware.js";
import * as StatementController from "./statement.controller.js";
import { STATEMENT_TYPE, STATEMENT_DIFFICULTY, STATEMENT_STATUS } from "../../constants/enums.js";

export default async function statementRoutes(app) {
  // Create statement
  app.post(
    "/admin/statements",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Statements"],
        summary: "Create a new statement (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: {
          type: "object",
          required: ["text", "type", "category", "difficulty"],
          properties: {
            text: { type: "string", maxLength: 300 },
            type: {
              type: "string",
              enum: Object.values(STATEMENT_TYPE),
            },
            category: { type: "string" },
            difficulty: {
              type: "string",
              enum: Object.values(STATEMENT_DIFFICULTY),
            },
            status: {
              type: "string",
              enum: Object.values(STATEMENT_STATUS),
            },
          },
        },
      },
    },
    StatementController.createStatement
  );

  // Get all statements (Admin only)
  app.get(
    "/admin/statements",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Statements"],
        summary: "Get all statements (Admin only)",
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
              enum: Object.values(STATEMENT_STATUS),
            },
            type: {
              type: "string",
              enum: Object.values(STATEMENT_TYPE),
            },
            difficulty: {
              type: "string",
              enum: Object.values(STATEMENT_DIFFICULTY),
            },
            category: { type: "string" },
            search: { type: "string" },
          },
        },
      },
    },
    StatementController.getAllStatements
  );

  // Get statement by ID (Admin only)
  app.get(
    "/admin/statements/:id",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Statements"],
        summary: "Get statement by ID (Admin only)",
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
    StatementController.getStatementById
  );

  // Get my statements (User only)
  app.get(
    "/statements/my",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Statements"],
        summary: "Get my statements (User only)",
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
              enum: Object.values(STATEMENT_STATUS),
            },
            type: {
              type: "string",
              enum: Object.values(STATEMENT_TYPE),
            },
            difficulty: {
              type: "string",
              enum: Object.values(STATEMENT_DIFFICULTY),
            },
            category: { type: "string" },
            search: { type: "string" },
          },
        },
      },
    },
    StatementController.getMyStatements
  );

  // Get my statement by ID (User only)
  app.get(
    "/statements/my/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Statements"],
        summary: "Get my statement by ID (User only)",
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
    StatementController.getStatementById
  );

  // Update statement (Admin only)
  app.put(
    "/admin/statements/:id",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Statements"],
        summary: "Update a statement (Admin only)",
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
        body: {
          type: "object",
          properties: {
            text: { type: "string", maxLength: 300 },
            type: {
              type: "string",
              enum: Object.values(STATEMENT_TYPE),
            },
            category: { type: "string" },
            difficulty: {
              type: "string",
              enum: Object.values(STATEMENT_DIFFICULTY),
            },
            status: {
              type: "string",
              enum: Object.values(STATEMENT_STATUS),
            },
          },
        },
      },
    },
    StatementController.updateStatement
  );

  // Delete statement (Admin only)
  app.delete(
    "/admin/statements/:id",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Statements"],
        summary: "Delete a statement (Admin only)",
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
    StatementController.deleteStatement
  );
}
