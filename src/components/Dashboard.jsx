import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { toDayKey } from '../lib/dates'
import { useHabits } from '../hooks/useHabits'
import AnchorMark from './AnchorMark'
import HabitCard from './HabitCard'
import HabitForm from './HabitForm'

const EMPTY_SET = new Set()

export default function Dashboard({ session }) {
  const user = session.user
  const { habits, checkins, loading, error, setError, createHabit, updateHabit, deleteHabit, toggleCheckin } =
    useHabits(user.id)

  // null = closed, 'new' = creating, habit object = editing
  const [editing, setEditing] = useState(null)

  const today = toDayKey(new Date())
  const doneToday = habits.filter((h) => checkins[h.id]?.has(today)).length

  async function handleSave(fields) {
    if (editing === 'new') await createHabit(fields)
    else await updateHabit(editing.id, fields)
    setEditing(null)
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
          <div>
            <h1>Today</h1>
            <p className="muted">
              {habits.length === 0
                ? 'Add your first habit to get started.'
                : `${doneToday} of ${habits.length} habit${habits.length === 1 ? '' : 's'} done`}
            </p>
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
        ) : habits.length === 0 ? (
          <div className="empty">
            <AnchorMark size={48} />
            <p>No habits yet. What's one small thing you want to do every day?</p>
            <button className="btn btn-primary" onClick={() => setEditing('new')}>
              Create a habit
            </button>
          </div>
        ) : (
          <div className="grid">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                days={checkins[habit.id] ?? EMPTY_SET}
                onToggle={(day) => toggleCheckin(habit.id, day)}
                onEdit={() => setEditing(habit)}
                onDelete={() => handleDelete(habit)}
              />
            ))}
          </div>
        )}
      </main>

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
