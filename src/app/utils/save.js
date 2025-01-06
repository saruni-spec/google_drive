// pages/api/folders.js
import { connectToDatabase } from "./db";

// Helper function to download and save a single file to database
async function downloadFile(driveInstance, file, folderId) {
  const fileId = file.id;
  try {
    // Get the file metadata first to confirm it's an image
    const fileMetadata = await driveInstance.files.get({
      fileId: fileId,
      fields: "name, mimeType",
    });

    if (!fileMetadata.data.mimeType.startsWith("image/")) {
      throw new Error("File is not an image");
    }

    // Get the file content
    const response = await driveInstance.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      {
        responseType: "arraybuffer", // Changed to arraybuffer to handle binary data
      }
    );

    // Save to database
    const connection = await connectToDatabase();
    await connection.execute(
      "INSERT INTO image (image_data, image_name, folder_id) VALUES (?, ?, ?)",
      [Buffer.from(response.data), fileMetadata.data.name, folderId]
    );

    return {
      success: true,
      name: fileMetadata.data.name,
      fileId: fileId,
    };
  } catch (error) {
    console.error(`Error processing file ${fileId}:`, error);
    return {
      success: false,
      fileId: fileId,
      error: error.message,
    };
  }
}

// Main function to download multiple images
export async function downloadImagesFromFolder(
  driveInstance,
  images,
  folder,
  options = {}
) {
  try {
    // Save to database
    const connection = await connectToDatabase();
    await connection.execute(
      "INSERT INTO folder (folder_id,folder_name) VALUES (?, ?)",
      [folder.id, folder.name]
    );

    // Apply optional limits
    const limit = options.limit || images.length;
    const imagesToDownload = images.slice(0, limit);

    console.log(`Starting download of ${imagesToDownload.length} images...`);

    // Download files in parallel with concurrency limit
    const concurrency = options.concurrency || 5;
    const results = [];

    for (let i = 0; i < imagesToDownload.length; i += concurrency) {
      const batch = imagesToDownload.slice(i, i + concurrency);
      const batchPromises = batch.map((image) => {
        return downloadFile(driveInstance, image, folder.id);
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Optional progress callback
      if (options.onProgress) {
        options.onProgress({
          completed: i + batchResults.length,
          total: imagesToDownload.length,
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        });
      }
    }

    return {
      success: true,
      totalProcessed: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results: results,
    };
  } catch (error) {
    console.error("Error in downloadImagesFromFolder:", error);
    throw error;
  }
}
