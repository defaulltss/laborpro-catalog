import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { isAdminSession } from "@/lib/auth";
import AdminFloatingLink from "./AdminFloatingLink";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Labor Pro Katalogs",
  description: "Labor Pro profesionālo skaistumkopšanas produktu katalogs",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = await isAdminSession();

  return (
    <html lang="lv">
      <body className={`${inter.className} antialiased`}>
        {children}
        {isAdmin && <AdminFloatingLink />}
      </body>
    </html>
  );
}
