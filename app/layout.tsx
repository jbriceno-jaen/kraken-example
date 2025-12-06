import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kraken Elite Fitness",
  description: "CrossFit training with expert coaching and community energy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: "#0b0b0f",
          colorText: "#f8fafc",
          colorPrimary: "#ef4444",
          colorInputBackground: "#111827",
          colorInputText: "#f8fafc",
          colorNeutral: "#1f2937",
          colorDanger: "#ef4444",
          colorSuccess: "#22c55e",
          colorWarning: "#f59e0b",
          colorShimmer: "rgba(255, 255, 255, 0.1)",
          colorTextSecondary: "#f8fafc",
          colorTextOnPrimaryBackground: "#ffffff",
        },
        elements: {
          userButtonPopoverCard: {
            backgroundColor: "#1f2937",
          },
          userButtonPopoverActionButton: {
            color: "#f8fafc",
            "&:hover": {
              backgroundColor: "#374151",
            },
          },
          userButtonPopoverActionButtonText: {
            color: "#f8fafc",
          },
          userButtonPopoverActionButtonIcon: {
            color: "#f8fafc",
          },
        },
        layout: {
          socialButtonsPlacement: "bottom",
          shimmer: true,
        },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
