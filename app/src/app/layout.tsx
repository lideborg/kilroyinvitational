import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Kilroy Invitational",
  description: "Birdies are rare, beers are not. Est. 2026",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0C0A1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full font-[family-name:var(--font-inter)]">
        <main className="pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
