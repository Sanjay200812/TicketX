import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocationProvider } from "@/context/LocationContext";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "TicketX - Your Seat. Your Show.",
  description: "Premium real-time movie & event ticket booking platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans min-h-screen bg-background text-foreground flex flex-col`}>
        <LocationProvider>
          <AuthProvider>
            <FavoritesProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </FavoritesProvider>
          </AuthProvider>
        </LocationProvider>
      </body>
    </html>
  );
}
