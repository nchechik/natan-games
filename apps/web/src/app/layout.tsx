import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Natan Games",
  description: "A growing collection of playable web games — start with Sunny Acre Farm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} ${nunito.variable}`}>{children}</body>
    </html>
  );
}
