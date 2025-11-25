"use client";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

interface DiscoverSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

export default function DiscoverSearch({
  onSearchChange,
  onSearch,
}: DiscoverSearchProps) {
  const placeholders = [
    "Search for epic fantasy adventures...",
    "Find your next cyberpunk story...",
    "Discover mysterious horror worlds...",
    "Looking for a sci-fi odyssey?",
    "Explore magical realms and quests...",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <h2 className="text-foreground mb-10 text-center text-xl sm:mb-16 sm:text-4xl">
        Discover Your Next Adventure
      </h2>
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}
