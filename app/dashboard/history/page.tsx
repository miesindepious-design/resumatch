'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { FileText, ArrowLeft, Download, Copy } from 'lucide-react'
import Link from 'next/link'

interface TailorHistoryItem {
  id: string
  user_id: string
  original_resume: string
  job_description: string
  tailored_resume: string
  cover_letter: string
  match_score: number
  missing_keywords: string[]
  improvements: string[]
  created_at: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<TailorHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<TailorHistoryItem | null>(null)
  const [tab, setTab] = useState<'resume' | 'cover'>('resume')
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('tailor_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setHistory(data)
      }
      setLoading(false)
    }
    loadHistory()
  }, [])

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--paper-3)', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard" style={{ color: 'var(--ink-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <span className="serif" style={{ fontSize: 20 }}>Resumatch</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Resume History</span>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 16px' }}></div>
            <p>Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <FileText size={64} style={{ color: 'var(--ink-faint)', marginBottom: 24 }} />
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>No History Yet</h2>
            <p style={{ color: 'var(--ink-muted)', marginBottom: 24 }}>Tailor your first resume to start building your history!</p>
            <Link href="/dashboard">
              <button className="btn-accent">Go to Dashboard</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '350px 1fr' : '1fr', gap: 24 }}>
            {/* History List */}
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 16 }}>Your Tailoring History</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      cursor: 'pointer',
                      border: selectedItem?.id === item.id ? '2px solid var(--accent)' : '1px solid var(--paper-3)',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={16} style={{ color: 'var(--accent)' }} />
                        <span style={{ fontWeight: 500 }}>
                          {new Date(item.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: item.match_score >= 75 ? 'var(--success-light)' : item.match_score >= 50 ? 'var(--warning-light)' : 'var(--accent-light)',
                          color: item.match_score >= 75 ? 'var(--success)' : item.match_score >= 50 ? 'var(--warning)' : 'var(--accent)',
                        }}
                      >
                        {item.match_score}%
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 4 }}>
                      {item.job_description.slice(0, 80)}{item.job_description.length > 80 ? '...' : ''}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {item.missing_keywords.slice(0, 3).map((kw, idx) => (
                        <span key={idx} className="badge" style={{ background: 'var(--paper-2)', fontSize: 11 }}>
                          {kw}
                        </span>
                      ))}
                      {item.missing_keywords.length > 3 && (
                        <span className="badge" style={{ background: 'var(--paper-2)', fontSize: 11 }}>
                          +{item.missing_keywords.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Item View */}
            {selectedItem && (
              <div className="fade-up">
                <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: selectedItem.match_score >= 75 ? 'var(--success-light)' : selectedItem.match_score >= 50 ? 'var(--warning-light)' : 'var(--accent-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: 18, fontWeight: 600,
                      color: selectedItem.match_score >= 75 ? 'var(--success)' : selectedItem.match_score >= 50 ? 'var(--warning)' : 'var(--accent)',
                    }}>
                      {selectedItem.match_score}%
                    </span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>Match Score</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                      {selectedItem.match_score >= 75 ? 'Strong match!' : selectedItem.match_score >= 50 ? 'Good fit' : 'Consider adding more keywords'}
                    </div>
                  </div>
                </div>

                {selectedItem.improvements.length > 0 && (
                  <div className="card" style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Improvements Made</div>
                    {selectedItem.improvements.map((imp, idx) => (
                      <div key={idx} style={{ fontSize: 13, color: 'var(--ink-muted)', padding: '4px 0', display: 'flex', gap: 8 }}>
                        <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span> {imp}
                      </div>
                    ))}
                  </div>
                )}

                {selectedItem.missing_keywords.length > 0 && (
                  <div className="card" style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Keywords to Add (if truthful)</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedItem.missing_keywords.map((kw, idx) => (
                        <span key={idx} className="badge" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card">
                  <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: 'var(--paper-2)', borderRadius: 8, padding: 3 }}>
                    <button key="resume" onClick={() => setTab('resume')} style={{
                      flex: 1, padding: '7px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                      background: tab === 'resume' ? 'white' : 'transparent',
                      color: tab === 'resume' ? 'var(--ink)' : 'var(--ink-muted)',
                      boxShadow: tab === 'resume' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s',
                    }}>
                      📄 Tailored Resume
                    </button>
                    <button key="cover" onClick={() => setTab('cover')} style={{
                      flex: 1, padding: '7px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                      background: tab === 'cover' ? 'white' : 'transparent',
                      color: tab === 'cover' ? 'var(--ink)' : 'var(--ink-muted)',
                      boxShadow: tab === 'cover' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s',
                    }}>
                      ✉️ Cover Letter
                    </button>
                  </div>

                  <pre style={{
                    fontFamily: 'DM Sans, sans-serif', fontSize: 13, lineHeight: 1.7,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    maxHeight: 400, overflowY: 'auto',
                    color: 'var(--ink)', margin: 0,
                    background: 'var(--paper)', borderRadius: 8, padding: 16,
                  }}>
                    {tab === 'resume' ? selectedItem.tailored_resume : selectedItem.cover_letter}
                  </pre>

                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button className="btn-outline" onClick={() => handleCopy(tab === 'resume' ? selectedItem.tailored_resume : selectedItem.cover_letter)} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                      <Copy size={14} /> {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                    <Link href="/dashboard" style={{ flex: 1, textDecoration: 'none' }}>
                      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                        ← Tailor Another
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}