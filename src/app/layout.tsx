import type { Metadata } from "next";
import localFont from "next/font/local";
import { ParallaxScroll } from "@/components/ParallaxScroll";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const cubic = localFont({
  src: "./fonts/Cubic_11.woff2",
  variable: "--font-cubic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ALL FIGHT｜我家擂臺選手名鑑",
  description: "家裡的每一樣東西都是擂臺選手。認識他們的數值、必殺技與故事。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${cubic.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <ParallaxScroll />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
