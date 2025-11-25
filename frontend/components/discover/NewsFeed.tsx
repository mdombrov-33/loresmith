"use client";

import { Card } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";

// Placeholder news data
const newsItems = [
  {
    id: 1,
    title: "Introducing Dark Fantasy Worlds",
    excerpt: "Dive into the shadows with our new dark fantasy theme expansion...",
    date: "2025-01-15",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=250&fit=crop",
    category: "Update",
  },
  {
    id: 2,
    title: "Community Spotlight: Top Creators",
    excerpt: "Meet the talented world builders shaping the LoreSmith universe...",
    date: "2025-01-12",
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=250&fit=crop",
    category: "Community",
  },
  {
    id: 3,
    title: "New AI Features in Story Generation",
    excerpt: "Experience enhanced narrative depth with our latest AI improvements...",
    date: "2025-01-10",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
    category: "Feature",
  },
  {
    id: 4,
    title: "Winter Event: Frozen Realms",
    excerpt: "Limited time event featuring ice-themed worlds and exclusive rewards...",
    date: "2025-01-08",
    image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400&h=250&fit=crop",
    category: "Event",
  },
];

export default function NewsFeed() {
  return (
    <section className="py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Latest News</h2>
          <p className="text-muted-foreground">
            Stay updated with the latest from LoreSmith
          </p>
        </div>
        <button className="group flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          View All
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Horizontal Scroll */}
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20">
        {newsItems.map((news) => (
          <Card
            key={news.id}
            className="group min-w-[350px] cursor-pointer overflow-hidden transition-all hover:shadow-xl"
          >
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                fill
                src={news.image}
                alt={news.title}
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {news.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(news.date).toLocaleDateString()}</span>
              </div>
              <h3 className="mb-2 text-lg font-bold line-clamp-2 group-hover:text-primary">
                {news.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {news.excerpt}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
