'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  MapPin,
  Utensils,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trophy,
  Waves,
  Target,
  Rocket,
  Gamepad2,
} from 'lucide-react'

type DayEntry = {
  date: string
  label: string
  subtitle?: string
  details: string[]
  icon?: React.ReactNode
}

const SCHEDULE: DayEntry[] = [
  {
    date: 'Wed, May 13',
    label: 'Early Crew Arrives',
    subtitle: 'S.Kilroy, G.Miller, N.Cafritz, H.Lideborg',
    details: ['Arrive & settle in', 'Pool day Thursday'],
  },
  {
    date: 'Thu, May 14',
    label: 'Everyone Arrives',
    subtitle: 'Check-in at Omni ChampionsGate',
    details: [
      'Check in to resort',
      'Optional round at Southern Dunes',
      'Group dinner',
    ],
  },
  {
    date: 'Fri, May 15',
    label: 'Day 1 — Omni National',
    subtitle: 'Best Ball Shamble',
    details: [
      'Morning: Omni National (Greg Norman design)',
      'Format: Best Ball Shamble',
      'Afternoon: Free time / pool / activities',
      'Evening: Group dinner',
    ],
  },
  {
    date: 'Sat, May 16',
    label: 'Day 2 — Omni International',
    subtitle: 'Scramble',
    details: [
      'Morning: Omni International (Greg Norman design)',
      'Format: Scramble',
      'Afternoon: Activities (see below)',
      'Evening: Group dinner',
    ],
  },
  {
    date: 'Sun, May 17',
    label: 'Day 3 — Celebration Golf Club',
    subtitle: 'Scramble Hybrid',
    details: [
      'Morning: Celebration Golf Club (Robert Trent Jones design)',
      'Format: Scramble Hybrid',
      'Awards ceremony',
      'Evening flights home',
    ],
  },
]

const COURSES = [
  {
    name: 'Omni National',
    designer: 'Greg Norman',
    day: 'Friday — Day 1',
  },
  {
    name: 'Omni International',
    designer: 'Greg Norman',
    day: 'Saturday — Day 2',
  },
  {
    name: 'Celebration Golf Club',
    designer: 'Robert Trent Jones',
    day: 'Sunday — Day 3',
  },
]

const ACTIVITIES = [
  { name: 'NASA Kennedy Space Center', icon: Rocket },
  { name: 'Skeet / clay shooting', icon: Target },
  { name: 'Theme parks (Disney, Universal)', icon: Gamepad2 },
  { name: 'Go-karting', icon: Gamepad2 },
  { name: 'Pickle ball at resort', icon: Target },
  { name: 'Pool / water park', icon: Waves },
]

function ScheduleDay({ day, defaultOpen }: { day: DayEntry; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <div className="border-b border-golf-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <Calendar className="h-4 w-4 shrink-0 text-golf-green" strokeWidth={1.5} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] tracking-[0.15em] text-golf-muted uppercase">
            {day.date}
          </p>
          <p className="text-sm font-medium text-golf-dark">{day.label}</p>
          {day.subtitle && (
            <p className="text-xs text-golf-muted mt-0.5">{day.subtitle}</p>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-golf-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-golf-muted" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-3 pl-11">
          <ul className="space-y-1">
            {day.details.map((detail) => (
              <li
                key={detail}
                className="text-xs text-golf-dark/80 before:content-['·'] before:mr-2 before:text-golf-green before:font-bold"
              >
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-[family-name:var(--font-playfair)] text-lg text-golf-green font-bold px-4 pt-6 pb-2">
      {children}
    </h2>
  )
}

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Green Header */}
      <div className="bg-golf-green">
        <div className="mx-auto max-w-lg px-4 pt-5 pb-4">
          <h1 className="text-center font-[family-name:var(--font-playfair)] text-2xl font-bold tracking-widest text-white">
            SCHEDULE & INFO
          </h1>
          <p className="mt-1 text-center text-[11px] tracking-[0.2em] text-white/60">
            MAY 14 – 17, 2026 &middot; ORLANDO, FL
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-lg pb-8">
        {/* Schedule */}
        <SectionHeading>Schedule</SectionHeading>
        <div className="border-t border-golf-border">
          {SCHEDULE.map((day, i) => (
            <ScheduleDay key={day.date} day={day} defaultOpen={i === 2} />
          ))}
        </div>

        {/* Resort Info */}
        <SectionHeading>Resort</SectionHeading>
        <div className="border-t border-b border-golf-border px-4 py-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 shrink-0 text-golf-green mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-golf-dark">
                Omni Orlando Resort at ChampionsGate
              </p>
              <p className="text-xs text-golf-muted mt-1">
                Check-in: Thursday, May 14 &middot; Check-out: Sunday, May 17
              </p>
              <a
                href="https://www.omnihotels.com/hotels/orlando-championsgate"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-golf-green font-medium"
              >
                omnihotels.com
                <ExternalLink className="h-3 w-3" />
              </a>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-golf-dark/80 before:content-['·'] before:mr-2 before:text-golf-green before:font-bold">
                  Par 3 course (lit at night)
                </p>
                <p className="text-xs text-golf-dark/80 before:content-['·'] before:mr-2 before:text-golf-green before:font-bold">
                  TopGolf-style driving range
                </p>
                <p className="text-xs text-golf-dark/80 before:content-['·'] before:mr-2 before:text-golf-green before:font-bold">
                  Pools & water park
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses */}
        <SectionHeading>Courses</SectionHeading>
        <div className="border-t border-golf-border">
          {COURSES.map((course, i) => (
            <div
              key={course.name}
              className={`flex items-center gap-3 px-4 py-3 ${
                i < COURSES.length - 1 ? 'border-b border-golf-border' : 'border-b border-golf-border'
              }`}
            >
              <Trophy className="h-4 w-4 shrink-0 text-golf-green" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-golf-dark">{course.name}</p>
                <p className="text-xs text-golf-muted">
                  {course.designer} design &middot; {course.day}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Activities */}
        <SectionHeading>Activities</SectionHeading>
        <div className="border-t border-golf-border">
          {ACTIVITIES.map((activity, i) => {
            const Icon = activity.icon
            return (
              <div
                key={activity.name}
                className={`flex items-center gap-3 px-4 py-2.5 ${
                  i < ACTIVITIES.length - 1 ? 'border-b border-golf-border' : 'border-b border-golf-border'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 text-golf-green" strokeWidth={1.5} />
                <p className="text-sm text-golf-dark">{activity.name}</p>
              </div>
            )
          })}
        </div>

        {/* Restaurants */}
        <SectionHeading>Restaurants</SectionHeading>
        <div className="border-t border-b border-golf-border px-4 py-3">
          <div className="flex items-start gap-3">
            <Utensils className="h-4 w-4 shrink-0 text-golf-green mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm text-golf-dark">Resort dining options available on-site</p>
              <p className="text-xs text-golf-muted mt-2 italic">
                &ldquo;If anyone can find a good restaurant in Orlando... all ears&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
