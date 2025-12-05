"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Globe,
  CreditCard,
  User,
  Sparkles,
  Bell,
  LogOut,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { PrimaryButton } from "@/components/shared/buttons";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/appStore";
import { AudioToggle } from "@/components/navbar/AudioToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAppStore();

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

  const handleLogout = async () => {
    //* Clear backend cookie
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    //* Clear zustand state
    logout();
    router.push("/");
  };

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

        {/* Right: Create + Audio + Notifications + User */}
        <div className="flex items-center gap-4">
          {/* Create Button */}
          {!hideCreateButton && (
            <Link href="/select-theme">
              <PrimaryButton className="hidden px-4 py-2 sm:flex">
                <Sparkles className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Create</span>
              </PrimaryButton>
            </Link>
          )}

          {/* Audio Toggle */}
          {showAudioToggle && <AudioToggle />}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {/* Notification badge placeholder */}
            {/* <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">3</span> */}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="bg-primary/20 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <User className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <div className="bg-primary/20 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">
                    {user?.username || "User"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
