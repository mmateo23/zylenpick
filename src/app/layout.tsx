import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { AnalyticsAttribution } from "@/components/analytics/analytics-attribution";
import { GoogleAnalyticsConsent } from "@/components/analytics/google-analytics-consent";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { CookieConsentBanner } from "@/components/cookies/cookie-consent-banner";
import { LocationDiscoveryPrompt } from "@/components/location/location-discovery-prompt";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { PickyaloToaster } from "@/components/ui/pickyalo-toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSiteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

import "./globals.css";
import "sileo/styles.css";
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

const clashGroteskBold = localFont({
  src: "./fonts/ClashGrotesk-Bold.woff2",
  variable: "--font-clash-grotesk-bold",
  weight: "700",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: "Pickyalo",
  manifest: "/manifest.webmanifest",
  title: {
    default: "Pickyalo | Productos y platos para recoger",
    template: "%s | Pickyalo",
  },
  description:
    "Descubre productos y platos destacados de locales cercanos y recógelos de forma simple, visual y rápida.",
  icons: {
    icon: [
      { url: "/icons/pickyalo-app.svg", type: "image/svg+xml" },
      {
        url: "/icons/pickyalo-favicon-32.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    shortcut: "/icons/pickyalo-favicon-32.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Pickyalo",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
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
        url: "/icons/pickyalo-icon-512.png",
        width: 512,
        height: 512,
        alt: "Logo de la app Pickyalo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Pickyalo | Productos y platos para recoger",
    description:
      "Descubre productos y platos destacados de locales cercanos y recógelos de forma simple, visual y rápida.",
    images: ["/icons/pickyalo-icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#741314",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn("font-sans", geistSans.variable, clashGroteskBold.variable)}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${clashGroteskBold.variable} antialiased`}
      >
        <ThemeProvider>
          <ServiceWorkerRegister />
          <GoogleAnalyticsConsent />
          <PostHogProvider>
            <AnalyticsAttribution />
            <TooltipProvider>
              {children}
              <LocationDiscoveryPrompt />
              <InstallPrompt />
              <PickyaloToaster />
              <CookieConsentBanner />
            </TooltipProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

