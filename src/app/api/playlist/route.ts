import { NextResponse } from "next/server";
import { create } from "yt-dlp-exec";
import path from "path";

const isWin = process.platform === "win32";
const binaryName = isWin ? "yt-dlp.exe" : "yt-dlp";
const binaryPath = path.join(process.cwd(), "node_modules", "yt-dlp-exec", "bin", binaryName);
const ytDlp = create(binaryPath);

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

    const info: any = await ytDlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      flatPlaylist: true,
      addHeader: ["referer:youtube.com", "user-agent:Mozilla/5.0"]
    });

    // Some single videos are returned as type "video", but playlists are type "playlist"
    if (info._type !== "playlist" || !info.entries) {
      return NextResponse.json({ error: "Not a valid playlist URL" }, { status: 400, headers: corsHeaders });
    }

    // Map the playlist entries
    const entries = info.entries
      .filter((entry: any) => entry.id && entry.title) // Filter out deleted videos
      .map((entry: any) => ({
        id: entry.id,
        title: entry.title,
        url: entry.url || `https://www.youtube.com/watch?v=${entry.id}`,
        thumbnail: entry.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
        duration: entry.duration || 0,
        uploader: entry.uploader || info.uploader || "Unknown Channel"
      }));

    const result = {
      id: info.id,
      title: info.title,
      uploader: info.uploader || "Unknown Channel",
      videoCount: entries.length,
      entries: entries,
    };

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist information. Ensure the URL is valid." },
      { status: 500, headers: corsHeaders }
    );
  }
}
