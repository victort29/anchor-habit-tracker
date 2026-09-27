// Dates are stored as plain 'YYYY-MM-DD' strings in the user's local timezone,
// so "today" always means the user's today, not UTC's.

export function toDayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date, n) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + n)
  return copy
}

/** The last `count` days ending today, oldest first. */
export function lastNDays(count, today = new Date()) {
  return Array.from({ length: count }, (_, i) => addDays(today, i - (count - 1)))
}

/**
 * Consecutive days checked in, counting back from today.
 * If today isn't checked yet the streak is still alive from yesterday.
 */
export function currentStreak(daySet, today = new Date()) {
  let cursor = daySet.has(toDayKey(today)) ? today : addDays(today, -1)
  let streak = 0
  while (daySet.has(toDayKey(cursor))) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function longestStreak(daySet) {
  const days = [...daySet].sort()
  let best = 0
  let run = 0
  let prev = null
  for (const key of days) {
    const date = new Date(`${key}T00:00:00`)
    run = prev && toDayKey(addDays(prev, 1)) === key ? run + 1 : 1
    best = Math.max(best, run)
    prev = date
  }
  return best
}
