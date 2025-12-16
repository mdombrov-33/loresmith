import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Providers } from "./providers";
import AppLayout from "@/components/shared/AppLayout";
import Footer from "@/components/footer/Footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthTokenProvider } from "@/components/providers/AuthTokenProvider";
import { UserSyncProvider } from "@/components/providers/UserSyncProvider";
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
      <AuthTokenProvider>
        <UserSyncProvider>
          <Providers>
            <AppLayout>{children}</AppLayout>
          </Providers>
        </UserSyncProvider>
      </AuthTokenProvider>
    </Suspense>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#4DBFD9",
          borderRadius: "0.5rem",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`min-h-screen ${fjallaOne.variable} ${oswald.variable} ${inter.variable} ${cinzel.variable} ${jetbrainsMono.variable}`}
        >
          <ThemeWrapper>
            {children}
            <Footer />
          </ThemeWrapper>
          <Toaster theme="dark" />
        </body>
      </html>
    </ClerkProvider>
  );
}
