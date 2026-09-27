import { useState } from 'react'

const COLORS = ['#2f6f73', '#3f5aa8', '#8a4fa3', '#c0563f', '#c8902c', '#4f8a3f']

const EMPTY = { name: '', description: '', color: COLORS[0], target_per_week: 7 }

/** Used for both creating a new habit and editing an existing one. */
export default function HabitForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...pick(initial) }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isEdit = Boolean(initial)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim() || null,
        color: form.color,
        target_per_week: Number(form.target_per_week),
      })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <form className="dialog stack" onSubmit={handleSubmit} aria-label={isEdit ? 'Edit habit' : 'New habit'}>
        <h2>{isEdit ? 'Edit habit' : 'New habit'}</h2>

        <label>
          Name
          <input
            autoFocus
            required
            maxLength={80}
            placeholder="e.g. Read 20 pages"
            value={form.name}
            onChange={set('name')}
          />
        </label>

        <label>
          Why it matters <span className="muted">(optional)</span>
          <textarea
            rows={2}
            maxLength={280}
            placeholder="A note to your future self"
            value={form.description}
            onChange={set('description')}
          />
        </label>

        <label>
          Goal: {form.target_per_week}× per week
          <input type="range" min={1} max={7} value={form.target_per_week} onChange={set('target_per_week')} />
        </label>

        <fieldset className="colors">
          <legend>Color</legend>
          {COLORS.map((c) => (
            <label key={c} className="swatch" style={{ '--c': c }}>
              <input type="radio" name="color" value={c} checked={form.color === c} onChange={set('color')} />
              <span className="sr-only">{c}</span>
            </label>
          ))}
        </fieldset>

        {error && <p className="msg msg-error" role="alert">{error}</p>}

        <div className="row end">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add habit'}
          </button>
        </div>
      </form>
    </div>
  )
}

function pick(habit) {
  if (!habit) return {}
  const { name, description, color, target_per_week } = habit
  return { name, description: description ?? '', color, target_per_week }
}
