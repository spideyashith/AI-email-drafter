import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoPilot — AI Job Application Assistant",
  description: "AI-powered job application co-pilot for software engineers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
