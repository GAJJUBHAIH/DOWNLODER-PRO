import { NextResponse } from "next/server";
import ytDlp from "yt-dlp-exec";

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

    // Fetch video info natively using yt-dlp-exec
    const info: any = await ytDlp(url, {
      dumpJson: true,
      noWarnings: true,
      noPlaylist: true,
      preferFreeFormats: true,
      addHeader: ["referer:youtube.com", "user-agent:Mozilla/5.0"]
    });
    
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
      { error: "Failed to fetch video information: " + (error.message || String(error)) },
      { status: 500, headers: corsHeaders }
    );
  }
}
