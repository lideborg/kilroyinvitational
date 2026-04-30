"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flag, Sparkles, Camera, Users } from "lucide-react";

const tabs = [
  { href: "/leaderboard", label: "Scores", icon: Flag },
  { href: "/dots", label: "Dots", icon: Sparkles },
  { href: "/photos", label: "Photos", icon: Camera },
  { href: "/pairings", label: "Pairings", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide on home page since it has its own nav cards
  if (pathname === "/") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#1A1032]">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] tracking-wider transition-colors ${
                isActive
                  ? "text-golf-pink"
                  : "text-golf-cream/40 hover:text-golf-cream/70"
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
