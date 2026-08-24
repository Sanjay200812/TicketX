import type { Metadata } from "next";
import { Inter, Space_Grotesk, Cinzel } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocationProvider } from "@/context/LocationContext";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { SupportChatbot } from "@/components/support/SupportChatbot";
import { CinematicIntro } from "@/components/shared/CinematicIntro";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-serif-heading", weight: ["400", "600", "700", "800", "900"] });

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
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${cinzel.variable} font-sans min-h-screen bg-background text-foreground flex flex-col`}>
        <ThemeProvider>
          <AuthProvider>
            <LocationProvider>
              <FavoritesProvider>
                <SidebarProvider>
                  <CinematicIntro />
                  <Navbar />
                  <MainLayout>
                    {children}
                  </MainLayout>
                  <SupportChatbot />
                  <Footer />
                </SidebarProvider>
              </FavoritesProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
