import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSelector } from "@/components/ThemeSelector";
import { BackgroundEffects } from "@/components/BackgroundEffects";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Universal Video Downloader | by Gajju",
  description: "Download high-quality videos from YouTube, Instagram, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <BackgroundEffects />
          {children}
          <ThemeSelector />
          <footer className="mt-auto py-6 text-center text-sm text-white/50 border-t border-white/10 bg-black/20 backdrop-blur-md">
            <p className="font-semibold tracking-wider">
              DEVELOPED BY GAJJU <span className="mx-2">|</span> &copy; {new Date().getFullYear()} ALL COPYRIGHTS RESERVED
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
