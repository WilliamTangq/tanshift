import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TanShift",
  description: "Mobile-first staff scheduling for small business teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}