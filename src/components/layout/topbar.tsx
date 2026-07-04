"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";

const PAGE_DESCRIPTIONS: Record<string, string> = {
  "/dashboard": "An overview of your connections and recent activity.",
  "/inbox": "Every customer conversation, in one place.",
  "/ai-brain": "Configure how your AI sales executive thinks and responds.",
  "/settings": "Manage your Instagram connection.",
};

export function Topbar() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.href));

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-surface px-8">
      <div>
        <h1 className="font-display text-[15px] font-semibold text-ink">
          {current?.label ?? "AI Sales Executive"}
        </h1>
        <p className="text-xs text-muted">
          {PAGE_DESCRIPTIONS[current?.href ?? ""] ?? ""}
        </p>
      </div>
    </header>
  );
}
