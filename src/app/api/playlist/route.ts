import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const binaryPath = path.join(process.cwd(), "node_modules", "yt-dlp-exec", "bin", "yt-dlp.exe");
    
    if (!fs.existsSync(binaryPath)) {
      throw new Error(`yt-dlp binary not found at ${binaryPath}`);
    }

    // Fetch playlist info using local yt-dlp binary
    // --flat-playlist ensures we don't fetch heavy format lists for every video
    const { stdout } = await execAsync(
      `"${binaryPath}" --dump-single-json --no-warnings --flat-playlist --add-header "referer:youtube.com" --add-header "user-agent:Mozilla/5.0" "${url}"`,
      { maxBuffer: 20 * 1024 * 1024 } // 20MB limit
    );
    
    const info = JSON.parse(stdout);

    // Some single videos are returned as type "video", but playlists are type "playlist"
    if (info._type !== "playlist" || !info.entries) {
      return NextResponse.json({ error: "Not a valid playlist URL" }, { status: 400 });
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

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist information. Ensure the URL is valid." },
      { status: 500 }
    );
  }
}
