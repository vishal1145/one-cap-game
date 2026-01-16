import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminOnly } from "../../middlewares/role.middleware.js";
import * as NotificationController from "./notification.controller.js";
import { NOTIFICATION_TYPE, NOTIFICATION_CATEGORY } from "../../constants/enums.js";

export default async function notificationRoutes(app) {
  // Create notification (Admin only)
  app.post(
    "/admin/notifications",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Notifications"],
        summary: "Create a new notification (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: {
          type: "object",
          required: ["title", "message", "type", "category"],
          properties: {
            title: { type: "string" },
            message: { type: "string" },
            type: {
              type: "string",
              enum: Object.values(NOTIFICATION_TYPE),
            },
            category: {
              type: "string",
              enum: Object.values(NOTIFICATION_CATEGORY),
            },
            recipient_id: { type: "string" },
            related_entity_type: {
              type: "string",
              enum: ["user", "statement", "chain", "challenge", null],
            },
            related_entity_id: { type: "string" },
          },
        },
      },
    },
    NotificationController.createNotification
  );

  // Get all notifications (Admin only)
  app.get(
    "/admin/notifications",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Notifications"],
        summary: "Get all notifications (Admin only)",
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
            category: {
              type: "string",
              enum: Object.values(NOTIFICATION_CATEGORY),
            },
            type: {
              type: "string",
              enum: Object.values(NOTIFICATION_TYPE),
            },
            read: { type: "boolean" },
            search: { type: "string" },
            recipient_id: { type: "string" },
          },
        },
      },
    },
    NotificationController.getAllNotifications
  );

  // Get notification by ID (Admin only)
  app.get(
    "/admin/notifications/:id",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Notifications"],
        summary: "Get notification by ID (Admin only)",
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
    NotificationController.getNotificationById
  );

  // Update notification (Admin only)
  app.put(
    "/admin/notifications/:id",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Notifications"],
        summary: "Update a notification (Admin only)",
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
            title: { type: "string" },
            message: { type: "string" },
            type: {
              type: "string",
              enum: Object.values(NOTIFICATION_TYPE),
            },
            category: {
              type: "string",
              enum: Object.values(NOTIFICATION_CATEGORY),
            },
            read: { type: "boolean" },
          },
        },
      },
    },
    NotificationController.updateNotification
  );

  // Mark all notifications as read (Admin only)
  app.put(
    "/admin/notifications/mark-all-read",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Notifications"],
        summary: "Mark all notifications as read (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        querystring: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: Object.values(NOTIFICATION_CATEGORY),
            },
            type: {
              type: "string",
              enum: Object.values(NOTIFICATION_TYPE),
            },
          },
        },
      },
    },
    NotificationController.markAllAsRead
  );

  // Delete notification (Admin only)
  app.delete(
    "/admin/notifications/:id",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Notifications"],
        summary: "Delete a notification (Admin only)",
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
    NotificationController.deleteNotification
  );

  // Delete all notifications (Admin only)
  app.delete(
    "/admin/notifications",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Notifications"],
        summary: "Delete all notifications (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        querystring: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: Object.values(NOTIFICATION_CATEGORY),
            },
            type: {
              type: "string",
              enum: Object.values(NOTIFICATION_TYPE),
            },
            read: { type: "boolean" },
          },
        },
      },
    },
    NotificationController.deleteAllNotifications
  );

  // Get my notifications (User only)
  app.get(
    "/notifications/my",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Notifications"],
        summary: "Get my notifications (User only)",
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
            category: {
              type: "string",
              enum: Object.values(NOTIFICATION_CATEGORY),
            },
            type: {
              type: "string",
              enum: Object.values(NOTIFICATION_TYPE),
            },
            read: { type: "boolean" },
            search: { type: "string" },
          },
        },
      },
    },
    NotificationController.getAllNotifications
  );

  // Get my notification by ID (User only)
  app.get(
    "/notifications/my/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Notifications"],
        summary: "Get my notification by ID (User only)",
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
    NotificationController.getNotificationById
  );

  // Mark my notification as read (User only)
  app.put(
    "/notifications/my/:id/read",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Notifications"],
        summary: "Mark my notification as read (User only)",
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
    NotificationController.updateNotification
  );

  // Mark all my notifications as read (User only)
  app.put(
    "/notifications/my/mark-all-read",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Notifications"],
        summary: "Mark all my notifications as read (User only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        querystring: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: Object.values(NOTIFICATION_CATEGORY),
            },
            type: {
              type: "string",
              enum: Object.values(NOTIFICATION_TYPE),
            },
          },
        },
      },
    },
    NotificationController.markAllAsRead
  );

  // Delete my notification (User only)
  app.delete(
    "/notifications/my/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Notifications"],
        summary: "Delete my notification (User only)",
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
    NotificationController.deleteNotification
  );
}
