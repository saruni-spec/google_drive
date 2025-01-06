import { listImagesInFolder, drive } from "../../utils/functions";
import { NextResponse } from "next/server";
import { downloadImagesFromFolder } from "../../utils/save";

export async function GET(req) {
  try {
    // Get the URL from the request
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Get all parameters from searchParams
    const folderId = searchParams.get("folder");
    const recursive = searchParams.get("recursive") ?? "true";
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "50");

    // Check if folder ID exists
    if (!folderId) {
      return NextResponse.json(
        { error: "Folder ID is required" },
        { status: 400 }
      );
    }

    let images;
    if (recursive === "true") {
      images = await listImagesInFolder(drive, folderId);
    } else {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and mimeType contains 'image/'`,
        fields:
          "files(id, name, mimeType, thumbnailLink, webViewLink, createdTime, parents)",
        pageSize: 1000,
        orderBy: "createdTime desc",
      });
      images = response.data.files;
    }

    if (images === undefined) {
      return NextResponse.json({
        success: false,
        count: 0,
        totalPages: 0,
        currentPage: 0,
        images: [],
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedImages = images.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      success: true,
      count: images.length,
      totalPages: Math.ceil(images.length / pageSize),
      currentPage: page,
      images: paginatedImages,
    });
  } catch (error) {
    console.error("Error listing images:", error);
    return NextResponse.json({
      status: 500,
      success: false,
      error: "Failed to list images",
      details: error.message,
    });
  }
}

// API route handler
export async function POST(req) {
  try {
    const body = await req.json();
    console.log(body);
    const { images, folder } = body;
    const limit = 10;

    if (!folder) {
      return NextResponse.json(
        { error: "Folder ID is required" },
        { status: 400 }
      );
    }

    const result = await downloadImagesFromFolder(drive, images, folder, {
      limit: limit,
      concurrency: 5,
      onProgress: (progress) => {
        console.log(
          `Download progress: ${progress.completed}/${progress.total}`
        );
      },
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Error downloading images:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to download images",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
