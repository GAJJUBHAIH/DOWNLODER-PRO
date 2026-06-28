import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Save Center",
  description: "A permission-aware video save website for direct video links and platform export workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
