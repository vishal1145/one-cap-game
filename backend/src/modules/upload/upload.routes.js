import * as UploadController from "./upload.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminOnly } from "../../middlewares/role.middleware.js";

export default async function uploadRoutes(app) {
  /**
   * Upload image
   */
  app.post(
    "/upload/image",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Upload"],
        summary: "Upload image for challenge media",
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        description: "Upload an image file (JPEG, PNG, WEBP, GIF). Max size: 5MB",
      },
    },
    UploadController.uploadImage
  );

  /**
   * Upload audio/voice
   */
  app.post(
    "/upload/audio",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Upload"],
        summary: "Upload audio for challenge media",
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        description: "Upload an audio file (MP3, WAV, OGG, WEBM, M4A). Max size: 10MB",
      },
    },
    UploadController.uploadAudio
  );

  /**
   * Delete file (Admin only)
   */
  app.delete(
    "/upload/file",
    {
      preHandler: [authMiddleware, adminOnly],
      schema: {
        tags: ["Upload", "Admin"],
        summary: "Delete uploaded file (Admin only)",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["fileUrl"],
          properties: {
            fileUrl: {
              type: "string",
              description: "File URL to delete",
            },
          },
        },
      },
    },
    UploadController.deleteFile
  );
}
