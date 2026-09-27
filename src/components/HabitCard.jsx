import { currentStreak, lastNDays, longestStreak, toDayKey } from '../lib/dates'

const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' })
const FULL_DATE = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

export default function HabitCard({ habit, days, onToggle, onEdit, onDelete, onCalendar, onArchive }) {
  const week = lastNDays(7)
  const doneThisWeek = week.filter((d) => days.has(toDayKey(d))).length
  const streak = currentStreak(days)
  const best = longestStreak(days)
  const goalMet = doneThisWeek >= habit.target_per_week
  const progress = Math.min(1, doneThisWeek / habit.target_per_week)

  return (
    <article className="card" style={{ '--c': habit.color }}>
      <header className="card-head">
        <div>
          <h3>{habit.name}</h3>
          {habit.description && <p className="muted">{habit.description}</p>}
        </div>
        <div className="card-actions">
          <button className="icon-btn" onClick={onCalendar} aria-label={`Calendar for ${habit.name}`} title="Streak calendar">
            📅
          </button>
          <button className="icon-btn" onClick={onEdit} aria-label={`Edit ${habit.name}`} title="Edit">
            ✎
          </button>
          <button className="icon-btn" onClick={onArchive} aria-label={`Archive ${habit.name}`} title="Archive (keeps history)">
            📦
          </button>
          <button className="icon-btn danger" onClick={onDelete} aria-label={`Delete ${habit.name}`} title="Delete">
            🗑
          </button>
        </div>
      </header>

      <div className="week" role="group" aria-label="Last 7 days">
        {week.map((d, i) => {
          const key = toDayKey(d)
          const done = days.has(key)
          const isToday = i === week.length - 1
          return (
            <button
              key={key}
              className={`day${done ? ' done' : ''}${isToday ? ' today' : ''}`}
              aria-pressed={done}
              aria-label={`${FULL_DATE.format(d)}: ${done ? 'done' : 'not done'}`}
              title={FULL_DATE.format(d)}
              onClick={() => onToggle(key)}
            >
              <span className="day-name">{isToday ? 'Today' : WEEKDAY.format(d)}</span>
              <span className="day-dot">{done ? '✓' : d.getDate()}</span>
            </button>
          )
        })}
      </div>

      <footer className="card-foot">
        <div className="progress" aria-label={`${doneThisWeek} of ${habit.target_per_week} in the last 7 days`}>
          <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="stats">
          <span className={goalMet ? 'goal-met' : ''}>
            {doneThisWeek}/{habit.target_per_week} in 7 days{goalMet && ' ⚓'}
          </span>
          <span>🔥 {streak} day streak</span>
          <span className="muted">Best {best}</span>
        </div>
      </footer>
    </article>
  )
}
