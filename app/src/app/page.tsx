'use client';

import Link from 'next/link';
import { Trophy, Target, Camera, Users } from 'lucide-react';

const navCards = [
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/dots', label: 'Dots', icon: Target },
  { href: '/photos', label: 'Photos', icon: Camera },
  { href: '/pairings', label: 'Pairings', icon: Users },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-golf-dark">
      {/* Hero */}
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
        {/* Art Deco geometric accent */}
        <div className="mb-8 flex items-center gap-2">
          <span className="block h-px w-8 bg-golf-teal" />
          <span className="block h-2 w-2 rotate-45 border border-golf-teal" />
          <span className="block h-px w-8 bg-golf-teal" />
        </div>

        <p className="mb-4 text-xs font-medium tracking-[0.4em] text-golf-teal">
          EST. 2026
        </p>

        <h1 className="font-[family-name:var(--font-playfair)] text-4xl leading-[1.1] font-bold text-golf-cream sm:text-5xl">
          THE KILROY
          <br />
          <span className="text-golf-gold">INVITATIONAL</span>
        </h1>

        {/* Art Deco divider */}
        <div className="my-6 flex items-center gap-2">
          <span className="block h-px w-16 bg-gradient-to-r from-transparent to-golf-gold/60" />
          <span className="text-golf-coral text-lg">&#9670;</span>
          <span className="block h-px w-16 bg-gradient-to-l from-transparent to-golf-gold/60" />
        </div>

        <p className="mb-2 text-xs font-semibold tracking-[0.5em] text-golf-coral">
          GOLF & BEER
        </p>

        <p className="text-sm tracking-widest text-golf-cream/50">
          BIRDIES ARE RARE, BEERS ARE NOT
        </p>

        {/* Palm / Florida hint */}
        <p className="mt-6 text-xs tracking-[0.3em] text-golf-teal/60">
          &#127796; FLORIDA &#127796;
        </p>
      </section>

      {/* Stats */}
      <section className="flex items-center justify-center gap-0 px-6 pb-10">
        {[
          { n: '8', label: 'Players' },
          { n: '3', label: 'Rounds' },
          { n: '3', label: 'Days' },
        ].map((s, i) => (
          <div key={s.label} className="flex items-center">
            {i > 0 && <span className="mx-5 h-6 w-px bg-golf-teal/30" />}
            <div className="text-center">
              <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-golf-cream">
                {s.n}
              </p>
              <p className="mt-0.5 text-[10px] tracking-[0.2em] text-golf-cream/40 uppercase">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Nav Cards */}
      <section className="mx-auto grid max-w-sm grid-cols-2 gap-3 px-6 pb-24">
        {navCards.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-2.5 rounded-lg border border-golf-teal/10 bg-golf-card p-5 transition-all active:scale-[0.97] hover:border-golf-teal/30"
          >
            <Icon className="h-6 w-6 text-golf-teal transition-colors group-hover:text-golf-gold" />
            <span className="text-xs font-medium tracking-wider text-golf-cream/70 group-hover:text-golf-cream">
              {label}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
