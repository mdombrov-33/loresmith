"use client";

import { usePathname } from "next/navigation";
import AppNavbar from "./AppNavbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showAppNavbar = pathname !== "/";

  return (
    <>
      {showAppNavbar && <AppNavbar />}
      {children}
    </>
  );
}
