import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BOOT_SCRIPT } from "@/lib/os";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "Muhammed Hidash — Startup Builder & Software Engineer";
const siteDescription =
  "Startup builder. Tech by craft, business by curiosity. Engineer at heart, product builder by choice. CTO at Dentobees.";

export const metadata: Metadata = {
  metadataBase: new URL("https://hidash.in"),
  title: { default: siteTitle, template: "%s — Muhammed Hidash" },
  description: siteDescription,
  keywords: [
    "Muhammed Hidash", "startup builder", "software engineer", "CTO", "Dentobees",
    "product engineering", "systems architecture", "applied AI", "SaaS",
  ],
  authors: [{ name: "Muhammed Hidash", url: "https://hidash.in" }],
  creator: "Muhammed Hidash",
  alternates: { canonical: "/" },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "Muhammed Hidash",
    type: "website",
    images: ["/my-photo.png"],
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, images: ["/my-photo.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
