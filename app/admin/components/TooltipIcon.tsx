// components/TooltipIcon.tsx
"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

export default function TooltipIcon({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-black text-white px-2 py-1 text-xs rounded shadow-md"
            side="top"
            sideOffset={4}
          >
            {label}
            <Tooltip.Arrow className="fill-black" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
