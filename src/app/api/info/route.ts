import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400, headers: corsHeaders });
    }

    const isWin = process.platform === "win32";
    const binaryName = isWin ? "yt-dlp.exe" : "yt-dlp";
    const binaryPath = path.join(process.cwd(), "node_modules", "yt-dlp-exec", "bin", binaryName);
    
    if (!fs.existsSync(binaryPath)) {
      throw new Error(`yt-dlp binary not found at ${binaryPath}`);
    }

    // Fetch video info using local yt-dlp binary
    const { stdout } = await execAsync(
      `"${binaryPath}" --dump-json --no-warnings --no-playlist --prefer-free-formats --add-header "referer:youtube.com" --add-header "user-agent:Mozilla/5.0" "${url}"`,
      { maxBuffer: 20 * 1024 * 1024 } // 20MB limit
    );
    
    let info;
    try {
      // In case of a playlist or multiple outputs, only take the first JSON object
      const jsonString = stdout.trim().split('\n')[0];
      info = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse yt-dlp output:", stdout.substring(0, 200));
      throw new Error("Invalid output from video extractor.");
    }
    const duration = info.duration || 0;

    // Helper to fetch size via HEAD request if missing
    async function getFileSizeFromHeader(url: string): Promise<number | null> {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(url, { method: "HEAD", signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const len = res.headers.get("content-length");
          if (len) return parseInt(len, 10);
        }
      } catch (e) {
        // Ignore fetch errors
      }
      return null;
    }

    // Standardize format list
    const formatPromises = (info.formats || []).map(async (f: any) => {
      let filesize = f.filesize || f.filesize_approx;
      
      // Try to estimate filesize if missing from metadata
      if (!filesize) {
        if (f.tbr && duration) {
          filesize = (f.tbr * 1000 / 8) * duration;
        } else if (f.url) {
          filesize = await getFileSizeFromHeader(f.url);
        }
      }

      return {
        format_id: f.format_id,
        ext: f.ext,
        resolution: f.resolution || (f.vcodec !== "none" ? `${f.width}x${f.height}` : "audio only"),
        filesize: filesize || 0,
        format_note: f.format_note,
        hasAudio: f.acodec !== "none",
        hasVideo: f.vcodec !== "none",
        url: f.url,
      };
    });
    
    const formats = await Promise.all(formatPromises);

    const result = {
      id: info.id,
      title: info.title,
      thumbnail: info.thumbnail,
      duration,
      uploader: info.uploader,
      formats: formats,
    };

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Error fetching info:", error);
    return NextResponse.json(
      { error: "Failed to fetch video information. Ensure the URL is valid and public." },
      { status: 500, headers: corsHeaders }
    );
  }
}
