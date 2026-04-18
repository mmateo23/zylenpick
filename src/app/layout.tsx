import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import { AnalyticsAttribution } from "@/components/analytics/analytics-attribution";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSiteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

import "./globals.css";
import { ThemeProvider } from "./theme-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "ZylenPick | Comida local para recoger",
    template: "%s | ZylenPick",
  },
  description:
    "Descubre comida local, explora locales cercanos y pide para recoger de forma simple, visual y rápida.",
  icons: {
    icon: "/logo/ZyelnpickLOGO_green.png",
    shortcut: "/logo/ZyelnpickLOGO_green.png",
    apple: "/logo/ZyelnpickLOGO_green.png",
  },
  openGraph: {
    title: "ZylenPick | Comida local para recoger",
    description:
      "Descubre comida local, explora locales cercanos y pide para recoger de forma simple, visual y rápida.",
    url: "/",
    siteName: "ZylenPick",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo/ZyelnpickLOGO_green.png",
        width: 1200,
        height: 630,
        alt: "ZylenPick",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZylenPick | Comida local para recoger",
    description:
      "Descubre comida local, explora locales cercanos y pide para recoger de forma simple, visual y rápida.",
    images: ["/logo/ZyelnpickLOGO_green.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn("font-sans", geistSans.variable)}
      suppressHydrationWarning
    >
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CVNZF0EVMY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CVNZF0EVMY');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AnalyticsAttribution />
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
