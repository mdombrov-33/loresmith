"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const themeFromQuery = searchParams.get("theme");
    const defaultTheme = "fantasy";

    //* If no theme in query, set default
    if (!themeFromQuery) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("theme", defaultTheme);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [mounted, searchParams, router, pathname]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="fantasy"
      themes={[
        "fantasy",
        "norse",
        "cyberpunk",
        "post-apocalyptic",
        "steampunk",
      ]}
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
