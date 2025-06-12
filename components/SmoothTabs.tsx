"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { useState } from "react";

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

export interface SmoothTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
}

export default function SmoothTabs({
  tabs,
  defaultValue,
  className,
}: SmoothTabsProps) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value);

  return (
    <Tabs.Root value={active} onValueChange={setActive} className={className}>
      <Tabs.List className="relative flex border-b border-neutral-300">
        {tabs.map(({ value, label }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="relative px-3 py-2 text-sm data-[state=active]:text-primary-600 focus:outline-none"
          >
            {label}
            {active === value && (
              <motion.div
                layoutId="underline"
                className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary-600"
              />
            )}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map(({ value, content }) => (
        <Tabs.Content key={value} value={value} className="py-4">
          {content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
