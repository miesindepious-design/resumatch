'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="serif" style={{ fontSize: 24, textAlign: 'center', marginBottom: 40 }}>Resumatch</div>
        </Link>
        <div className="card">
          <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 24 }}>Sign in to continue tailoring</p>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <div style={{ fontSize: 13, color: '#c0392b', marginBottom: 14, padding: '8px 12px', background: '#fdf2f2', borderRadius: 6 }}>{error}</div>}
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <><span className="spinner" /> Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-muted)', marginTop: 20 }}>
          No account? <Link href="/auth/signup" style={{ color: 'var(--ink)', fontWeight: 500 }}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
