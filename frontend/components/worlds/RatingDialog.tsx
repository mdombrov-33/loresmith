"use client";

import { useState } from "react";
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

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RatingDialog({ open, onOpenChange }: RatingDialogProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  const handleSubmit = () => {
    if (selectedRating > 0) {
      // TODO: API call to submit rating
      onOpenChange(false);
      setSelectedRating(0);
      setHoveredRating(0);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedRating(0);
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
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedRating === 0}
            className="flex-1"
          >
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
