"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { LogoutButton } from "@/components/layout/logout-button";
import { StatusPulse } from "@/components/ui/status-pulse";

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <MessageSquareText className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold">AI Sales Executive</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-active hover:text-sidebar-foreground",
                isActive && "border-accent bg-sidebar-active text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 px-3 py-4">
        <div className="mb-3 flex items-center justify-between rounded-md px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{userName}</p>
            <p className="truncate text-xs text-sidebar-muted">admin@example.com</p>
          </div>
        </div>
        <div className="mb-2 px-3">
          <StatusPulse status="live" label="All systems normal" />
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
