import { NextResponse } from "next/server";
import { Readable } from "stream";
import path from "path";
import fs from "fs";

function spawnYtDlp(url: string, formatId: string) {
  const { spawn } = require("child_process");
  const binaryPath = path.join(process.cwd(), "node_modules", "yt-dlp-exec", "bin", "yt-dlp.exe");
  
  if (!fs.existsSync(binaryPath)) {
    throw new Error(`yt-dlp binary not found at ${binaryPath}`);
  }

  // yt-dlp streams the downloaded (and potentially merged) file directly to stdout
  // This correctly handles HLS playlists (.m3u8) and DASH streams natively!
  return spawn(binaryPath, [
    "-f",
    formatId,
    "-o",
    "-",
    url
  ]);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const formatId = searchParams.get("format");
    const ext = searchParams.get("ext") || "mp4";

    if (!url || !formatId) {
      return NextResponse.json({ error: "URL and format are required" }, { status: 400 });
    }

    const filename = `video_${Date.now()}.${ext}`;
    const child = spawnYtDlp(url, formatId);

    // Convert standard Node stream to Web ReadableStream for Next.js response
    const readable = new ReadableStream({
      start(controller) {
        let isClosed = false;
        
        child.stdout.on("data", (chunk: any) => {
          if (!isClosed) controller.enqueue(chunk);
        });
        
        child.stdout.on("end", () => {
          if (!isClosed) {
            isClosed = true;
            controller.close();
          }
        });
        
        child.stdout.on("error", (err: any) => {
          if (!isClosed) {
            isClosed = true;
            controller.error(err);
          }
        });
        
        child.on("error", (err: any) => {
          if (!isClosed) {
            isClosed = true;
            controller.error(err);
          }
        });
      },
      cancel() {
        child.kill();
      }
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": ext === "mp4" ? "video/mp4" : "application/octet-stream",
      },
    });
  } catch (error: any) {
    console.error("Download Error:", error);
    return NextResponse.json({ error: "Failed to start download process." }, { status: 500 });
  }
}
