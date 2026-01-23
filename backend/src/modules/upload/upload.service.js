import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { pipeline } from "stream/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed file types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/m4a",
];

// Max file sizes (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Upload image file
 */
export const uploadImage = async (file) => {
  try {
    // Validate file exists
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new Error(
        "Invalid file type. Allowed: JPEG, PNG, WEBP, GIF"
      );
    }

    // Check file size
    const fileBuffer = await file.toBuffer();
    if (fileBuffer.length > MAX_IMAGE_SIZE) {
      throw new Error("File size exceeds 5MB limit");
    }

    // Generate unique filename
    const fileExtension = path.extname(file.filename);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;

    // Define upload directory
    const uploadDir = path.join(__dirname, "../../../public/uploads/images");

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Define file path
    const filePath = path.join(uploadDir, uniqueFilename);

    // Save file
    await fs.promises.writeFile(filePath, fileBuffer);

    // Return public URL
    const fileUrl = `${process.env.BASE_URL}/public/uploads/images/${uniqueFilename}`;

    return {
      filename: uniqueFilename,
      originalName: file.filename,
      url: fileUrl,
      size: fileBuffer.length,
      mimetype: file.mimetype,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Upload audio/voice file
 */
export const uploadAudio = async (file) => {
  try {
    // Validate file exists
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      throw new Error(
        "Invalid file type. Allowed: MP3, WAV, OGG, WEBM, M4A"
      );
    }

    // Check file size
    const fileBuffer = await file.toBuffer();
    if (fileBuffer.length > MAX_AUDIO_SIZE) {
      throw new Error("File size exceeds 10MB limit");
    }

    // Generate unique filename
    const fileExtension = path.extname(file.filename);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;

    // Define upload directory
    const uploadDir = path.join(__dirname, "../../../public/uploads/audio");

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Define file path
    const filePath = path.join(uploadDir, uniqueFilename);

    // Save file
    await fs.promises.writeFile(filePath, fileBuffer);

    // Return public URL
    const fileUrl = `${process.env.BASE_URL}/public/uploads/audio/${uniqueFilename}`;

    return {
      filename: uniqueFilename,
      originalName: file.filename,
      url: fileUrl,
      size: fileBuffer.length,
      mimetype: file.mimetype,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Delete file
 */
export const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error("No file URL provided");
    }

    // Extract filename from URL
    const urlPath = fileUrl.replace("/public/", "");
    const filePath = path.join(__dirname, "../../../public", urlPath);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Delete file
      await fs.promises.unlink(filePath);
      return { success: true, message: "File deleted successfully" };
    } else {
      throw new Error("File not found");
    }
  } catch (error) {
    throw error;
  }
};
