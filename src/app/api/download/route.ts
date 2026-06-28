import { NextResponse } from "next/server";
import { Readable } from "stream";
import { create } from "yt-dlp-exec";
import path from "path";

const isWin = process.platform === "win32";
const binaryName = isWin ? "yt-dlp.exe" : "yt-dlp";
const binaryPath = path.join(process.cwd(), "node_modules", "yt-dlp-exec", "bin", binaryName);
const ytDlp = create(binaryPath);

function spawnYtDlp(url: string, formatId: string) {
  return ytDlp.exec(url, {
    format: formatId,
    output: "-",
  });
}
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const formatId = searchParams.get("format");
    const ext = searchParams.get("ext") || "mp4";

    if (!url || !formatId) {
      return NextResponse.json({ error: "URL and format are required" }, { status: 400, headers: corsHeaders });
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
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Download Error:", error);
    return NextResponse.json({ error: "Failed to start download process." }, { status: 500, headers: corsHeaders });
  }
}
