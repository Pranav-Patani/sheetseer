import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Data Alchemist",
  description: 'Data was a mess, "was" because now we are here ;)',
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
