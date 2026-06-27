# Universal Video Downloader Pro ✨

A stunning, high-performance universal video downloader built with Next.js and `yt-dlp`. Download videos, audio, and complete playlists from YouTube, Instagram, TikTok, Twitter, and over 1,000 other platforms instantly!

## 🚀 Features

- **Universal Support**: Powered by the robust `yt-dlp` engine, allowing you to extract media from practically anywhere on the internet.
- **Playlist Downloader**: Paste a YouTube Playlist link to instantly generate a beautiful, virtualized list of videos. Click any video in the playlist to extract its direct download formats.
- **Dynamic Theme Engine**: A highly optimized HTML5 Canvas and CSS engine. Click the Magic Wand (✨) to switch between 11 gorgeous 60FPS animated backgrounds (Falling Hearts ❤️, Matrix Rain 🟩, Galaxy ✨, and more). Themes persist automatically via `localStorage`.
- **Portal-Inspired UI**: Built with glassmorphism, 50px pill-shaped buttons, soft neon glows, and the signature Apple/Portal `#007AFF` blue accent. 
- **Instagram CDN Filesize Fix**: Automatically bypasses Instagram's hidden metadata constraints by firing rapid `HTTP HEAD` requests directly to their CDN, ensuring you always know the exact file size before downloading.
- **Client-Side Rendering optimizations**: Implements `use client` correctly across all React components to prevent hydration mismatches and server-component bleeding.

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Lucide React (Icons).
- **Backend**: Next.js API Routes (`/api/info`, `/api/download`, `/api/playlist`).
- **Processing**: Child-process execution of `yt-dlp-exec`.

## 📦 Local Development

To run this project on your local machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GAJJUBHAIH/DOWNLODER-PRO.git
   cd DOWNLODER-PRO
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Deployment Requirements

This application relies on executing the `yt-dlp` binary on the server file system. Because of this:
- **You CANNOT deploy this to static hosting** like GitHub Pages, as they do not support backend API routes or server-side binary execution.
- **Serverless functions (like standard Vercel)** are not recommended for production unless you configure a high execution timeout limit (standard free tier limits out at 10 seconds, which will cancel large video downloads).
- **Recommended**: Deploy to a VPS, Render.com Web Service, or Railway.app where a persistent Node.js environment is available.

---
*DEVELOPED BY GAJJU | © 2026 ALL COPYRIGHTS RESERVED*