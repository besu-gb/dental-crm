// src/app/layout.tsx
// Root layout — wraps everything with ClerkProvider for auth
// Compatible with @clerk/nextjs v6 + Next.js 15

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dental CRM",
  description: "Dashboard for managing dental clinic operations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
