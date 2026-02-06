import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PolygonBackground from "@/components/PolygonBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MechGuide - AI Repair Co-Pilot",
  description: "Real-time AR diagnostics, voice guidance, and smart repair checklists powered by Gemini 3 Live API. Identification of machinery issues with step-by-step 3D-aware instructions.",
  applicationName: "MechGuide",
  authors: [{ name: "Divyanshu Patel", url: "https://divyanshupatel.com" }],
  keywords: ["AI Repair", "Augmented Reality", "Gemini 3", "Hackathon", "Machinery Diagnostics", "Voice Assistant", "Next.js"],
  creator: "Divyanshu Patel",
  publisher: "Divyanshu Patel",
  metadataBase: new URL("https://divyanshupatel.com/mech-guide-gemini-3"),
  openGraph: {
    title: "MechGuide - AI Repair Co-Pilot",
    description: "Point your camera at any machine. Get instant AI diagnostics, AR overlays, and voice-guided repair steps.",
    url: "https://divyanshupatel.com/mech-guide-gemini-3",
    siteName: "MechGuide",
    images: [
      {
        url: "/screenshots/landing-page.png",
        width: 1200,
        height: 630,
        alt: "MechGuide Landing Page",
      },
      {
        url: "/screenshots/repair-session.png",
        width: 1200,
        height: 630,
        alt: "MechGuide Repair Interface",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MechGuide - Your AI Repair Co-Pilot",
    description: "AR-powered repair assistant built with Gemini 3. Diagnose and fix machinery with confidence.",
    creator: "@divyanshupatel", // Replace if you have a specific handle
    images: ["/screenshots/landing-page.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zooming for accessibility
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PolygonBackground />
        {children}
      </body>
    </html>
  );
}
