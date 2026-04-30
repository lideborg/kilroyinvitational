'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Flag, Sparkles, Camera, Users } from 'lucide-react';

const navCards = [
  { href: '/leaderboard', label: 'Scores', icon: Flag, color: 'text-golf-coral' },
  { href: '/dots', label: 'Dots', icon: Sparkles, color: 'text-golf-peach' },
  { href: '/photos', label: 'Photos', icon: Camera, color: 'text-golf-sky' },
  { href: '/pairings', label: 'Pairings', icon: Users, color: 'text-golf-teal' },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Warm ambient glows */}
      <div className="pointer-events-none absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-golf-coral/15 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 left-[-100px] w-[500px] h-[500px] rounded-full bg-golf-pink/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-20 right-[-100px] w-[400px] h-[400px] rounded-full bg-golf-purple/10 blur-[100px]" />

      {/* Hero */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <Image
          src="/logo.png"
          alt="Kilroy Invitational"
          width={300}
          height={220}
          className="invert brightness-200 mb-6 drop-shadow-[0_0_40px_rgba(255,107,74,0.15)]"
          priority
        />

        <p className="text-sm tracking-[0.3em] text-golf-peach/60 font-medium">
          BIRDIES ARE RARE, BEERS ARE NOT
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
            {i > 0 && <span className="mx-5 h-6 w-px bg-golf-cream/15" />}
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
        {navCards.map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 transition-all active:scale-[0.97] hover:bg-white/10 hover:border-white/20"
          >
            <Icon className={`h-6 w-6 ${color} transition-colors`} />
            <span className="text-xs font-medium tracking-wider text-golf-cream/70 group-hover:text-golf-cream">
              {label}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
