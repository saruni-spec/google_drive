import { drive } from "../../utils/functions.js";
import { NextResponse } from "next/server";

//
//get all the folders in google drive
export async function GET() {
  try {
    // List all folders in the root directory
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name, createdTime)",
      orderBy: "createdTime desc",
    });
    const folders = response.data.files;

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error listing folders:", error);
    return NextResponse.json({ status: 500, error: "Failed to list folders" });
  }
}
