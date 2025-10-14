"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/navbar/theme-switcher";
import { LoginModal } from "@/components/navbar/login-modal";
import { RegisterModal } from "@/components/navbar/register-modal";
import { useAppStage } from "@/contexts/app-stage-context";
import { useAuth } from "@/contexts/auth-context";
import { Swords, LogOut } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { appStage } = useAppStage();
  const { user, isAuthenticated, logout } = useAuth();
  const showThemeSwitcher = appStage === "home";
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2">
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
                <span className="text-muted-foreground text-sm">
                  Welcome, {user?.username}
                </span>
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
