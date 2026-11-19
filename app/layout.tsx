import type { Metadata, Viewport } from "next";
import { getSettings } from "@/lib/content-service";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  const metadata: Metadata = {
    title: settings.name ? `${settings.name} - Portfolio` : "Portfolio",
    description: settings.title || "Personal portfolio",
  };

  // The portrait by default (public/icon.png, favicon.ico, apple-icon.png); a project page swaps in its own icon
  metadata.icons = settings.faviconImage
    ? { icon: settings.faviconImage, shortcut: settings.faviconImage, apple: settings.faviconImage }
    : { icon: '/icon.png', shortcut: '/favicon.ico', apple: '/apple-icon.png' };

  if (settings.metaImage) {
    metadata.openGraph = {
      images: [settings.metaImage],
    };
    metadata.twitter = {
      card: "summary_large_image",
      images: [settings.metaImage],
    };
  }

  return metadata;
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
