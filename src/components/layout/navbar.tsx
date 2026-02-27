"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { OnlineBadge } from "./online-badge";
import { Sword, GitCompareArrows, BarChart3, History, Settings, BookOpen, LogOut } from "lucide-react";

const navLinks = [
  { href: "/items", label: "Items", icon: Sword },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/attributes", label: "Attributes", icon: BarChart3 },
  { href: "/history", label: "History", icon: History },
  { href: "/config", label: "Config", icon: Settings },
  { href: "/wiki", label: "Wiki", icon: BookOpen },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-6">
          <Link href="/items" className="text-lg font-bold tracking-tight">
            EchoTrail <span className="text-muted-foreground font-normal">Item Editor</span>
          </Link>

          <div className="flex items-center gap-1">
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

        <div className="flex items-center gap-4">
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
      </div>
    </nav>
  );
}
