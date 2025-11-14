import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Спутник",
  description: "Спутник - современное веб-приложение",
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
