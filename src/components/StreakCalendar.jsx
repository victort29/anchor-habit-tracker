import { useEffect, useMemo, useRef, useState } from 'react'
import { addDays, currentStreak, longestStreak, toDayKey } from '../lib/dates'

const WEEKS = 53
const MONTH = new Intl.DateTimeFormat(undefined, { month: 'short' })
const FULL_DATE = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const ALL = 'all'

/**
 * GitHub-style contribution graph for the last year.
 * "All habits" shades each day by how many habits were done; a single habit is simply done / not done.
 */
export default function StreakCalendar({ habits, checkins, initialHabitId = ALL, onClose }) {
  const [selected, setSelected] = useState(initialHabitId)
  const [hovered, setHovered] = useState(null)
  const scrollRef = useRef(null)

  const habit = habits.find((h) => h.id === selected)
  const color = habit?.color ?? 'var(--accent)'

  // day key -> number of habits checked in that day
  const counts = useMemo(() => {
    const map = new Map()
    const sources = habit ? [checkins[habit.id]] : habits.map((h) => checkins[h.id])
    for (const days of sources) {
      for (const day of days ?? []) map.set(day, (map.get(day) ?? 0) + 1)
    }
    return map
  }, [habit, habits, checkins])

  const activeDays = useMemo(() => new Set(counts.keys()), [counts])
  const max = habit ? 1 : Math.max(1, habits.length)

  // Columns are weeks (Sunday → Saturday), ending with the current week.
  const weeks = useMemo(() => {
    const today = new Date()
    const start = addDays(today, -(today.getDay() + (WEEKS - 1) * 7))
    return Array.from({ length: WEEKS }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const date = addDays(start, w * 7 + d)
        return date > today ? null : date
      }),
    )
  }, [])

  // Start scrolled to the most recent weeks on narrow screens.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const total = [...counts.values()].reduce((a, b) => a + b, 0)

  function level(count) {
    if (!count) return 0
    return Math.max(1, Math.ceil((count / max) * 4))
  }

  function describe(date) {
    const count = counts.get(toDayKey(date)) ?? 0
    const what = habit
      ? count ? 'Done' : 'Not done'
      : `${count} of ${habits.length} habit${habits.length === 1 ? '' : 's'} done`
    return `${what} · ${FULL_DATE.format(date)}`
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="dialog dialog-wide stack" role="dialog" aria-label="Streak calendar">
        <div className="row between">
          <h2>Streak calendar</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <select className="select" value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value={ALL}>All habits</option>
          {habits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>

        <div className="cal-stats">
          <Stat label="Current streak" value={`${currentStreak(activeDays)} days`} />
          <Stat label="Longest streak" value={`${longestStreak(activeDays)} days`} />
          <Stat label="Active days" value={activeDays.size} />
          <Stat label="Check-ins" value={total} />
        </div>

        <div className="cal-scroll" ref={scrollRef}>
          <div className="cal" style={{ '--c': color }}>
            <div className="cal-months">
              {weeks.map((week, i) => {
                // Label the first week of each month (skip a partial first column to avoid overlap).
                const first = week[0]
                const showLabel = i > 0 && first.getMonth() !== weeks[i - 1][0].getMonth()
                return <span key={i}>{showLabel ? MONTH.format(first) : ''}</span>
              })}
            </div>
            <div className="cal-body">
              <div className="cal-weekdays" aria-hidden="true">
                {WEEKDAY_LABELS.map((l, i) => (
                  <span key={i}>{l}</span>
                ))}
              </div>
              <div className="cal-grid" role="grid" aria-label="Check-ins over the last year">
                {weeks.map((week, w) => (
                  <div key={w} className="cal-week" role="row">
                    {week.map((date, d) =>
                      date ? (
                        <span
                          key={d}
                          role="gridcell"
                          className={`cell l${level(counts.get(toDayKey(date)))}`}
                          title={describe(date)}
                          aria-label={describe(date)}
                          onMouseEnter={() => setHovered(date)}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => setHovered(date)}
                        />
                      ) : (
                        <span key={d} className="cell blank" />
                      ),
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row between cal-foot">
          <span className="muted">{hovered ? describe(hovered) : 'Hover or tap a square for details'}</span>
          <span className="legend" style={{ '--c': color }} aria-hidden="true">
            Less
            {(habit ? [0, 4] : [0, 1, 2, 3, 4]).map((l) => (
              <span key={l} className={`cell l${l}`} />
            ))}
            More
          </span>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="muted">{label}</span>
    </div>
  )
}
