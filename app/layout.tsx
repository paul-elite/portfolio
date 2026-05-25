import type { Metadata, Viewport } from "next";
import { Archivo, Gochi_Hand, Inter } from "next/font/google";
import { getSettings } from "@/lib/content-service";
import Analytics from "@/components/Analytics";
import SiteInteractionGuards from "@/components/SiteInteractionGuards";
import { PreferenceProvider } from "@/components/experience/PreferenceProvider";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const gochiHand = Gochi_Hand({
  variable: "--font-gochi-hand",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  const metadata: Metadata = {
    title: settings.name ? `${settings.name} - Portfolio` : "Portfolio",
    description: settings.title || "Personal portfolio",
  };

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
  themeColor: "#e1ebfa",
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
    <html lang="en" className={`${archivo.variable} ${gochiHand.variable} ${inter.variable} h-full antialiased`}>
      <body className="ignore-safe-edges min-h-full flex flex-col font-sans bg-background">
        <PreferenceProvider>
          <SiteInteractionGuards />
          {children}
          <Analytics />
        </PreferenceProvider>
      </body>
    </html>
  );
}
