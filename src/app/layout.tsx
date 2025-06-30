import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pong Arena",
  description: "Web-based Pong game with AI and Multiplayer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Apply global responsive styles to the body element */}
      <body
        className={`${inter.variable} font-inter bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12`}
      >
        {children}
      </body>
    </html>
  );
}
