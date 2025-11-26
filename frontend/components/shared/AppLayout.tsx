"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import AppNavbar from "./AppNavbar";
import { getCurrentUser } from "@/lib/api/auth";
import { useAppStore } from "@/stores/appStore";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, login } = useAppStore();

  const showAppNavbar = pathname !== "/";

  //* Fetch current user on mount if not already logged in
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) {
        const data = await getCurrentUser();
        if (data?.user) {
          login(data.user);
        }
      }
    };

    fetchUser();
  }, [user, login]);

  return (
    <>
      {showAppNavbar && <AppNavbar />}
      {children}
    </>
  );
}
