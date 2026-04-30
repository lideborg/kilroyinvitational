"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flag, CircleDot, Camera, Users } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/leaderboard", label: "Scores", icon: Flag },
  { href: "/dots", label: "Dots", icon: CircleDot },
  { href: "/photos", label: "Photos", icon: Camera },
  { href: "/pairings", label: "Pairings", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-golf-border bg-golf-card">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] tracking-wider transition-colors ${
                isActive
                  ? "text-golf-green font-semibold"
                  : "text-golf-muted hover:text-golf-dark"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
