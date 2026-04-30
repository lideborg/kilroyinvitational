'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Flag, Sparkles, Camera, Users } from 'lucide-react';

const navCards = [
  { href: '/leaderboard', label: 'Scores', icon: Flag, color: 'text-golf-green' },
  { href: '/dots', label: 'Dots', icon: Sparkles, color: 'text-golf-yellow' },
  { href: '/photos', label: 'Photos', icon: Camera, color: 'text-golf-teal' },
  { href: '/pairings', label: 'Pairings', icon: Users, color: 'text-golf-navy' },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-golf-cream">
      {/* Hero */}
      <section className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center">
        <Image
          src="/logo.png"
          alt="Kilroy Invitational"
          width={280}
          height={200}
          className="mb-6"
          priority
        />

        <p className="text-sm tracking-[0.25em] text-golf-muted font-medium">
          BIRDIES ARE RARE, BEERS ARE NOT
        </p>
      </section>

      {/* Stats */}
      <section className="flex items-center justify-center gap-0 px-6 pb-8">
        {[
          { n: '8', label: 'Players' },
          { n: '3', label: 'Rounds' },
          { n: '3', label: 'Days' },
        ].map((s, i) => (
          <div key={s.label} className="flex items-center">
            {i > 0 && <span className="mx-5 h-6 w-px bg-golf-border" />}
            <div className="text-center">
              <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-golf-dark">
                {s.n}
              </p>
              <p className="mt-0.5 text-[10px] tracking-[0.2em] text-golf-muted uppercase">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Nav Cards */}
      <section className="mx-auto grid max-w-sm grid-cols-2 gap-3 px-6 pb-24">
        {navCards.map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-2.5 rounded-xl border border-golf-border bg-golf-card p-5 shadow-sm transition-all active:scale-[0.97] hover:shadow-md"
          >
            <Icon className={`h-6 w-6 ${color} transition-colors`} />
            <span className="text-xs font-medium tracking-wider text-golf-dark/60 group-hover:text-golf-dark">
              {label}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
