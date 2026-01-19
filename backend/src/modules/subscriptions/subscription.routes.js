import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminOnly } from "../../middlewares/role.middleware.js";
import * as SubscriptionController from "./subscription.controller.js";
import {
  SUBSCRIPTION_PLAN_TYPE,
  SUBSCRIPTION_STATUS,
  PAYMENT_PROVIDER,
} from "../../constants/enums.js";

export default async function subscriptionRoutes(app) {
  // Get all subscriptions (Admin only) - View only
  app.get(
    "/admin/subscriptions",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Subscriptions"],
        summary: "Get all subscriptions (Admin only)",
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
              enum: Object.values(SUBSCRIPTION_STATUS),
            },
            plan: {
              type: "string",
              enum: Object.values(SUBSCRIPTION_PLAN_TYPE),
            },
            payment_provider: {
              type: "string",
              enum: Object.values(PAYMENT_PROVIDER),
            },
            user_id: { type: "string" },
            search: { type: "string" },
          },
        },
      },
    },
    SubscriptionController.getSubscriptions
  );

  // Get subscription by ID (Admin only)
  app.get(
    "/admin/subscriptions/:subscriptionId",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Subscriptions"],
        summary: "Get subscription by ID (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        params: {
          type: "object",
          properties: {
            subscriptionId: { type: "string" },
          },
        },
      },
    },
    SubscriptionController.getSubscriptionById
  );

  // Create subscription (User only) - Called after successful payment
  app.post(
    "/subscriptions",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Subscriptions"],
        summary: "Create a new subscription (User only) - Called after successful payment",
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: {
          type: "object",
          required: ["plan", "payment_provider"],
          properties: {
            plan: {
              type: "string",
              enum: Object.values(SUBSCRIPTION_PLAN_TYPE),
            },
            payment_provider: {
              type: "string",
              enum: Object.values(PAYMENT_PROVIDER),
            },
          },
        },
      },
    },
    SubscriptionController.createSubscription
  );

  // Get my subscription (User only)
  app.get(
    "/subscriptions/me",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Subscriptions"],
        summary: "Get my active subscription (User only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    SubscriptionController.getMySubscription
  );

  // Cancel my subscription (User only)
  app.put(
    "/subscriptions/me/cancel",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Subscriptions"],
        summary: "Cancel my subscription (User only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    SubscriptionController.cancelMySubscription
  );
}
