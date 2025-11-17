"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ActionButton from "@/components/shared/ActionButton";
import { ThemeSwitcher } from "@/components/navbar/ThemeSwitcher";
import { useAppStore } from "@/stores/appStore";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, Globe, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const {
    user,
    token,
    logout,
    theme,
    appStage,
    setIsLoginModalOpen,
    setIsRegisterModalOpen,
  } = useAppStore();
  const { data: session } = useSession();
  const isAuthenticated = !!session || (!!user && !!token);
  const showThemeSwitcher = appStage === "home";
  const displayName = session?.user?.email || user?.email || "User";

  const handleLogout = () => {
    if (session) {
      signOut();
    } else {
      logout();
      document.cookie = "auth=; path=/; max-age=0";
      router.push(`/?theme=${theme}`);
    }
    setIsOpen(false);
  };

  const handleSearchNavigation = () => {
    const { searchTheme, searchStatus } = useAppStore.getState();
    const params = new URLSearchParams();
    if (searchTheme) params.set("theme", searchTheme);
    if (searchStatus) params.set("status", searchStatus);
    const query = params.toString();
    router.push(query ? `/worlds-hub?${query}` : "/worlds-hub");
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <ActionButton variant="ghost" size="sm" icon={<Menu className="h-5 w-5" />} className="xl:hidden">
          <span className="sr-only">Open menu</span>
        </ActionButton>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-6 px-2">
          {/* Theme Selection */}
          {showThemeSwitcher && (
            <div className="space-y-4">
              <h3 className="text-foreground text-sm font-semibold uppercase tracking-wide">Select Theme</h3>
              <ThemeSwitcher variant="mobile" />
            </div>
          )}

          {isAuthenticated && (
            <>
              {showThemeSwitcher && <Separator />}

              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <User className="text-primary h-5 w-5" />
                </div>
                <div className="flex-1 truncate">
                  <p className="text-foreground truncate text-sm font-medium">{displayName}</p>
                  <p className="text-muted-foreground text-xs">Adventurer</p>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <ActionButton
                  variant="ghost"
                  size="sm"
                  onClick={handleSearchNavigation}
                  icon={<Globe className="h-4 w-4" />}
                  className="w-full justify-start"
                >
                  Worlds Hub
                </ActionButton>
                <ActionButton
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  icon={<LogOut className="h-4 w-4" />}
                  className="text-destructive hover:text-destructive w-full justify-start"
                >
                  Logout
                </ActionButton>
              </div>
            </>
          )}

          {!isAuthenticated && (
            <>
              {showThemeSwitcher && <Separator />}

              {/* Auth Actions */}
              <div className="space-y-2">
                <ActionButton
                  size="sm"
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full"
                >
                  Login
                </ActionButton>
                <ActionButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsRegisterModalOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full"
                >
                  Sign Up
                </ActionButton>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
