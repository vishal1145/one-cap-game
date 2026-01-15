import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminOnly } from "../../middlewares/role.middleware.js";
import * as UserController from "./user.controller.js";
import { USER_ROLES, USER_STATUS } from "../../constants/enums.js";

export default async function userRoutes(app) {
  app.get(
    "/admin/users",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin"],
        summary: "Get users list (Admin only)",
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
              enum: Object.values(USER_STATUS),
            },
            role: {
              type: "string",
              enum: Object.values(USER_ROLES),
            },
            search: { type: "string" },
          },
        },
      },
    },
    UserController.getUsersList
  );

  app.put(
    "/admin/users/:userId/status",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin"],
        summary: "Update user status (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        params: {
          type: "object",
          properties: {
            userId: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: Object.values(USER_STATUS),
            },
          },
        },
      },
    },
    UserController.updateUserStatus
  );

  app.put(
    "/users/me",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Users"],
        summary: "Update user profile",
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: {
          type: "object",
          properties: {
            username: { type: "string" },
            email: { type: "string" },
            avatar_url: { type: "string" },
            phone: { type: "string" },
          },
        },
      },
    },
    UserController.updateMyProfile
  );

  app.get(
    "/users/:userId",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Users"],
        summary: "Get user by ID",
        security: [
          {
            bearerAuth: [],
          },
        ],
        params: {
          type: "object",
          properties: {
            userId: { type: "string" },
          },
        },
      },
    },
    UserController.getUserById
  );
}
