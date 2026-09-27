import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { toDayKey } from '../lib/dates'
import { useHabits } from '../hooks/useHabits'
import AnchorMark from './AnchorMark'
import HabitCard from './HabitCard'
import HabitForm from './HabitForm'
import ProgressRing from './ProgressRing'
import StreakCalendar from './StreakCalendar'

const EMPTY_SET = new Set()

export default function Dashboard({ session }) {
  const user = session.user
  const { habits, checkins, loading, error, setError, createHabit, updateHabit, deleteHabit, toggleCheckin } =
    useHabits(user.id)

  // null = closed, 'new' = creating, habit object = editing
  const [editing, setEditing] = useState(null)
  // null = closed, 'all' = every habit, habit id = one habit
  const [calendarFor, setCalendarFor] = useState(null)
  const [showArchived, setShowArchived] = useState(false)

  // Archived habits keep their history but are hidden from the main list and stats.
  const active = habits.filter((h) => !h.archived)
  const archived = habits.filter((h) => h.archived)

  const today = toDayKey(new Date())
  const doneToday = active.filter((h) => checkins[h.id]?.has(today)).length
  const allDone = active.length > 0 && doneToday === active.length

  async function handleSave(fields) {
    if (editing === 'new') await createHabit(fields)
    else await updateHabit(editing.id, fields)
    setEditing(null)
  }

  async function setArchived(habit, value) {
    try {
      await updateHabit(habit.id, { archived: value })
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(habit) {
    if (!window.confirm(`Delete "${habit.name}" and all of its history? This can't be undone.`)) return
    try {
      await deleteHabit(habit.id)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <AnchorMark />
          <span>Anchor</span>
        </div>
        <div className="row">
          {active.length > 0 && (
            <button className="btn btn-ghost" onClick={() => setCalendarFor('all')}>
              📅 Calendar
            </button>
          )}
          <span className="muted email" title={user.email}>
            {user.email}
          </span>
          <button className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>
            Log out
          </button>
        </div>
      </header>

      <main className="container">
        <section className="summary">
          <div className="summary-today">
            {active.length > 0 && <ProgressRing done={doneToday} total={active.length} />}
            <div>
              <h1>Today</h1>
              <p className="muted">
                {active.length === 0
                  ? 'Add your first habit to get started.'
                  : allDone
                    ? `All ${active.length} habit${active.length === 1 ? '' : 's'} done. Anchored for today! ⚓`
                    : `${doneToday} of ${active.length} habit${active.length === 1 ? '' : 's'} done`}
              </p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setEditing('new')}>
            + New habit
          </button>
        </section>

        {error && (
          <p className="msg msg-error" role="alert">
            {error}{' '}
            <button className="link" onClick={() => setError('')}>
              Dismiss
            </button>
          </p>
        )}

        {loading ? (
          <p className="muted center">Loading your habits…</p>
        ) : active.length === 0 ? (
          <div className="empty">
            <AnchorMark size={48} />
            <p>
              {archived.length > 0
                ? 'No active habits. Restore one below or start something new.'
                : "No habits yet. What's one small thing you want to do every day?"}
            </p>
            <button className="btn btn-primary" onClick={() => setEditing('new')}>
              Create a habit
            </button>
          </div>
        ) : (
          <div className="grid">
            {active.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                days={checkins[habit.id] ?? EMPTY_SET}
                onToggle={(day) => toggleCheckin(habit.id, day)}
                onEdit={() => setEditing(habit)}
                onCalendar={() => setCalendarFor(habit.id)}
                onArchive={() => setArchived(habit, true)}
                onDelete={() => handleDelete(habit)}
              />
            ))}
          </div>
        )}

        {archived.length > 0 && (
          <section className="archived">
            <button className="link" onClick={() => setShowArchived((v) => !v)} aria-expanded={showArchived}>
              {showArchived ? 'Hide' : 'Show'} archived ({archived.length})
            </button>
            {showArchived && (
              <ul className="archived-list">
                {archived.map((habit) => (
                  <li key={habit.id} style={{ '--c': habit.color }}>
                    <span className="archived-name">{habit.name}</span>
                    <span className="muted">{checkins[habit.id]?.size ?? 0} check-ins</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setArchived(habit, false)}>
                      Restore
                    </button>
                    <button className="icon-btn danger" onClick={() => handleDelete(habit)} aria-label={`Delete ${habit.name}`} title="Delete">
                      🗑
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      {calendarFor && (
        <StreakCalendar
          habits={active}
          checkins={checkins}
          initialHabitId={calendarFor}
          onClose={() => setCalendarFor(null)}
        />
      )}

      {editing && (
        <HabitForm
          initial={editing === 'new' ? null : editing}
          onSubmit={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </>
  )
}
