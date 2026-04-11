import type { Metadata, Viewport } from "next";
import { Archivo, Gochi_Hand, Inter } from "next/font/google";
import { supabase, defaultSettings } from "@/lib/supabase";
import Analytics from "@/components/Analytics";
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

async function getSettings() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error || !data) {
      return defaultSettings;
    }
    return { ...defaultSettings, ...data };
  } catch {
    return defaultSettings;
  }
}

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
      <body className="min-h-full flex flex-col font-sans bg-background">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
