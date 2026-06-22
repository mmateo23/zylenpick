import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { AnalyticsAttribution } from "@/components/analytics/analytics-attribution";
import { GoogleAnalyticsConsent } from "@/components/analytics/google-analytics-consent";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { CookieConsentBanner } from "@/components/cookies/cookie-consent-banner";
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
    icon: "/logo/Pickyalo_isotipo_Vanilla_APP.svg",
    shortcut: "/logo/Pickyalo_isotipo_Vanilla_APP.svg",
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

export const viewport: Viewport = {
  themeColor: "#381932",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ServiceWorkerRegister />
          <GoogleAnalyticsConsent />
          <PostHogProvider>
            <AnalyticsAttribution />
            <TooltipProvider>
              {children}
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

