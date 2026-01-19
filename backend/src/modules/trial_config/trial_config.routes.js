import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminOnly } from "../../middlewares/role.middleware.js";
import * as TrialConfigController from "./trial_config.controller.js";

export default async function trialConfigRoutes(app) {

  app.get(
    "/admin/trial-config",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin"],
        summary: "Get all trial configs (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    TrialConfigController.list
  );

  app.get(
    "/admin/trial-config/:id",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin"],
        summary: "Get trial config by ID (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    TrialConfigController.get
  );

  app.put(
    "/admin/trial-config/:id",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin"],
        summary: "Update trial config (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            pro_trial_enabled: { type: "boolean" },
            trial_duration_days: { type: "number" },
            paywall_after_days: { type: "number" },
            trial_eligibility: { type: "string" },
            downgrade_behavior: { type: "string" },
          },
        },
      },
    },
    TrialConfigController.update
  );
}