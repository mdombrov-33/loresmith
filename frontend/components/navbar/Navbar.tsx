"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/navbar/theme-switcher";
import { Volume2, VolumeX } from "lucide-react";
import { Swords } from "lucide-react";

export function Navbar() {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
    console.log("Music toggled:", !isMusicPlaying);
  };

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xl font-bold">
            <span className="text-primary">
              <Swords />
            </span>
            <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
              LoreSmith
            </span>
          </div>
        </div>

        {/* Center - Theme Switcher (Desktop) */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <ThemeSwitcher />
        </div>

        {/* Right Section - Music & Auth */}
        <div className="flex items-center gap-3">
          {/* Music Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMusic}
            className="relative"
            title={isMusicPlaying ? "Mute Music" : "Play Music"}
          >
            {isMusicPlaying ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>

          {/* Auth Buttons */}
          <Button
            variant="ghost"
            onClick={() => setShowAuthModal(true)}
            className="hidden sm:inline-flex"
          >
            Login
          </Button>
          <Button onClick={() => setShowAuthModal(true)}>Sign Up</Button>
        </div>
      </div>

      {/* Mobile Theme Switcher */}
      <div className="bg-background/95 border-t px-4 py-3 md:hidden">
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
