'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  Crown,
  Zap,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Star
} from 'lucide-react'
import Link from 'next/link'

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_pro, has_used_trial')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    load()
  }, [])

  async function handleUpgrade() {
    setLoading(true)
    const res = await fetch('/api/stripe', { method: 'POST' })
    const { url } = await res.json()
    if (url) {
      window.location.href = url
    } else {
      setLoading(false)
    }
  }

  async function handleStartTrial() {
    setLoading(true)
    try {
      const res = await fetch('/api/trial/start', { method: 'POST' })
      if (res.ok) {
        router.push('/dashboard')
      }
    } catch {
      setLoading(false)
    }
  }

  const testimonials = [
    { name: "Sarah K.", role: "Marketing Manager", text: "Got 3 interviews in the first week after using Resumatch!", rating: 5 },
    { name: "Mike T.", role: "Software Engineer", text: "The AI tailoring is incredible - saved me hours!", rating: 5 },
    { name: "Emily R.", role: "HR Professional", text: "ATS checker helped me fix issues I didn't even know I had!", rating: 5 }
  ]

  const features = [
    { name: "Unlimited resume tailoring", free: false, pro: true },
    { name: "AI cover letter generator", free: true, pro: true },
    { name: "ATS optimization checker", free: true, pro: true },
    { name: "Multiple resume templates", free: false, pro: true },
    { name: "Full history & saved resumes", free: false, pro: true },
    { name: "Download as .docx", free: false, pro: true },
    { name: "Priority support", free: false, pro: true },
    { name: "3 free tailors", free: true, pro: true }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        background: 'white',
        borderBottom: '1px solid var(--paper-3)',
        padding: '0 32px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link href="/dashboard" style={{
          textDecoration: 'none',
          color: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13
        }}>
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
        <span className="serif" style={{ fontSize: 20 }}>Resumatch</span>
        <div style={{ width: 100 }} />
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 className="serif" style={{ fontSize: 48, marginBottom: 16, letterSpacing: '-1px' }}>
            Get hired faster with Resumatch Pro
          </h1>
          <p style={{ fontSize: 20, color: 'var(--ink-muted)', maxWidth: 600, margin: '0 auto' }}>
            Stop tweaking your resume manually. Let AI tailor it perfectly for every job you apply to.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          marginBottom: 48
        }}>
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <div className="badge badge-free" style={{ display: 'inline-flex', marginBottom: 24, fontSize: 16 }}>
              Free
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 48, fontWeight: 300, marginBottom: 4 }}>$0</div>
              <div style={{ color: 'var(--ink-muted)' }}>forever</div>
            </div>
            <div style={{ textAlign: 'left', marginBottom: 32 }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: '8px 0',
                  fontSize: 14,
                  borderBottom: i < features.length - 1 ? '1px solid var(--paper-2)' : 'none'
                }}>
                  {f.free ? (
                    <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                  ) : (
                    <XCircle size={16} style={{ color: 'var(--ink-muted)' }} />
                  )}
                  <span style={{ color: f.free ? 'var(--ink)' : 'var(--ink-muted)' }}>
                    {f.name}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                Continue with Free
              </button>
            </Link>
          </div>

          <div className="card" style={{
            padding: 32,
            textAlign: 'center',
            border: '3px solid var(--accent)',
            boxShadow: '0 10px 40px -15px rgba(212, 98, 42, 0.2)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: -14,
              left: '50%',
              transform: 'translateX(-50%)'
            }}>
              <span className="badge badge-pro">Most Popular</span>
            </div>
            <div className="badge badge-pro" style={{ display: 'inline-flex', marginBottom: 24, fontSize: 16 }}>
              <Crown size={16} />
              Pro
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 48, fontWeight: 300, marginBottom: 4 }}>$15</div>
              <div style={{ color: 'var(--ink-muted)' }}>per month</div>
            </div>
            <div style={{ textAlign: 'left', marginBottom: 32 }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: '8px 0',
                  fontSize: 14,
                  borderBottom: i < features.length - 1 ? '1px solid var(--paper-2)' : 'none'
                }}>
                  <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--ink)' }}>{f.name}</span>
                </div>
              ))}
            </div>

            {!profile?.is_pro && !profile?.has_used_trial ? (
              <button
                className="btn-accent"
                onClick={handleStartTrial}
                disabled={loading}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: 16,
                  padding: '14px 28px'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Starting Trial...
                  </>
                ) : (
                  'Start 14-day Free Trial'
                )}
              </button>
            ) : (
              <button
                className="btn-accent"
                onClick={handleUpgrade}
                disabled={loading}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: 16,
                  padding: '14px 28px'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Redirecting...
                  </>
                ) : (
                  'Upgrade to Pro'
                )}
              </button>
            )}
            <p style={{
              fontSize: 12,
              color: 'var(--ink-muted)',
              marginTop: 12
            }}>
              Powered by Stripe. Cancel anytime.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 className="serif" style={{ fontSize: 28, textAlign: 'center', marginBottom: 32 }}>
            What our users say
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24
          }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 16 }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600
                  }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
