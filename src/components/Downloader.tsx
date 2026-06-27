"use client";

import { useState } from "react";
import { DownloadCloud, Loader2, ArrowRight, Video, ListVideo } from "lucide-react";
import VideoResult, { VideoInfo } from "./VideoResult";
import PlaylistResult, { PlaylistInfo } from "./PlaylistResult";

export default function Downloader() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"single" | "playlist">("single");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError("");
    setVideoInfo(null);
    setPlaylistInfo(null);

    const apiRoute = mode === "single" ? "/api/info" : "/api/playlist";

    try {
      const res = await fetch(apiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to fetch ${mode} information`);
      }

      if (mode === "single") {
        setVideoInfo(data);
      } else {
        setPlaylistInfo(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (formatId: string, ext: string) => {
    setIsDownloading(true);
    setError("");

    try {
      if (!url) {
        throw new Error("Video URL is missing.");
      }
      
      const downloadUrl = `/api/download?url=${encodeURIComponent(
        url
      )}&format=${formatId}&ext=${ext}`;
      
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = downloadUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to start download. Please try again.");
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center relative z-10">
      <div className="text-center space-y-6 mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 ring-1 ring-primary/20 backdrop-blur-sm">
          <DownloadCloud size={40} className="text-primary" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 drop-shadow-sm">
          Universal Downloader
        </h1>
        <p className="text-lg text-white/50 max-w-2xl mx-auto">
          Download high-quality videos from YouTube, Instagram, TikTok, Twitter, and thousands of other platforms instantly.
        </p>
      </div>

      <div className="w-full max-w-2xl flex justify-center mb-6">
        <div className="bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 flex">
          <button
            onClick={() => setMode("single")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              mode === "single" ? "bg-primary text-white shadow-lg" : "text-white/50 hover:text-white"
            }`}
          >
            <Video size={16} /> Single Video
          </button>
          <button
            onClick={() => setMode("playlist")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              mode === "playlist" ? "bg-primary text-white shadow-lg" : "text-white/50 hover:text-white"
            }`}
          >
            <ListVideo size={16} /> Playlist
          </button>
        </div>
      </div>

      <form onSubmit={fetchInfo} className="w-full max-w-2xl relative">
        <div className="relative flex items-center shadow-2xl shadow-primary/20 rounded-full">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={mode === "single" ? "Paste your video URL here..." : "Paste playlist URL here..."}
            className="w-full glass-input py-5 pl-6 pr-36 text-lg"
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url}
            className="absolute right-2 top-2 bottom-2 px-6 btn-primary flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Start <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-4 glass-panel border-red-500/20 bg-red-500/5 text-red-400 text-center text-sm rounded-2xl">
            {error}
          </div>
        )}
      </form>

      {mode === "single" && videoInfo && (
        <VideoResult
          info={videoInfo}
          onDownload={handleDownload}
          isDownloading={isDownloading}
        />
      )}

      {mode === "playlist" && playlistInfo && (
        <PlaylistResult playlist={playlistInfo} />
      )}
    </div>
  );
}
