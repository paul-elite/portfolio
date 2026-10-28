import type { Metadata, Viewport } from "next";
import { getSettings } from "@/lib/content-service";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  const metadata: Metadata = {
    title: settings.name ? `${settings.name} - Portfolio` : "Portfolio",
    description: settings.title || "Personal portfolio",
  };

  if (settings.faviconImage) {
    metadata.icons = {
      icon: settings.faviconImage,
      shortcut: settings.faviconImage,
      apple: settings.faviconImage,
    };
  }

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
