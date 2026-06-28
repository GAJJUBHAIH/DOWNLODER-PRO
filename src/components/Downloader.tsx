"use client";

import React, { useState, useEffect } from "react";

const PLATFORMS = [
  { name: "YouTube", short: "YT", color: "#ff6b57", domains: ["youtube.com", "youtu.be", "youtube-nocookie.com"], note: "Owned uploads, licensed clips, and official exports." },
  { name: "Instagram", short: "IG", color: "#f4c542", domains: ["instagram.com"], note: "Creator content, saved originals, and account exports." },
  { name: "Facebook", short: "FB", color: "#00a6bf", domains: ["facebook.com", "fb.watch"], note: "Your uploads, public rights-cleared videos, and exports." },
  { name: "Snapchat", short: "SN", color: "#ffe85c", domains: ["snapchat.com"], note: "Memories, Spotlight originals, and approved shares." },
  { name: "TikTok", short: "TT", color: "#78b82a", domains: ["tiktok.com", "vm.tiktok.com"], note: "Creator downloads where the source permits saving." },
  { name: "X", short: "X", color: "#cfd8d2", domains: ["x.com", "twitter.com"], note: "Your posts, licensed clips, and direct media links." },
  { name: "Vimeo", short: "VI", color: "#88d6e7", domains: ["vimeo.com"], note: "Creator-enabled downloads and team libraries." },
  { name: "Reddit", short: "RD", color: "#ff8a4a", domains: ["reddit.com", "redd.it"], note: "Permissioned posts and direct hosted video files." },
  { name: "Twitch", short: "TW", color: "#a3e46b", domains: ["twitch.tv"], note: "Your clips, VOD exports, and channel assets." },
  { name: "LinkedIn", short: "IN", color: "#75cde0", domains: ["linkedin.com"], note: "Company assets, personal uploads, and approved media." },
  { name: "Threads", short: "TH", color: "#f2f2ef", domains: ["threads.net"], note: "Owned posts, saved originals, and approved embeds." },
  { name: "Direct file", short: "MP4", color: "#78b82a", domains: [], note: "Direct .mp4, .webm, .mov, .m4v, or .ogv URLs." }
];

