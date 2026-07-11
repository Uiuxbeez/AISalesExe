import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Inbox, BrainCircuit, Settings, UserCircle } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "AI Brain", href: "/ai-brain", icon: BrainCircuit },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Account", href: "/account", icon: UserCircle },
];
