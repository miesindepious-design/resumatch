'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  Upload, FileText, Clipboard, Download, LogOut,
  ChevronRight, X, CheckCircle, AlertTriangle, Zap, Crown
} from 'lucide-react'
import Link from 'next/link'

interface TailorResult {
  tailoredResume: string
  coverLetter: string
  matchScore: number
  missingKeywords: string[]
  improvements: string[]
  usageAfter: number
  isPro: boolean
}

interface Profile {
  tailor_count: number
  is_pro: boolean
  email: string
  trial_start_at?: string
  trial_end_at?: string
  has_used_trial?: boolean
}

interface ATSIssue {
  type: 'error' | 'warning' | 'success'
  title: string
  description: string
}

function checkATSOptimization(text: string): ATSIssue[] {
  const issues: ATSIssue[] = []

  // Check for tables (common ATS issue)
  if (text.includes('|') || text.match(/Table \d+/i)) {
    issues.push({
      type: 'error',
      title: 'Possible Table Detected',
      description: 'ATS systems often struggle with tables. Use lists or sections instead.',
    })
  }

  // Check for headers
  const hasStandardHeaders = /(Experience|Education|Skills|Projects|Summary|Objective)/i.test(text)
  if (!hasStandardHeaders) {
    issues.push({
      type: 'warning',
      title: 'Missing Standard Section Headers',
      description: 'Include standard headers like "Experience", "Education", "Skills" to help ATS parse your resume.',
    })
  } else {
    issues.push({
      type: 'success',
      title: 'Standard Section Headers Found',
      description: 'Great! Your resume uses standard sections ATS recognizes.',
    })
  }

  // Check length
  const wordCount = text.trim().split(/\s+/).length
  if (wordCount < 200) {
    issues.push({
      type: 'warning',
      title: 'Resume Might Be Too Short',
      description: 'Your resume is under 200 words. Consider adding more detail about your experience.',
    })
  } else if (wordCount > 800) {
    issues.push({
      type: 'warning',
      title: 'Resume Might Be Too Long',
      description: 'Your resume is over 800 words. Keep it concise (1-2 pages).',
    })
  } else {
    issues.push({
      type: 'success',
      title: 'Good Resume Length',
      description: 'Perfect! Your resume is at an ideal length.',
    })
  }

  // Check for dates
  const hasDates = /(19|20)\d{2}/.test(text)
  if (!hasDates) {
    issues.push({
      type: 'error',
      title: 'Missing Dates',
      description: 'Include dates for your experience and education to help ATS and recruiters.',
    })
  } else {
    issues.push({
      type: 'success',
      title: 'Dates Found',
      description: 'Great! Your resume includes dates for experience/education.',
    })
  }

  // Check for special characters that might break ATS
  const specialChars = /[★☆✓•●○◦▸►▶➤→]/g
  if (specialChars.test(text)) {
    issues.push({
      type: 'warning',
      title: 'Special Characters Detected',
      description: 'Stick to simple bullet points (hyphens, asterisks) to avoid ATS issues.',
    })
  }

  return issues
}

