"use client";

import { Card } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";

// Placeholder news data
const newsItems = [
  {
    id: 1,
    title: "Introducing Dark Fantasy Worlds",
    excerpt:
      "Dive into the shadows with our new dark fantasy theme expansion...",
    date: "2025-01-15",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=250&fit=crop",
    category: "Update",
  },
  {
    id: 2,
    title: "Community Spotlight: Top Creators",
    excerpt:
      "Meet the talented world builders shaping the LoreSmith universe...",
    date: "2025-01-12",
    image:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=250&fit=crop",
    category: "Community",
  },
  {
    id: 3,
    title: "New AI Features in Story Generation",
    excerpt:
      "Experience enhanced narrative depth with our latest AI improvements...",
    date: "2025-01-10",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
    category: "Feature",
  },
  {
    id: 4,
    title: "Winter Event: Frozen Realms",
    excerpt:
      "Limited time event featuring ice-themed worlds and exclusive rewards...",
    date: "2025-01-08",
    image:
      "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400&h=250&fit=crop",
    category: "Event",
  },
];

export default function NewsFeed() {
  return (
    <section className="bg-card/50 h-[500px] overflow-hidden rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Latest News</h2>
          <p className="text-muted-foreground text-[10px]">
            Stay updated with the latest
          </p>
        </div>
        <button className="group text-primary flex items-center gap-1 text-xs font-medium hover:underline">
          View All
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Vertical Scroll */}
      <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20 flex h-[calc(100%-3.5rem)] flex-col gap-2.5 overflow-y-auto pr-2">
        {newsItems.map((news) => (
          <Card
            key={news.id}
            className="group shrink-0 cursor-pointer overflow-hidden transition-all hover:shadow-md"
          >
            <div className="flex gap-3 p-3">
              {/* Image */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                <Image
                  fill
                  src={news.image}
                  alt={news.title}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-center overflow-hidden">
                <div className="mb-1 flex items-center gap-2">
                  <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold">
                    {news.category}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {new Date(news.date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="group-hover:text-primary mb-0.5 line-clamp-2 text-sm font-bold">
                  {news.title}
                </h3>
                <p className="text-muted-foreground line-clamp-1 text-xs">
                  {news.excerpt}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
