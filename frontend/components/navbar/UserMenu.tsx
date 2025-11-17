"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Globe, User, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const router = useRouter();
  const { user, token, logout, theme } = useAppStore();
  const { data: session } = useSession();
  const isAuthenticated = !!session || (!!user && !!token);

  const handleLogout = () => {
    if (session) {
      signOut();
    } else {
      logout();
      document.cookie = "auth=; path=/; max-age=0";
      router.push(`/?theme=${theme}`);
    }
  };

  const handleSearchNavigation = () => {
    const { searchTheme, searchStatus } = useAppStore.getState();
    const params = new URLSearchParams();
    if (searchTheme) params.set("theme", searchTheme);
    if (searchStatus) params.set("status", searchStatus);
    const query = params.toString();
    router.push(query ? `/worlds-hub?${query}` : "/worlds-hub");
  };

  if (!isAuthenticated) {
    return null;
  }

  const displayName = session?.user?.email || user?.email || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline max-w-[120px] truncate">{displayName}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSearchNavigation}>
          <Globe className="mr-2 h-4 w-4" />
          <span>Worlds Hub</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
