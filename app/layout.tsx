import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "AYG Motor Racing | Demo MVP",
  description: "Sistema integral para gestión de repuestos y taller de motos"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${poppins.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
