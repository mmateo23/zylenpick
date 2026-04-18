import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import { TooltipProvider } from "@/components/ui/tooltip";
import { getSiteUrl } from "@/lib/seo";

import "./globals.css";
import { cn } from "@/lib/utils";

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
    icon: "/logo/ZylenPick_LOGO.svg?v=2",
    shortcut: "/logo/ZylenPick_LOGO.svg?v=2",
    apple: "/logo/ZylenPick_LOGO.png?v=1",
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
        url: "/logo/ZylenPick_LOGO.png?v=1",
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
    images: ["/logo/ZylenPick_LOGO.png?v=1"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", geistSans.variable)}>
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
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
