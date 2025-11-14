import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Max Hack",
  description: "Next.js application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
