"use client";

import { ThemeSwitcher } from "@/components/navbar/ThemeSwitcher";
import { LoginModal } from "@/components/navbar/LoginModal";
import { RegisterModal } from "@/components/navbar/RegisterModal";
import { AudioToggle } from "@/components/navbar/AudioToggle";
import { UserMenu } from "@/components/navbar/UserMenu";
import { MobileNav } from "@/components/navbar/MobileNav";
import { useAppStore } from "@/stores/appStore";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import Logo from "@/components/shared/Logo";
import ActionButton from "@/components/shared/ActionButton";

export default function Navbar() {
  const {
    user,
    token,
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

  return (
    <>
      <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          {/* Left - Mobile Menu + Logo */}
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href={`/?theme=${theme}`} className="flex items-center gap-2">
              <Logo size="sm" />
            </Link>
          </div>

          {/* Center - Theme Switcher (Desktop only) */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            {showThemeSwitcher && <ThemeSwitcher variant="desktop" />}
          </div>

          {/* Right - Audio + Auth */}
          <div className="flex items-center gap-2">
            <AudioToggle />
            {isAuthenticated ? (
              <div className="hidden md:flex">
                <UserMenu />
              </div>
            ) : (
              <div className="hidden gap-2 sm:flex">
                <ActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Login
                </ActionButton>
                <ActionButton size="sm" onClick={() => setIsRegisterModalOpen(true)}>
                  Sign Up
                </ActionButton>
              </div>
            )}
          </div>
        </div>
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
