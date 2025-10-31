import { Suspense } from "react";
import { Providers } from "./providers";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { Toaster } from "@/components/ui/sonner";
import {
  Cinzel,
  Inter,
  JetBrains_Mono,
  Oswald,
  Fjalla_One,
} from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const fjallaOne = Fjalla_One({
  subsets: ["latin"],
  variable: "--font-fjalla-one",
  display: "swap",
  weight: "400",
});

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="bg-background min-h-screen" />}>
      <Providers>
        <Navbar />
        {children}
      </Providers>
    </Suspense>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`flex min-h-screen flex-col ${fjallaOne.variable} ${oswald.variable} ${inter.variable} ${cinzel.variable} ${jetbrainsMono.variable}`}
      >
        <ThemeWrapper>
          <div className="flex-1">{children}</div>
          <Footer />
        </ThemeWrapper>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
