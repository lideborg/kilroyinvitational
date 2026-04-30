'use client';

import Image from 'next/image';

const PLAYERS = [
  { name: 'S.Kilroy', dots: 7, portrait: '/players/s_kilroy.jpg' },
  { name: 'N.Cafritz', dots: 5, portrait: '/players/n_cafritz.jpg' },
  { name: 'G.Miller', dots: 4, portrait: '/players/g_miller.jpg' },
  { name: 'M.Mortazavi', dots: 3, portrait: '/players/m_mortazavi.jpg' },
  { name: 'D.Sibrizzi', dots: 2, portrait: '/players/d_sibrizzi.jpg' },
  { name: 'Dan', dots: 1, portrait: '/players/dan.jpg' },
  { name: 'Karmali', dots: 0, portrait: '/players/karmali.jpg' },
  { name: 'H.Lideborg', dots: -1, portrait: '/players/h_lideborg.jpg' },
];

export default function Home() {
  return (
    <div className="flex flex-col h-[100dvh] bg-white pb-14">
      {/* Green header */}
      <div className="bg-golf-green flex flex-col items-center justify-center py-10 px-6">
        <Image
          src="/logo.png"
          alt="Kilroy Invitational"
          width={220}
          height={160}
          className="invert brightness-200"
          priority
        />
        <p className="mt-3 text-[11px] tracking-[0.3em] text-white/60 font-medium">
          BIRDIES ARE RARE, BEERS ARE NOT
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-center gap-0 py-4 border-b border-golf-border bg-white">
        {[
          { n: '8', label: 'Players' },
          { n: '3', label: 'Rounds' },
          { n: '54', label: 'Holes' },
        ].map((s, i) => (
          <div key={s.label} className="flex items-center">
            {i > 0 && <span className="mx-6 h-5 w-px bg-golf-border" />}
            <div className="text-center">
              <p className="font-[family-name:var(--font-playfair)] text-xl font-bold text-golf-dark">
                {s.n}
              </p>
              <p className="mt-0.5 text-[9px] tracking-[0.2em] text-golf-muted uppercase">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dots standings */}
      <div className="flex-1 overflow-auto">
        <h2 className="font-[family-name:var(--font-playfair)] text-lg text-golf-green font-bold px-4 pt-4 pb-2">
          Dots Standings
        </h2>
        <div className="border-t border-b border-golf-border bg-white">
          {PLAYERS.map((player, i) => (
            <div
              key={player.name}
              className={`flex items-center gap-3 px-4 py-2.5 ${
                i < PLAYERS.length - 1 ? 'border-b border-golf-border' : ''
              }`}
            >
              <span className="text-[11px] font-bold w-4 text-center text-golf-muted">
                {i + 1}
              </span>
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 relative border border-golf-border">
                <Image
                  src={player.portrait}
                  alt={player.name}
                  fill
                  className="object-cover"
                  sizes="28px"
                />
              </div>
              <span className="text-sm text-golf-dark flex-1 uppercase tracking-wide">
                {player.name}
              </span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  player.dots > 0
                    ? 'text-golf-green'
                    : player.dots < 0
                    ? 'text-golf-red'
                    : 'text-golf-muted'
                }`}
              >
                {player.dots > 0 ? `+${player.dots}` : player.dots}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
