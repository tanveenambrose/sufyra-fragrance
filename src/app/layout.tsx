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
      { url: "/Sufyra - WHITE.svg", type: "image/svg+xml" },
    ],
    shortcut: "/Sufyra - WHITE.svg",
    apple: "/Sufyra - WHITE.svg",
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
        <link rel="icon" type="image/svg+xml" href="/Sufyra - WHITE.svg" />
        <link rel="shortcut icon" href="/Sufyra - WHITE.svg" />
        <link rel="apple-touch-icon" href="/Sufyra - WHITE.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var clean = function(el) {
                    if (el && el.removeAttribute) {
                      if (el.hasAttribute('bis_skin_checked')) el.removeAttribute('bis_skin_checked');
                      if (el.hasAttribute('bis_size')) el.removeAttribute('bis_size');
                    }
                  };
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes') {
                        if (m.attributeName === 'bis_skin_checked' || m.attributeName === 'bis_size') {
                          m.target.removeAttribute(m.attributeName);
                        }
                      } else if (m.type === 'childList') {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          var node = m.addedNodes[j];
                          if (node.nodeType === 1) {
                            clean(node);
                            if (node.querySelectorAll) {
                              var items = node.querySelectorAll('[bis_skin_checked], [bis_size]');
                              for (var k = 0; k < items.length; k++) {
                                clean(items[k]);
                              }
                            }
                          }
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['bis_skin_checked', 'bis_size']
                  });
                } catch (e) {}
              })();
            `,
          }}
        />
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

