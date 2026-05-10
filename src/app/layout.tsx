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
    default: "Pickyalo | Productos y platos para recoger",
    template: "%s | Pickyalo",
  },
  description:
    "Descubre productos y platos destacados de locales cercanos y recógelos de forma simple, visual y rápida.",
  icons: {
    icon: "/logo/Pickyalo_isotipo_Vanilla_APP.svg",
    shortcut: "/logo/Pickyalo_isotipo_Vanilla_APP.svg",
    apple: "/logo/Pickyalo_isotipo_Vanilla_APP.svg",
  },
  openGraph: {
    title: "Pickyalo | Productos y platos para recoger",
    description:
      "Descubre productos y platos destacados de locales cercanos y recógelos de forma simple, visual y rápida.",
    url: "/",
    siteName: "Pickyalo",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo/Pickyalo_Logo_Coral.svg",
        width: 1200,
        height: 630,
        alt: "Pickyalo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pickyalo | Productos y platos para recoger",
    description:
      "Descubre productos y platos destacados de locales cercanos y recógelos de forma simple, visual y rápida.",
    images: ["/logo/Pickyalo_Logo_Coral.svg"],
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
