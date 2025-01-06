// utils/functions.js
import { google } from "googleapis";

// Your OAuth2 credentials
const REFRESH_TOKEN = "";
const CLIENT_ID = "";
const CLIENT_SECRET = "";
const REDIRECT_URL = "https://developers.google.com/oauthplayground";

// Create an OAuth2 client using the credentials
const oauthClient = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

// Set the refresh token in the OAuth2 client to allow access to the Drive API
oauthClient.setCredentials({ refresh_token: REFRESH_TOKEN });

// Initialize the Google Drive API client
export const drive = google.drive({
  version: "v3",
  auth: oauthClient,
});

// Batch size for parallel processing
const BATCH_SIZE = 10;

// Helper function to process folders in parallel batches
async function processFolderBatch(driveInstance, folders) {
  const batchPromises = folders.map((folder) =>
    driveInstance.files.list({
      q: `'${folder.id}' in parents and (mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.folder')`,
      fields:
        "files(id, name, mimeType, thumbnailLink, webViewLink, createdTime, parents)",
      pageSize: 1000,
      orderBy: "createdTime desc",
    })
  );

  return Promise.all(batchPromises);
}

// Helper function to check if file is an image
function isImageFile(mimeType) {
  const imageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/tiff",
    "image/svg+xml",
    "image/heic",
    "image/heif",
  ];
  return imageTypes.some((type) => mimeType.toLowerCase().includes(type));
}
//
// Optimized function to list images in a folder and its subfolders
export async function listImagesInFolder(driveInstance, folderId) {
  try {
    const allImages = [];
    const foldersToProcess = [{ id: folderId }];
    const processedFolders = new Set();

    while (foldersToProcess.length > 0) {
      // Take a batch of folders to process in parallel
      const currentBatch = foldersToProcess.splice(0, BATCH_SIZE);
      const uniqueBatch = currentBatch.filter(
        (folder) => !processedFolders.has(folder.id)
      );

      if (uniqueBatch.length === 0) continue;

      // Process the batch in parallel
      const batchResults = await processFolderBatch(driveInstance, uniqueBatch);

      for (const response of batchResults) {
        const items = response.data.files;

        for (const item of items) {
          if (item.mimeType === "application/vnd.google-apps.folder") {
            // Add new folders to process if not already processed
            if (!processedFolders.has(item.id)) {
              foldersToProcess.push(item);
            }
          } else if (isImageFile(item.mimeType)) {
            allImages.push({
              id: item.id,
              name: item.name,
              mimeType: item.mimeType,
              thumbnailLink: item.thumbnailLink,
              webViewLink: item.webViewLink,
              createdTime: item.createdTime,
              parents: item.parents,
            });
          }
        }
      }

      // Mark processed folders
      uniqueBatch.forEach((folder) => processedFolders.add(folder.id));
    }

    return allImages;
  } catch (error) {
    console.error(`Error in listImagesInFolder for folder ${folderId}:`, error);
    throw error;
  }
}
