"use client";

import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/navbar/theme-switcher";
import { LoginModal } from "@/components/navbar/login-modal";
import { RegisterModal } from "@/components/navbar/register-modal";
import { useAppStore } from "@/stores/appStore";
import { useSession, signOut } from "next-auth/react";
import { Swords, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Navbar() {
  const {
    user,
    token,
    logout,
    appStage,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    theme,
  } = useAppStore();
  const { data: session } = useSession();
  const isAuthenticated = !!session || (!!user && !!token);
  const showThemeSwitcher = appStage === "home";

  useEffect(() => {
    if (session?.token && session?.backendUser) {
      useAppStore.getState().login(session.token, session.backendUser);
    }
  }, [session]);

  const handleLogout = () => {
    if (session) {
      signOut();
    } else {
      logout();
    }
  };

  return (
    <>
      <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          {/* Logo Section */}
          <Link href={`/?theme=${theme}`} className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xl font-bold">
              <span className="text-primary">
                <Swords />
              </span>
              <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                LoreSmith
              </span>
            </div>
          </Link>

          {/* Center - Theme Switcher (Desktop) */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            {showThemeSwitcher && <ThemeSwitcher />}
          </div>

          {/* Right Section - Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/search">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Login
                </Button>
                <Button onClick={() => setIsRegisterModalOpen(true)}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Theme Switcher */}
        {showThemeSwitcher && (
          <div className="bg-background/95 border-t px-4 py-3 md:hidden">
            <ThemeSwitcher />
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </>
  );
}
