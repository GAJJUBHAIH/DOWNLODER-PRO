import { Download, Film, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface Format {
  format_id: string;
  ext: string;
  resolution: string;
  filesize?: number;
  format_note?: string;
  hasAudio: boolean;
  hasVideo: boolean;
  url: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  formats: Format[];
}

interface VideoResultProps {
  info: VideoInfo;
  onDownload: (formatId: string, ext: string) => void;
  isDownloading: boolean;
  embedded?: boolean;
}

export default function VideoResult({ info, onDownload, isDownloading, embedded = false }: VideoResultProps) {
  // Filter and sort formats
  const videoFormats = info.formats
    .filter((f) => f.hasVideo && f.hasAudio && f.resolution !== "audio only")
    .sort((a, b) => {
      const resA = parseInt(a.resolution.split("x")[1] || "0");
      const resB = parseInt(b.resolution.split("x")[1] || "0");
      return resB - resA;
    });

  const audioFormats = info.formats
    .filter((f) => f.hasAudio && !f.hasVideo)
    .sort((a, b) => (b.filesize || 0) - (a.filesize || 0));

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m > 9 ? m : h ? "0" + m : m || "0", s > 9 ? s : "0" + s].filter(Boolean).join(":");
  };

  return (
    <div className={cn(
      "w-full mx-auto",
      embedded ? "" : "glass-panel p-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl"
    )}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/5 shrink-0 relative rounded-xl overflow-hidden aspect-video shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={info.thumbnail}
            alt={info.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium backdrop-blur-md">
            {formatDuration(info.duration)}
          </div>
        </div>

        <div className="w-full flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold line-clamp-2 text-white/90">
              {info.title}
            </h2>
            <p className="text-sm text-white/50 mt-2">{info.uploader}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {videoFormats.length > 0 && (
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4 text-white/80">
              <Film size={18} className="text-primary" /> Video Download Options
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {videoFormats.slice(0, 6).map((format) => (
                <button
                  key={format.format_id}
                  onClick={() => onDownload(format.format_id, format.ext)}
                  disabled={isDownloading}
                  className="glass-panel hover:bg-white/10 p-3 flex flex-col items-center justify-center gap-1 transition-all group disabled:opacity-50"
                >
                  <span className="font-semibold text-white group-hover:text-primary transition-colors">
                    {format.resolution.split("x")[1] || format.resolution}p
                  </span>
                  <span className="text-xs text-white/50 uppercase">
                    {format.ext} • {formatBytes(format.filesize)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {audioFormats.length > 0 && (
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4 text-white/80">
              <Music size={18} className="text-primary" /> Audio Only Options
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {audioFormats.slice(0, 3).map((format) => (
                <button
                  key={format.format_id}
                  onClick={() => onDownload(format.format_id, format.ext)}
                  disabled={isDownloading}
                  className="glass-panel hover:bg-white/10 p-3 flex flex-col items-center justify-center gap-1 transition-all group disabled:opacity-50"
                >
                  <span className="font-semibold text-white group-hover:text-primary transition-colors">
                    Audio ({format.format_note || format.ext})
                  </span>
                  <span className="text-xs text-white/50 uppercase">
                    {format.ext} • {formatBytes(format.filesize)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