const directVideoPattern = /\.(mp4|webm|mov|m4v|ogv)(?:[?#].*)?$/i;

function isDirectVideo(url: URL) {
  return directVideoPattern.test(url.pathname + url.search);
}

function getExtension(url: URL) {
  const match = url.pathname.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toUpperCase() : "";
}

function detectPlatform(url: URL) {
  const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
  const found = PLATFORMS.find((platform) =>
    platform.domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
  );
  if (found) return found;
  if (isDirectVideo(url)) return PLATFORMS.find((p) => p.name === "Direct file")!;
  return { name: "Web link", short: "WEB", color: "#00a6bf", domains: [], note: "General web URL." };
}

function parseUrl(value: string) {
  const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return { ok: true, url: new URL(withProtocol) };
  } catch {
    return { ok: false, url: null };
  }
}

const API_BASE = process.env.NODE_ENV === "development" ? "" : "https://downloder-pro.onrender.com";

export default function Downloader() {
  const [theme, setTheme] = useState("light");
  const [url, setUrl] = useState("");
  const [hasPermission, setHasPermission] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  
  const [status, setStatus] = useState<"Waiting" | "Ready" | "Review" | "Blocked" | "Loading">("Waiting");
  const [statusText, setStatusText] = useState("Waiting");
  const [result, setResult] = useState<any>({
    badge: "URL",
    title: "Ready for a link",
    text: "Paste a URL, confirm permission, and analyze it.",
    source: "None",
    format: "Unknown",
    size: "Not checked",
    mode: "Local page",
    downloadable: false,
    directUrl: "",
    thumbnail: null,
    formats: [],
    selectedFormatId: ""
  });

  const [queue, setQueue] = useState<any[]>([]);
  const [batchInput, setBatchInput] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("vsc-theme") || "light";
    setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme;
    
    try {
      const q = JSON.parse(localStorage.getItem("vsc-queue") || "[]");
      setQueue(q);
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("vsc-theme", next);
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message, visible: false }), 2600);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return showToast("Clipboard is empty.");
      setUrl(text.trim());
      // we don't automatically submit, let user click analyze
    } catch {
      showToast("Paste access is blocked in this browser.");
    }
  };

  const analyzeUrl = async (value: string) => {
    if (!value) return showToast("Paste a video URL first.");
    if (!hasPermission) {
      showToast("Confirm permission to continue.");
      return;
    }

    const parsed = parseUrl(value);
    if (!parsed.ok || !parsed.url) {
      setStatus("Blocked");
      setStatusText("Invalid");
      setResult({
        ...result,
        badge: "URL",
        title: "That link is not valid",
        text: "Check the address and try again.",
        source: "Invalid URL",
        mode: "Needs a valid link",
        downloadable: false
      });
      return;
    }

    const platform = detectPlatform(parsed.url);
    const direct = isDirectVideo(parsed.url);
    const parsedHref = parsed.url.href;

    if (direct) {
      setStatus("Ready");
      setStatusText("Ready");
      setResult({
        badge: platform.short,
        title: "Direct video file detected",
        text: "This browser can open the media URL as an original-file download.",
        source: platform.name,
        format: getExtension(parsed.url) || "Video",
        size: "Checking...",
        mode: "Browser download",
        downloadable: true,
        directUrl: parsedHref,
        formats: []
      });
    } else {
      setStatus("Loading");
      setStatusText("Fetching...");
      setResult({
        badge: platform.short,
        title: `Fetching from ${platform.name}...`,
        text: "Analyzing media streams through the backend API.",
        source: platform.name,
        format: "Checking...",
        size: "Checking...",
        mode: "API Extraction",
        downloadable: false,
        formats: []
      });

      try {
        const mode = parsedHref.includes("playlist") ? "playlist" : "single";
        const apiRoute = mode === "single" ? `${API_BASE}/api/info` : `${API_BASE}/api/playlist`;
        
        const res = await fetch(apiRoute, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: parsedHref })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch video information");
        }

        const formats = data.formats || [];
        setStatus("Ready");
        setStatusText("Ready");
        setResult({
          badge: platform.short,
          title: data.title || "Video found",
          text: data.uploader ? `Uploaded by ${data.uploader}` : "Media stream successfully extracted.",
          source: platform.name,
          format: formats.length > 0 ? "Multiple options" : "Video",
          size: "Available",
          mode: "API Download",
          downloadable: true,
          thumbnail: data.thumbnail,
          formats: formats,
          selectedFormatId: formats.length > 0 ? formats[0].format_id : "",
          directUrl: parsedHref
        });

      } catch (err: any) {
        setStatus("Blocked");
        setStatusText("Error");
        setResult({
          badge: "ERR",
          title: "Extraction failed",
          text: err.message || "An unknown error occurred while analyzing the URL.",
          source: platform.name,
          format: "Unknown",
          size: "Unknown",
          mode: "Failed",
          downloadable: false,
          formats: []
        });
      }
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    if (!result.downloadable) {
      e.preventDefault();
      return;
    }
    
    // If it's a direct url (e.g. .mp4), let the browser handle it
    if (result.formats.length === 0 && result.directUrl) {
      return; 
    }
    
    e.preventDefault();
    if (!result.selectedFormatId) return showToast("Select a format first");
    
    const downloadUrl = `${API_BASE}/api/download?url=${encodeURIComponent(result.directUrl)}&formatId=${encodeURIComponent(result.selectedFormatId)}`;
    
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = "video";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    showToast("Starting download...");
  };

  const getStatusDotClass = () => {
    if (status === "Ready") return "bg-[#78b82a]";
    if (status === "Blocked") return "bg-[#ff6b57]";
    return "bg-[#f4c542]"; // Waiting or Loading
  };

  return (
    <div className="app-shell">
      <header className="topbar" aria-label="Primary">
        <a className="brand" href="#download-tool" aria-label="Video Save Center home">
          <span className="brand-mark">V</span>
          <span>Video Save Center</span>
        </a>
        <nav className="top-actions" aria-label="Page controls">
          <a className="ghost-link" href="#platforms">Platforms</a>
          <button className="icon-button" onClick={toggleTheme} type="button" aria-label="Toggle theme">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v2m0 14v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M3 12h2m14 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
          </button>
        </nav>
      </header>

      <main>
        <section className="tool-hero" id="download-tool" aria-labelledby="pageTitle">
          <div className="hero-media" aria-hidden="true"></div>
          <div className="hero-content">
            <div className="hero-copy">
              <p className="eyebrow">YT, Instagram, Facebook, Snap, TikTok, X and more</p>
              <h1 id="pageTitle">Save permitted videos from one clean workspace.</h1>
              <p className="hero-subtitle">
                Direct media links can download in the browser. Platform links are checked and routed
                to a permission-friendly save flow via API extraction.
              </p>
            </div>

            <form className="download-form" onSubmit={(e) => { e.preventDefault(); analyzeUrl(url); }}>
              <label className="field-label" htmlFor="videoUrl">Video URL</label>
              <div className="url-row">
                <input
                  id="videoUrl"
                  name="videoUrl"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="Paste a video page or direct .mp4 link"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <button className="secondary-button" onClick={handlePaste} type="button">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="8" y="7" width="10" height="13" rx="2"></rect>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path>
                    <path d="M6 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1"></path>
                  </svg>
                  <span>Paste</span>
                </button>
                <button className="primary-button" type="submit" disabled={status === "Loading"}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    {status === "Loading" ? (
                       <path d="M12 4v2m0 12v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      <>
                        <path d="M21 21l-4.35-4.35"></path>
                        <circle cx="11" cy="11" r="7"></circle>
                      </>
                    )}
                  </svg>
                  <span>{status === "Loading" ? "Analyzing..." : "Analyze"}</span>
                </button>
              </div>
              <label className="permission" id="permissionText">
                <input 
                  id="permissionCheck" 
                  type="checkbox" 
                  checked={hasPermission} 
                  onChange={(e) => setHasPermission(e.target.checked)} 
                />
                <span>I own this video or have permission to save it.</span>
              </label>
              <div className="quick-platforms">
                {PLATFORMS.slice(0, 9).map(p => (
                  <span key={p.short} className="quick-chip">{p.name}</span>
                ))}
              </div>
            </form>
          </div>
        </section>

        <section className="workspace" aria-label="Download workspace">
          <section className="panel status-panel" aria-labelledby="statusTitle">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Status</p>
                <h2 id="statusTitle">Link inspector</h2>
              </div>
              <span className={`status-pill ${status.toLowerCase()}`}>
                <span className="w-[9px] h-[9px] rounded-full inline-block mr-2" style={{ backgroundColor: getStatusDotClass().replace('bg-[', '').replace(']', '') }}></span>
                {statusText}
              </span>
            </div>

            <div className="result-view">
              {result.thumbnail ? (
                <div className="w-[120px] h-[70px] rounded-lg overflow-hidden bg-black/10 flex-shrink-0 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.thumbnail} className="object-cover w-full h-full" alt="thumbnail" />
                </div>
              ) : (
                <div className="platform-badge">{result.badge}</div>
              )}
              
              <div style={{ minWidth: 0 }}>
                <h3 className="text-xl font-bold truncate max-w-full" title={result.title}>{result.title}</h3>
                <p className="mt-2 text-[var(--muted)] text-sm leading-relaxed">{result.text}</p>
                
                {result.formats.length > 0 && (
                  <div className="mt-4">
                    <select 
                      className="w-full p-2 border border-[var(--line)] rounded-md bg-[var(--surface)] text-[var(--ink)] text-sm"
                      value={result.selectedFormatId}
                      onChange={(e) => setResult({ ...result, selectedFormatId: e.target.value })}
                    >
                      {result.formats.map((fmt: any) => (
                        <option key={fmt.format_id} value={fmt.format_id}>
                          {fmt.resolution} {fmt.hasAudio ? "🔊" : "🔇"} {fmt.ext}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="action-bar">
              <a 
                className={`primary-button ${!result.downloadable ? "disabled" : ""}`} 
                href={result.formats.length === 0 && result.directUrl ? result.directUrl : "#"}
                download={result.formats.length === 0}
                onClick={handleDownload}
                aria-disabled={!result.downloadable}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v12"></path>
                  <path d="m7 10 5 5 5-5"></path>
                  <path d="M5 21h14"></path>
                </svg>
                <span>Download</span>
              </a>
              <button 
                className="secondary-button" 
                disabled={!result.directUrl}
                onClick={() => window.open(result.directUrl, "_blank", "noopener,noreferrer")}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 3h7v7"></path>
                  <path d="M10 14 21 3"></path>
                  <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"></path>
                </svg>
                <span>Open</span>
              </button>
              <button 
                className="secondary-button" 
                disabled={!result.directUrl}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(result.directUrl);
                    showToast("Link copied.");
                  } catch {
                    showToast("Copy failed.");
                  }
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                  <rect x="2" y="2" width="13" height="13" rx="2"></rect>
                </svg>
                <span>Copy</span>
              </button>
            </div>

            <dl className="metadata-grid">
              <div>
                <dt>Source</dt>
                <dd>{result.source}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{result.format}</dd>
              </div>
              <div>
                <dt>File size</dt>
                <dd>{result.size}</dd>
              </div>
              <div>
                <dt>Mode</dt>
                <dd>{result.mode}</dd>
              </div>
            </dl>
          </section>

          <section className="panel queue-panel" aria-labelledby="queueTitle">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Batch</p>
                <h2 id="queueTitle">Save queue</h2>
              </div>
              <button className="icon-button" onClick={() => { setQueue([]); localStorage.removeItem("vsc-queue"); }} type="button" aria-label="Clear queue">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 6h18"></path>
                  <path d="M8 6V4h8v2"></path>
                  <path d="m19 6-1 14H6L5 6"></path>
                  <path d="M10 11v5"></path>
                  <path d="M14 11v5"></path>
                </svg>
              </button>
            </div>

            <label className="field-label" htmlFor="batchInput">Batch links</label>
            <textarea
              id="batchInput"
              rows={5}
              placeholder="Add one URL per line"
              spellCheck="false"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
            ></textarea>

            <div className="batch-actions">
              <button className="secondary-button" type="button" onClick={() => {
                if (!hasPermission) return showToast("Confirm permission first.");
                const urls = batchInput.split(/\n+/).map(u => u.trim()).filter(Boolean);
                if (!urls.length) return showToast("Add at least one URL.");
                
                const newItems = urls.map(u => {
                  const p = detectPlatform(new URL(parseUrl(u).url?.href || "https://example.com"));
                  return {
                    id: Math.random().toString(),
                    url: u,
                    host: parseUrl(u).url?.hostname || "unknown",
                    platform: p.name,
                    short: p.short,
                    color: p.color,
                    direct: isDirectVideo(new URL(parseUrl(u).url?.href || "https://example.com")),
                    status: "Review"
                  };
                });
                
                const nextQ = [...newItems, ...queue].slice(0, 16);
                setQueue(nextQ);
                localStorage.setItem("vsc-queue", JSON.stringify(nextQ));
                setBatchInput("");
                showToast(`${urls.length} link(s) added.`);
              }}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14"></path>
                  <path d="M5 12h14"></path>
                </svg>
                <span>Add</span>
              </button>
            </div>

            <div className="queue-list" aria-live="polite">
              {queue.length === 0 ? (
                <div className="queue-empty">No links added yet.</div>
              ) : (
                queue.map(item => (
                  <article key={item.id} className="queue-item">
                    <span className="platform-token text-white flex items-center justify-center font-bold text-xs rounded-md w-9 h-9 flex-shrink-0" style={{ background: item.color }}>{item.short}</span>
                    <div className="min-w-0">
                      <p className="queue-title m-0 font-black text-sm truncate">{item.platform} <span className="muted-host font-bold text-[var(--muted)] text-xs ml-1">{item.host.replace(/^www\./, '')}</span></p>
                      <p className="queue-url m-0 text-xs text-[var(--muted)] truncate mt-1">{item.url}</p>
                    </div>
                    <span className={`queue-status ${item.direct ? "ready" : "review"} text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap`}>
                      {item.status}
                    </span>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>

        <section className="platform-section" id="platforms" aria-labelledby="platformTitle">
          <div className="section-head">
            <div>
              <p className="panel-kicker">Coverage</p>
              <h2 id="platformTitle">Popular sources</h2>
            </div>
          </div>
          <div className="platform-grid">
            {PLATFORMS.map(p => (
              <article key={p.short} className="platform-card flex flex-col items-start p-4 border border-[var(--line)] rounded-lg bg-[var(--surface)]">
                <header className="flex items-center gap-2 mb-3">
                  <span className="platform-token text-white flex items-center justify-center font-bold text-xs rounded-md w-8 h-8" style={{ background: p.color }}>{p.short}</span>
                  <h3 className="m-0 text-base font-bold">{p.name}</h3>
                </header>
                <p className="m-0 text-sm text-[var(--muted)] leading-relaxed">{p.note}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>Built for lawful downloads.</span>
        <span>No private scraping, sign-in bypass, DRM removal, or protected-content extraction.</span>
      </footer>

      <div className={`toast ${toast.visible ? "visible" : ""}`} role="status" aria-live="polite">
        {toast.message}
      </div>
    </div>
  );
}
