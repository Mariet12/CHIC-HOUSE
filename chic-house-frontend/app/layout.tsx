import type { Metadata } from "next";
import { Inter, Poppins, Bubblegum_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({ 
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-brand",
});

const bubble = Bubblegum_Sans({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-bubble",
});

export const metadata: Metadata = {
  title: "Chic House - هدايا وديكور منزلي",
  description: "متجر Chic House للهدايا اليدوية وديكورات المنزل والمناسبات",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo/chic-house-logo.png.png",
  },
  openGraph: {
    title: "Chic House - هدايا وديكور منزلي",
    description: "متجر Chic House للهدايا اليدوية وديكورات المنزل والمناسبات",
    images: ["/logo/chic-house-logo.png.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.variable} ${poppins.variable} ${bubble.variable} font-sans`}>
        <AuthProvider>
          <CartProvider>
            <Header />
            {children}
            <Footer />
            <Toaster position="top-center" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
