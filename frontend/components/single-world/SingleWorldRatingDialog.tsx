"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useRateWorld } from "@/lib/queries/world";
import { toast } from "sonner";

interface SingleWorldRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: number;
  initialRating?: number;
}

export default function SingleWorldRatingDialog({ open, onOpenChange, worldId, initialRating }: SingleWorldRatingDialogProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(initialRating || 0);
  const { mutate: rateWorld, isPending } = useRateWorld();

  useEffect(() => {
    setSelectedRating(initialRating || 0);
  }, [initialRating]);

  const handleSubmit = () => {
    if (selectedRating > 0) {
      rateWorld(
        { worldId, rating: selectedRating },
        {
          onSuccess: () => {
            toast.success("Rating submitted successfully!");
            onOpenChange(false);
            setHoveredRating(0);
          },
          onError: (error) => {
            toast.error(error.message || "Failed to submit rating");
          },
        }
      );
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedRating(initialRating || 0);
    setHoveredRating(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate This World</DialogTitle>
          <DialogDescription>
            Share your experience to help others discover great stories
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setSelectedRating(rating)}
                className="transition-transform hover:scale-110"
                disabled={isPending}
              >
                <Star
                  className={`h-12 w-12 transition-colors ${
                    rating <= (hoveredRating || selectedRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          {selectedRating > 0 && (
            <p className="text-muted-foreground mt-4 text-center text-sm">
              You rated this world {selectedRating} star{selectedRating !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button variant="outline" onClick={handleCancel} className="flex-1" disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedRating === 0 || isPending}
            className="flex-1"
          >
            {isPending ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
