"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Globe,
  CreditCard,
  Sparkles,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Logo from "@/components/shared/Logo";
import { PrimaryButton } from "@/components/shared/buttons";
import { cn } from "@/lib/utils";
import { AudioToggle } from "@/components/navbar/AudioToggle";
import { Button } from "@/components/ui/button";

export default function AppNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  //* Hide Create button on these pages
  const hideCreateButton =
    pathname?.startsWith("/generate") ||
    pathname?.startsWith("/select-theme") ||
    pathname?.startsWith("/adventure/");

  //* Show Audio Toggle only on these pages
  const showAudioToggle =
    pathname?.startsWith("/generate") ||
    pathname?.startsWith("/select-theme") ||
    pathname?.startsWith("/adventure/") ||
    pathname?.startsWith("/worlds/");

  const navLinks = [
    {
      title: "My Worlds",
      icon: Home,
      href: "/my-worlds",
    },
    {
      title: "Discover",
      icon: Globe,
      href: "/discover",
    },
    {
      title: "Plans",
      icon: CreditCard,
      href: "/plans",
    },
  ];

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-6">
          <Link href="/my-worlds" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Create + Audio + Notifications + User + Mobile Menu */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Create Button - Always visible, compact on mobile */}
          {!hideCreateButton && (
            <Link href="/select-theme?theme=fantasy">
              <PrimaryButton className="px-3 py-2 sm:px-4">
                <Sparkles className="h-4 w-4 sm:mr-2" />
                <span className="hidden text-sm font-medium sm:inline">Create</span>
              </PrimaryButton>
            </Link>
          )}

          {/* Audio Toggle */}
          {showAudioToggle && <AudioToggle />}

          {/* Notifications - Hidden on mobile */}
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <Bell className="h-5 w-5" />
          </Button>

          {/* Clerk User Button */}
          <UserButton />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container mx-auto flex flex-col px-4 py-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
