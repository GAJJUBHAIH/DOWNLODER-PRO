"use client";

import { useState } from "react";
import { ListVideo, ChevronDown, DownloadCloud, Loader2 } from "lucide-react";
import VideoResult, { VideoInfo } from "./VideoResult";

export interface PlaylistEntry {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: number;
  uploader: string;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  uploader: string;
  videoCount: number;
  entries: PlaylistEntry[];
}

interface PlaylistResultProps {
  playlist: PlaylistInfo;
}

export default function PlaylistResult({ playlist }: PlaylistResultProps) {
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [videoInfoData, setVideoInfoData] = useState<Record<string, VideoInfo>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchVideoInfo = async (entry: PlaylistEntry) => {
    if (expandedVideoId === entry.id) {
      setExpandedVideoId(null);
      return;
    }

    setExpandedVideoId(entry.id);

    if (videoInfoData[entry.id]) return; // Already loaded

    setLoadingMap((prev) => ({ ...prev, [entry.id]: true }));
    try {
      const API_BASE = process.env.NODE_ENV === "development" ? "" : "https://downloder-pro.onrender.com";
      const res = await fetch(`${API_BASE}/api/info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: entry.url }),
      });
      const data = await res.json();
      if (res.ok) {
        setVideoInfoData((prev) => ({ ...prev, [entry.id]: data }));
      }
    } catch (e) {
      console.error("Failed to load formats", e);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [entry.id]: false }));
    }
  };

  const handleDownload = async (url: string, formatId: string, ext: string) => {
    setIsDownloading(true);
    try {
      const API_BASE = process.env.NODE_ENV === "development" ? "" : "https://downloder-pro.onrender.com";
      const downloadUrl = `${API_BASE}/api/download?url=${encodeURIComponent(url)}&format=${formatId}&ext=${ext}`;
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = downloadUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m > 9 ? m : h ? "0" + m : m || "0", s > 9 ? s : "0" + s].filter(Boolean).join(":");
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ListVideo className="text-primary" size={28} />
            {playlist.title}
          </h2>
          <p className="text-white/60 mt-1">{playlist.uploader} • {playlist.videoCount} videos</p>
        </div>
        <button className="btn-primary px-6 py-3" disabled>
          Download All (Coming Soon)
        </button>
      </div>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {playlist.entries.map((entry, index) => (
          <div key={entry.id} className="glass-panel p-4 flex flex-col gap-4 transition-all hover:bg-white/[0.07]">
            <div 
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => fetchVideoInfo(entry)}
            >
              <div className="font-mono text-white/40 w-6 text-center">{index + 1}</div>
              <div className="w-32 h-20 shrink-0 relative rounded-lg overflow-hidden bg-black/50">
                <img src={entry.thumbnail} alt={entry.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {formatDuration(entry.duration)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white/90 truncate">{entry.title}</h3>
                <p className="text-sm text-white/50 truncate">{entry.uploader}</p>
              </div>
              <div className="px-4 text-white/40">
                {loadingMap[entry.id] ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <ChevronDown size={24} className={`transition-transform ${expandedVideoId === entry.id ? "rotate-180 text-primary" : ""}`} />
                )}
              </div>
            </div>

            {expandedVideoId === entry.id && (
              <div className="pt-4 border-t border-white/10 animate-in slide-in-from-top-2">
                {videoInfoData[entry.id] ? (
                  <VideoResult 
                    info={videoInfoData[entry.id]} 
                    onDownload={(fId, ext) => handleDownload(entry.url, fId, ext)} 
                    isDownloading={isDownloading} 
                    embedded 
                  />
                ) : (
                  <div className="text-center py-8 text-white/50 text-sm">
                    {loadingMap[entry.id] ? "Loading quality options..." : "Failed to load formats"}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
