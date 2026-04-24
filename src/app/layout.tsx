import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AuthInitializer from "@/components/Auth/AuthInitializer";

export const metadata: Metadata = {
  title: "Sufyra | Premium Attar & Perfume Oils",
  description: "Experience the essence of luxury with Sufyra's handcrafted attar and perfume oils.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-luxury-charcoal text-luxury-cream selection:bg-luxury-gold selection:text-luxury-charcoal`}
        suppressHydrationWarning
      >
        <AuthInitializer />
        <Navbar />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
