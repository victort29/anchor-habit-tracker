import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Loads the signed-in user's habits and check-ins and exposes CRUD actions.
 * Row-level security on the database guarantees users only ever see their own rows.
 */
export function useHabits(userId) {
  const [habits, setHabits] = useState([])
  // { [habitId]: Set<'YYYY-MM-DD'> }
  const [checkins, setCheckins] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [habitsRes, checkinsRes] = await Promise.all([
      supabase.from('habits').select('*').order('created_at', { ascending: true }),
      supabase.from('habit_checkins').select('habit_id, day'),
    ])
    if (habitsRes.error || checkinsRes.error) {
      setError((habitsRes.error || checkinsRes.error).message)
    } else {
      setHabits(habitsRes.data)
      const grouped = {}
      for (const { habit_id, day } of checkinsRes.data) {
        ;(grouped[habit_id] ??= new Set()).add(day)
      }
      setCheckins(grouped)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (userId) load()
  }, [userId, load])

  // CREATE
  async function createHabit(fields) {
    const { data, error } = await supabase.from('habits').insert(fields).select().single()
    if (error) throw error
    setHabits((prev) => [...prev, data])
  }

  // UPDATE
  async function updateHabit(id, fields) {
    const { data, error } = await supabase.from('habits').update(fields).eq('id', id).select().single()
    if (error) throw error
    setHabits((prev) => prev.map((h) => (h.id === id ? data : h)))
  }

  // DELETE (check-ins are removed by the ON DELETE CASCADE foreign key)
  async function deleteHabit(id) {
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) throw error
    setHabits((prev) => prev.filter((h) => h.id !== id))
    setCheckins((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  // Check-ins: insert a row to mark a day done, delete it to undo.
  // The UI updates optimistically and rolls back if the request fails.
  async function toggleCheckin(habitId, day) {
    const done = checkins[habitId]?.has(day) ?? false
    const apply = (add) =>
      setCheckins((prev) => {
        const set = new Set(prev[habitId] ?? [])
        if (add) set.add(day)
        else set.delete(day)
        return { ...prev, [habitId]: set }
      })

    apply(!done)
    const { error } = done
      ? await supabase.from('habit_checkins').delete().match({ habit_id: habitId, day })
      : await supabase.from('habit_checkins').insert({ habit_id: habitId, day })
    if (error) {
      apply(done)
      setError(error.message)
    }
  }

  return {
    habits,
    checkins,
    loading,
    error,
    setError,
    reload: load,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCheckin,
  }
}