const FREE_LIMIT = 3

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TailorResult | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'resume' | 'cover'>('resume')
  const [copied, setCopied] = useState(false)
  const [drag, setDrag] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'professional' | 'simple' | 'creative' | 'elegant'>('modern')
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('tailor_count, is_pro, trial_start_at, trial_end_at, has_used_trial').eq('id', user.id).single()
      setProfile({ 
        tailor_count: data?.tailor_count ?? 0, 
        is_pro: data?.is_pro ?? false, 
        email: user.email ?? '',
        trial_start_at: data?.trial_start_at,
        trial_end_at: data?.trial_end_at,
        has_used_trial: data?.has_used_trial
      })
    }
    load()
  }, [])

  // Calculate trial days left
  function getTrialDaysLeft() {
    if (!profile?.trial_end_at) return null
    const now = new Date()
    const trialEnd = new Date(profile.trial_end_at)
    const diffTime = trialEnd.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  async function handleStartTrial() {
    try {
      const res = await fetch('/api/trial/start', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        // Refresh profile data
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profileData } = await supabase.from('profiles').select('tailor_count, is_pro, trial_start_at, trial_end_at, has_used_trial').eq('id', user.id).single()
          setProfile({ 
            tailor_count: profileData?.tailor_count ?? 0, 
            is_pro: profileData?.is_pro ?? false, 
            email: user.email ?? '',
            trial_start_at: profileData?.trial_start_at,
            trial_end_at: profileData?.trial_end_at,
            has_used_trial: profileData?.has_used_trial
          })
        }
      }
    } catch (err) {
      console.error('Failed to start trial:', err)
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith('.pdf')) setFile(f)
    else setError('Please drop a PDF file.')
  }, [])

  async function handleTailor() {
    if (!file || !jobDesc.trim()) { setError('Please upload your resume and paste a job description.'); return }
    setLoading(true); setError(''); setResult(null)
    const fd = new FormData()
    fd.append('resume', file)
    fd.append('jobDescription', jobDesc)
    try {
      const res = await fetch('/api/tailor', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'FREE_LIMIT_REACHED') {
          router.push('/upgrade')
        } else {
          setError(data.error || 'Something went wrong')
        }
        return
      }
      setResult(data)
      if (profile) setProfile({ ...profile, tailor_count: data.usageAfter, is_pro: data.isPro })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownload() {
    if (!result) return
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: result.tailoredResume, template: selectedTemplate }),
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `tailored-resume-${selectedTemplate}.docx`; a.click()
    URL.revokeObjectURL(url)
  }

  const usageLeft = profile ? Math.max(0, FREE_LIMIT - profile.tailor_count) : FREE_LIMIT
  const atLimit = profile && !profile.is_pro && profile.tailor_count >= FREE_LIMIT

  const scoreColor = (s: number) => s >= 75 ? 'var(--success)' : s >= 50 ? 'var(--warning)' : 'var(--accent)'
  const scoreBg = (s: number) => s >= 75 ? 'var(--success-light)' : s >= 50 ? 'var(--warning-light)' : 'var(--accent-light)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      {/* Top nav */}
      <nav style={{ background: 'white', borderBottom: '1px solid var(--paper-3)', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span className="serif" style={{ fontSize: 20 }}>Resumatch</span>
          <Link href="/dashboard" style={{ textDecoration: 'none', fontSize: 13, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Resume Tailor
          </Link>
          <Link href="/dashboard/history" style={{ textDecoration: 'none', fontSize: 13, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={14} /> History
          </Link>
          <Link href="/dashboard/linkedin" style={{ textDecoration: 'none', fontSize: 13, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            LinkedIn Optimizer
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {(() => {
                const trialDaysLeft = getTrialDaysLeft()
                if (profile.is_pro) {
                  return <span className="badge badge-pro"><Crown size={11} /> Pro</span>
                } else if (trialDaysLeft !== null && trialDaysLeft > 0) {
                  return <span className="badge badge-success"><span style={{display:'flex',gap:4,alignItems:'center'}}><Crown size={11} /> {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} left</span></span>
                } else if (!profile.has_used_trial) {
                  return <span className="badge badge-free">Free Trial Available!</span>
                } else {
                  return <span className="badge badge-free">{usageLeft}/{FREE_LIMIT} free left</span>
                }
              })()}
              <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{profile.email}</span>
            </div>
          )}
          {!profile?.is_pro && getTrialDaysLeft() === null && !profile?.has_used_trial && (
            <button 
              className="btn-accent" 
              onClick={handleStartTrial} 
              style={{ padding: '7px 14px', fontSize: 13 }}
            >
              Start Free Trial
            </button>
          )}
          {!profile?.is_pro && (
            <Link href="/upgrade" style={{ textDecoration: 'none' }}>
              <button className={getTrialDaysLeft() === null && !profile?.has_used_trial ? "btn-outline" : "btn-accent"} style={{ padding: '7px 14px', fontSize: 13 }}>
                <Crown size={13} /> Upgrade
              </button>
            </Link>
          )}
          <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 24, transition: 'all 0.3s' }}>

        {/* Input panel */}
        <div>
          {atLimit && (
            <div style={{ background: 'var(--accent-light)', border: '1px solid #e8a87a', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <AlertTriangle size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Free limit reached</div>
                <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>You've used all 3 free tailors. <Link href="/upgrade" style={{ color: 'var(--accent)', fontWeight: 500 }}>Upgrade to Pro</Link> for unlimited access.</div>
              </div>
            </div>
          )}

          {/* Upload zone */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>Your resume (PDF)</label>
            <div
              className={`upload-zone ${drag ? 'drag-over' : ''}`}
              style={{ padding: 28, textAlign: 'center' }}
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <FileText size={20} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{file.name}</span>
                  <button onClick={e => { e.stopPropagation(); setFile(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', display: 'flex' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={24} style={{ color: 'var(--ink-faint)', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Drop your PDF here</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>or click to browse — must be text-based, not scanned</div>
                </>
              )}
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
            </div>
          </div>

          {/* Job description */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>Job description</label>
            <textarea
              rows={12}
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste the full job description here — include responsibilities, requirements, and any keywords that matter..."
              style={{ lineHeight: 1.6 }}
            />
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4 }}>
              {jobDesc.length} characters — more detail = better match
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 13, color: '#c0392b', marginBottom: 16, padding: '10px 14px', background: '#fdf2f2', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <button
            className="btn-accent"
            onClick={handleTailor}
            disabled={loading || !!atLimit}
            style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px' }}
          >
            {loading ? (
              <><span className="spinner" /> Tailoring your resume…</>
            ) : (
              <><Zap size={16} /> Tailor my resume {!profile?.is_pro && `(${usageLeft} left)`}</>
            )}
          </button>
        </div>

        {/* Results panel */}
        {result && (
          <div className="fade-up">
            {/* Match score */}
            <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: scoreBg(result.matchScore),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: scoreColor(result.matchScore) }}>{result.matchScore}%</span>
              </div>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Match score</div>
                <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                  {result.matchScore >= 75 ? 'Strong match — great fit for this role.' : result.matchScore >= 50 ? 'Decent fit — consider adding some keywords.' : 'Low match — this role may need more targeted experience.'}
                </div>
              </div>
            </div>

            {/* Improvements */}
            {result.improvements.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={14} style={{ color: 'var(--success)' }} /> What we improved
                </div>
                {result.improvements.map((imp, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--ink-muted)', padding: '5px 0', borderBottom: i < result.improvements.length - 1 ? '1px solid var(--paper-2)' : 'none', display: 'flex', gap: 8 }}>
                    <ChevronRight size={13} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent)' }} /> {imp}
                  </div>
                ))}
              </div>
            )}

            {/* Missing keywords */}
            {result.missingKeywords.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} style={{ color: 'var(--warning)' }} /> Keywords to add if truthful
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.missingKeywords.map(k => (
                    <span key={k} className="badge badge-warning">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ATS Optimization Checker */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={14} style={{ color: 'var(--accent)' }} /> ATS Optimization Check
              </div>
              {checkATSOptimization(result.tailoredResume).map((issue, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: i < checkATSOptimization(result.tailoredResume).length - 1 ? '1px solid var(--paper-2)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {issue.type === 'error' && <AlertTriangle size={14} style={{ color: '#c0392b', flexShrink: 0 }} />}
                    {issue.type === 'warning' && <AlertTriangle size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />}
                    {issue.type === 'success' && <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />}
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{issue.title}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginLeft: 22 }}>{issue.description}</p>
                </div>
              ))}
            </div>

            {/* Resume Template Selector (only for Pro users) */}
            {result?.isPro && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
                  Choose Resume Template
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { id: 'modern', label: 'Modern', desc: 'Clean with blue accents' },
                    { id: 'professional', label: 'Professional', desc: 'Formal all-caps headings' },
                    { id: 'simple', label: 'Simple', desc: 'Minimal and clean' },
                    { id: 'creative', label: 'Creative', desc: 'Orange accents, unique style' },
                    { id: 'elegant', label: 'Elegant', desc: 'Purple accents, serif feel' },
                  ].map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id as any)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: selectedTemplate === template.id ? '2px solid var(--accent)' : '1px solid var(--paper-3)',
                        background: selectedTemplate === template.id ? 'var(--accent-light)' : 'white',
                        color: 'var(--ink)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      <div>{template.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{template.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resume + cover letter tabs */}
            <div className="card">
              <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: 'var(--paper-2)', borderRadius: 8, padding: 3 }}>
                {(['resume', 'cover'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    flex: 1, padding: '7px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    background: tab === t ? 'white' : 'transparent',
                    color: tab === t ? 'var(--ink)' : 'var(--ink-muted)',
                    boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s',
                  }}>
                    {t === 'resume' ? '📄 Tailored resume' : '✉️ Cover letter'}
                  </button>
                ))}
              </div>

              <pre style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, lineHeight: 1.7,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                maxHeight: 380, overflowY: 'auto',
                color: 'var(--ink)', margin: 0,
                background: 'var(--paper)', borderRadius: 8, padding: 16,
              }}>
                {tab === 'resume' ? result.tailoredResume : result.coverLetter}
              </pre>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn-outline" onClick={() => handleCopy(tab === 'resume' ? result.tailoredResume : result.coverLetter)} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                  <Clipboard size={14} /> {copied ? 'Copied!' : 'Copy text'}
                </button>
                {result.isPro ? (
                  <button className="btn-primary" onClick={handleDownload} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                    <Download size={14} /> Download .docx
                  </button>
                ) : (
                  <Link href="/upgrade" style={{ textDecoration: 'none', flex: 1 }}>
                    <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                      <Crown size={13} /> Download (Pro)
                    </button>
                  </Link>
                )}
              </div>
            </div>

            <button className="btn-outline" onClick={() => setResult(null)} style={{ width: '100%', justifyContent: 'center', marginTop: 12, fontSize: 13 }}>
              ← Tailor another job
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
