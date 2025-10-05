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
      <body className="flex min-h-screen flex-col">
        <ThemeWrapper>
          <div className="flex-1">{children}</div>
          <Footer />
        </ThemeWrapper>
      </body>
    </html>
  );
}
