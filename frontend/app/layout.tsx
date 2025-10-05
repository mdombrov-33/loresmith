import { Suspense } from "react";
import { ThemeProvider } from "./theme-provider";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import "./globals.css";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="bg-background min-h-screen" />}>
      <ThemeProvider>
        <Navbar />
        {children}
      </ThemeProvider>
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
      <body>
        <ThemeWrapper>
          {children}
          <Footer />
        </ThemeWrapper>
      </body>
    </html>
  );
}
