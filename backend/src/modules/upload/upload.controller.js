import * as UploadService from "./upload.service.js";

/**
 * Upload image
 */
export const uploadImage = async (req, reply) => {
  try {
    const file = await req.file();

    if (!file) {
      return reply.code(400).send({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await UploadService.uploadImage(file);

    return reply.send({
      success: true,
      data: result,
      message: "Image uploaded successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message || "Failed to upload image",
    });
  }
};

/**
 * Upload audio/voice
 */
export const uploadAudio = async (req, reply) => {
  try {
    const file = await req.file();

    if (!file) {
      return reply.code(400).send({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await UploadService.uploadAudio(file);

    return reply.send({
      success: true,
      data: result,
      message: "Audio uploaded successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message || "Failed to upload audio",
    });
  }
};

/**
 * Delete file
 */
export const deleteFile = async (req, reply) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return reply.code(400).send({
        success: false,
        message: "File URL is required",
      });
    }

    const result = await UploadService.deleteFile(fileUrl);

    return reply.send({
      success: true,
      message: result.message || "File deleted successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message || "Failed to delete file",
    });
  }
};
