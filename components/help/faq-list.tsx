"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/format";

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <li key={item.question}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : index)}
              aria-expanded={expanded}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-canvas"
            >
              <span className="text-[15px] font-medium text-ink">{item.question}</span>
              <Icon
                name="chevron-down"
                size={18}
                className={cn("shrink-0 text-muted transition-transform", expanded && "rotate-180")}
              />
            </button>
            {expanded ? (
              <div className="px-5 pb-5">
                <p className="text-[14.5px] leading-relaxed text-muted">{item.answer}</p>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
