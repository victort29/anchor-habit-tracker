import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import AuthForm from './components/AuthForm'
import Dashboard from './components/Dashboard'

export default function App() {
  // undefined = still checking, null = logged out
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (session === undefined) return <p className="muted center">Loading…</p>
  // Keying on the user id resets all dashboard state when someone else logs in.
  return session ? <Dashboard key={session.user.id} session={session} /> : <AuthForm />
}
