import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { RouteProgress } from "@/components/app/route-progress";
import { browserThemeColor } from "@/lib/brand";
import { cx } from "@/lib/cx";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: browserThemeColor,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "GLITCH",
  description: "Your mistake becomes the boss.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "GLITCH" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cx(jakarta.variable, jetbrains.variable)}>
      <body>
        <RouteProgress />
        {children}
      </body>
    </html>
  );
}
