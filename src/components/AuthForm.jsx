import { useState } from 'react'
import { supabase } from '../lib/supabase'
import AnchorMark from './AnchorMark'

export default function AuthForm() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isRegister = mode === 'register'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) setError(error.message)
      // With email confirmation on, signUp succeeds but returns no session.
      else if (!data.session) {
        setNotice('Account created! Check your email to confirm it, then log in.')
        setMode('login')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setBusy(false)
  }

  function switchMode() {
    setMode(isRegister ? 'login' : 'register')
    setError('')
    setNotice('')
  }

  return (
    <main className="auth">
      <section className="auth-card">
        <div className="brand brand-lg">
          <AnchorMark />
          <span>Anchor</span>
        </div>
        <p className="tagline">Small habits, held steady.</p>

        <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>

        <form onSubmit={handleSubmit} className="stack">
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="msg msg-error" role="alert">{error}</p>}
          {notice && <p className="msg msg-ok" role="status">{notice}</p>}

          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'One moment…' : isRegister ? 'Register' : 'Log in'}
          </button>
        </form>

        <p className="switch">
          {isRegister ? 'Already have an account?' : 'New to Anchor?'}{' '}
          <button type="button" className="link" onClick={switchMode}>
            {isRegister ? 'Log in' : 'Create an account'}
          </button>
        </p>
      </section>
    </main>
  )
}
