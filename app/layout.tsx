import type { Metadata, Viewport } from "next";
import { Archivo, Gochi_Hand } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio",
};

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
    <html lang="en" className={`${archivo.variable} ${gochiHand.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
