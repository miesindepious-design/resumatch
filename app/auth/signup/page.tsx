'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) { setError(error.message); setLoading(false) }
    else if (data.session) router.push('/dashboard')
    else setDone(true)
    setLoading(false)
  }

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 380, textAlign: 'center' }}>
        <div className="serif" style={{ fontSize: 24, marginBottom: 24 }}>Resumatch</div>
        <div className="card">
          <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
          <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Check your email</h2>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="serif" style={{ fontSize: 24, textAlign: 'center', marginBottom: 40 }}>Resumatch</div>
        </Link>
        <div className="card">
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 24 }}>3 free tailors — no card required</p>
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8+ characters" minLength={8} required />
            </div>
            {error && <div style={{ fontSize: 13, color: '#c0392b', marginBottom: 14, padding: '8px 12px', background: '#fdf2f2', borderRadius: 6 }}>{error}</div>}
            <button className="btn-accent" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <><span className="spinner" /> Creating account…</> : 'Create free account'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-muted)', marginTop: 20 }}>
          Have an account? <Link href="/auth/login" style={{ color: 'var(--ink)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
