'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

type SectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

function Section({ title, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-golf-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-4 text-left active:bg-gray-50"
      >
        <h2 className="font-[family-name:var(--font-playfair)] text-base font-bold text-golf-dark">
          {title}
        </h2>
        {open ? (
          <ChevronUp className="h-5 w-5 text-golf-muted shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-golf-muted shrink-0" />
        )}
      </button>
      {open && <div className="px-4 pb-4 pt-0">{children}</div>}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-sm text-golf-dark leading-relaxed">{children}</li>
  );
}

function DotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1">
      <span className="text-sm text-golf-dark">{label}</span>
      <span
        className={`text-sm font-bold tabular-nums shrink-0 ${
          value.startsWith('+') ? 'text-golf-green' : 'text-golf-red'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function RulesPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-white pb-14">
      {/* Green header */}
      <div className="bg-golf-green px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-white/70 text-xs tracking-wide mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
          Rules & Format
        </h1>
        <p className="mt-1 text-xs text-white/60 tracking-wide">
          8 PLAYERS &middot; 3 ROUNDS &middot; 54 HOLES
        </p>
      </div>

      {/* Sections */}
      <div className="flex-1">
        <Section title="Golf Format" defaultOpen>
          <ul className="space-y-1.5 list-disc list-outside pl-4">
            <Bullet>Handicap cap: 24</Bullet>
            <Bullet>No repeat pairings across the weekend</Bullet>
            <Bullet>
              Day 1: random pairings; Days 2-3: balanced pairings (committee)
            </Bullet>
            <Bullet>All scoring is round-based (except dots)</Bullet>
            <Bullet>1 Breakfast Ball per player, 1 Lunch Ball per player</Bullet>
          </ul>
        </Section>

        <Section title="Handicap System">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-golf-muted tracking-wide uppercase mb-1">
                Day 1 &ndash; Shamble
              </p>
              <p className="text-sm text-golf-dark leading-relaxed">
                Combine both players&apos; handicaps &divide; 2, adjust for
                course/slope, &times; 0.6
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-golf-muted tracking-wide uppercase mb-1">
                Day 2 & 3 &ndash; Scramble
              </p>
              <p className="text-sm text-golf-dark leading-relaxed">
                Each player takes 85% of handicap. Team = 30% of low + 20% of
                high.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Day 1 &ndash; Best Ball Shamble">
          <ul className="space-y-1.5 list-disc list-outside pl-4">
            <Bullet>
              Each team takes best drive, each player plays own ball after
            </Bullet>
            <Bullet>Team uses best net score per hole</Bullet>
            <Bullet>
              Subtract team handicap from total &rarr; lowest net wins
            </Bullet>
          </ul>
        </Section>

        <Section title="Day 2 &ndash; Scramble">
          <ul className="space-y-1.5 list-disc list-outside pl-4">
            <Bullet>2-man scramble, minimum 4 tee shots per player</Bullet>
            <Bullet>
              Final score &minus; scramble allowance = net score, lowest net wins
            </Bullet>
          </ul>
        </Section>

        <Section title="Day 3 &ndash; Scramble Hybrid">
          <ul className="space-y-1.5 list-disc list-outside pl-4">
            <Bullet>2-man scramble, minimum 6 tee shots per player</Bullet>
            <Bullet>
              Must take 1 non-putt shot per hole from each player (except Par
              3s)
            </Bullet>
          </ul>
        </Section>

        <Section title="Rolling Dots Game (Full Weekend)">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-golf-green tracking-wide uppercase mb-1.5">
                Earn Dots
              </p>
              <div className="space-y-0.5">
                <DotRow label="Longest Drive" value="+1" />
                <DotRow label="Closest to Pin (Par 3)" value="+1" />
                <DotRow label="Bunker Up & Down" value="+1" />
                <DotRow label="15'+ Putt Made" value="+1" />
                <DotRow label="Winning Group" value="+3" />
                <DotRow label="Daily Best Vibes (vote)" value="+3" />
                <DotRow label="Best Relative Performer (vote)" value="+2" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-golf-red tracking-wide uppercase mb-1.5">
                Lose Dots
              </p>
              <div className="space-y-0.5">
                <DotRow label="Lost Ball" value="-1" />
                <DotRow label="Water Ball" value="-1" />
                <DotRow label="Practice Swing Divot" value="-1" />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Daily Rewards & Forfeits">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-golf-green tracking-wide uppercase mb-1">
                Winners
              </p>
              <ul className="space-y-1.5 list-disc list-outside pl-4">
                <Bullet>First round paid by losers</Bullet>
                <Bullet>
                  Earn 1 Golden Reverse Mulligan (force any player to replay one
                  shot next day)
                </Bullet>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-golf-red tracking-wide uppercase mb-1">
                Losers
              </p>
              <ul className="space-y-1.5 list-disc list-outside pl-4">
                <Bullet>Buy first round</Bullet>
                <Bullet>Must tee off from the tips on Hole 1</Bullet>
                <Bullet>Must do tee box announcement for winners</Bullet>
              </ul>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
