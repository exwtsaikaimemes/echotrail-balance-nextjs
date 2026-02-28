"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { OnlineBadge } from "./online-badge";
import { usePatchVersions } from "@/hooks/use-patch-versions";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Sword,
  GitCompareArrows,
  BarChart3,
  FileText,
  Globe,
  Settings,
  BookOpen,
  LogOut,
  Menu,
  Backpack,
  TrendingUp,
} from "lucide-react";

const navLinks = [
  { href: "/items", label: "Items", icon: Sword },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/attributes", label: "Attributes", icon: BarChart3 },
  { href: "/loadout", label: "Loadout", icon: Backpack },
  { href: "/stats", label: "Stats", icon: TrendingUp },
  { href: "/history", label: "Patch Notes", icon: FileText },
  { href: "/patch-notes", label: "Public Notes", icon: Globe },
  { href: "/config", label: "Config", icon: Settings },
  { href: "/wiki", label: "Wiki", icon: BookOpen },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: patchVersions } = usePatchVersions();
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentVersion = patchVersions?.find((v) => v.isCurrent)?.version;

  return (
    <nav className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: Logo + nav links */}
        <div className="flex items-center gap-6">
          <Link href="/items" className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-tight">
              EchoTrail <span className="text-muted-foreground font-normal">Item Editor</span>
            </span>
            {currentVersion && (
              <span className="text-xs text-muted-foreground font-mono leading-tight">
                v{currentVersion}
              </span>
            )}
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-4">
          <OnlineBadge />

          {session?.user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {session.user.username}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="px-4 pt-4 pb-2">
              <SheetTitle className="text-left text-lg font-bold tracking-tight">
                EchoTrail <span className="text-muted-foreground font-normal">Item Editor</span>
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col px-2 py-2 gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-border mt-2 px-4 py-3 space-y-3">
              <OnlineBadge />

              {session?.user && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {session.user.username}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
