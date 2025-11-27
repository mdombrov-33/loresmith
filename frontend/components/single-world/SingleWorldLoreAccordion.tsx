"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { LorePiece } from "@/lib/schemas";
import { loreIcons } from "@/constants/lore";
import LorePieceDetails from "./SingleWorldLoreDetails";

interface SingleWorldLoreAccordionProps {
  lorePieces: LorePiece[];
  displayNames: Record<string, string>;
}

export default function SingleWorldLoreAccordion({
  lorePieces,
  displayNames,
}: SingleWorldLoreAccordionProps) {
  return (
    <Accordion type="multiple" className="space-y-3">
      {lorePieces?.map((piece, index) => {
        const Icon = loreIcons[piece.type];
        const uniqueValue = `piece-${piece.type}-${piece.name}-${index}`;

        return (
          <AccordionItem
            key={uniqueValue}
            value={uniqueValue}
            className="border-border bg-card rounded-xl border shadow-sm"
          >
            <AccordionTrigger className="hover:bg-accent px-6 py-4 transition-colors hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="border-primary/30 bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                  {Icon && <Icon className="text-primary h-5 w-5" />}
                </div>
                <div className="flex flex-col items-start gap-1.5 text-left">
                  <span className="text-foreground text-base font-semibold">
                    {piece.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {displayNames[piece.type] || piece.type}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <LorePieceDetails piece={piece} displayNames={displayNames} />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
