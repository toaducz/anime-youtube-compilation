import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "public", "data");
    
    // Read files from public/data directory
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs
      .readdirSync(dataDir)
      .filter((file) => file.endsWith(".csv"));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error reading data directory:", error);
    return NextResponse.json({ files: [] }, { status: 500 });
  }
}
