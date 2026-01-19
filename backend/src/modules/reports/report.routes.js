import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminOnly } from "../../middlewares/role.middleware.js";
import * as ReportController from "./report.controller.js";
import {
  REPORT_STATUS,
  REPORT_ACTION,
  REPORT_TARGET_TYPE,
  REPORT_REASON,
} from "../../constants/enums.js";

export default async function reportRoutes(app) {
  // Create report (User only)
  app.post(
    "/reports",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Reports"],
        summary: "Create a new report (User only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: {
          type: "object",
          required: ["target_type", "target_id", "reason"],
          properties: {
            target_type: {
              type: "string",
              enum: Object.values(REPORT_TARGET_TYPE),
            },
            target_id: { type: "string" },
            reason: {
              type: "string",
              enum: Object.values(REPORT_REASON),
              maxLength: 200,
            },
          },
        },
      },
    },
    ReportController.createReport
  );

  // Get group-wise reports (Admin only)
  app.get(
    "/admin/reports",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Reports"],
        summary: "Get group-wise reports (Admin only)",
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
              enum: Object.values(REPORT_STATUS),
            },
            target_type: {
              type: "string",
              enum: Object.values(REPORT_TARGET_TYPE),
            },
            search: { type: "string" },
          },
        },
      },
    },
    ReportController.getGroupWiseReports
  );

  // Get report by ID (Admin only)
  app.get(
    "/admin/reports/:reportId",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Reports"],
        summary: "Get report by ID (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        params: {
          type: "object",
          properties: {
            reportId: { type: "string" },
          },
        },
      },
    },
    ReportController.getReportById
  );

  // Take action on all reports for a target (Admin only)
  app.put(
    "/admin/reports/target/action",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Admin", "Reports"],
        summary: "Take action on all reports for a target (Admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: {
          type: "object",
          required: ["target_type", "target_id", "action"],
          properties: {
            target_type: {
              type: "string",
              enum: Object.values(REPORT_TARGET_TYPE),
            },
            target_id: { type: "string" },
            action: {
              type: "string",
              enum: Object.values(REPORT_ACTION),
            },
            notes: { type: "string", maxLength: 500 },
          },
        },
      },
    },
    ReportController.takeActionOnTargetReports
  );
}
