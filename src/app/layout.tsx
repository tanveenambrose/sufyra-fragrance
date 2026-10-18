import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"));
const AuthInitializer = dynamic(() => import("@/components/Auth/AuthInitializer"));

export const metadata: Metadata = {
  title: "Sufyra | Premium Attar & Perfume Oils",
  description: "Experience the essence of luxury with Sufyra's handcrafted attar and perfume oils.",
  icons: {
    icon: [
      { url: "/logo-dark.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/logo-dark.png",
    apple: "/logo-dark.png",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/logo-dark.png" />
        <link rel="shortcut icon" type="image/png" href="/logo-dark.png" />
        <link rel="apple-touch-icon" type="image/png" href="/logo-dark.png" />
      </head>
      <body
        className={`${playfair.variable} ${montserrat.variable} antialiased selection:bg-luxury-gold selection:text-luxury-charcoal transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >

          <AuthInitializer />
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

