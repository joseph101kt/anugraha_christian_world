import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import Logo from "@/components/logo";

export const metadata: Metadata = {
  title: "Anugraha Christian World",
  description: "Christian article store",
  icons: {
    icon: "/images/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <html lang="en">
        <body className="min-h-screen bg-base-100 text-base-content flex flex-col">
          <Navbar />
          <ThemeToggle />
          <WhatsAppFAB />

          <main className="flex-1">
            {children}
          </main>
          
          <Footer />
          
        </body>
      </html>
    </Suspense>
  );
}