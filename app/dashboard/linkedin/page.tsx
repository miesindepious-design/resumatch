'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Upload, 
  FileText, 
  Clipboard, 
  ArrowLeft, 
  Linkedin,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import type { LinkedInOptimizationResult } from '@/lib/tailor'

export default function LinkedInPage() {
  const [file, setFile] = useState<File | null>(null)
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LinkedInOptimizationResult | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('is_pro, trial_end_at, has_used_trial').eq('id', user.id).single()
      setProfile(data)
    }
    load()
  }, [])

  async function extractTextFromPDF(file: File) {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    // For simplicity, we'll use a heuristic here - in real life you'd use pdf-parse
    // But since we can't easily use pdf-parse client-side, we'll send it to an API
    // Or we can use the existing /api/tailor route to extract?
    // For now, let's assume we have a way to get text (we'll handle this differently)
    return "" 
  }

  async function handleOptimize() {
    if (!file && !result) { // Need either file or existing text
      setError('Please upload your resume PDF')
      return
    }
    
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      if (file) {
        formData.append('resume', file)
      }
      formData.append('jobDescription', jobDesc)

      // First, extract text from PDF using our tailor route (or create a separate extract route)
      // Wait - actually, let's just use the same method as the main page
      // First, get the text
      let resumeText = ""
      if (file) {
        // Use our existing API to extract
        const extractRes = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData
        })

        if (!extractRes.ok) {
          const errData = await extractRes.json()
          setError(errData.error || 'Failed to extract text')
          setLoading(false)
          return
        }

        const extractData = await extractRes.json()
        resumeText = extractData.text
      }

      // Then optimize
      const res = await fetch('/api/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeText,
          jobDescription: jobDesc
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        setError(errData.error || 'Something went wrong')
        setLoading(false)
        return
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy(text: string, section: string) {
    await navigator.clipboard.writeText(text)
    setCopied(section)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <nav style={{ 
        background: 'white', 
        borderBottom: '1px solid var(--paper-3)', 
        padding: '0 32px', 
        height: 56, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
          <span className="serif" style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Linkedin size={20} style={{ color: '#0A66C2' }} /> LinkedIn Optimizer
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {!result ? (
          <div className="card" style={{ padding: 32, maxWidth: 700, margin: '0 auto' }}>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Optimize your LinkedIn profile</h2>
            <p style={{ color: 'var(--ink-muted)', marginBottom: 24 }}>
              Upload your resume and we'll optimize your LinkedIn profile for recruiters and LinkedIn's algorithm.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>Your resume (PDF)</label>
              <div
                className={`upload-zone ${drag ? 'drag-over' : ''}`}
                style={{ padding: 28, textAlign: 'center' }}
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f?.name.endsWith('.pdf')) setFile(f) }}
                onClick={() => fileRef.current?.click()}
              >
                {file ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <FileText size={20} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{file.name}</span>
                  </div>
                ) : (
                  <div>
                    <Upload size={24} style={{ color: 'var(--ink-faint)', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Drop your PDF here</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>or click to browse</div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                Target job description (optional)
              </label>
              <textarea
                rows={6}
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste the full job description here for better optimization..."
                style={{ lineHeight: 1.6 }}
              />
            </div>

            {error && (
              <div style={{ fontSize: 13, color: '#c0392b', marginBottom: 16, padding: '10px 14px', background: '#fdf2f2', borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button
              className="btn-accent"
              onClick={handleOptimize}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', fontSize: 16 }}
            >
              {loading ? <><span className="spinner" /> Optimizing profile...</> : 'Optimize LinkedIn Profile'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            <div className="card" style={{ padding: 32 }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Linkedin size={20} style={{ color: '#0A66C2' }} /> LinkedIn Headline
                  </h3>
                  <button className="btn-outline" onClick={() => handleCopy(result.headline, 'headline')} style={{ fontSize: 12, padding: '6px 12px' }}>
                    <Clipboard size={14} /> {copied === 'headline' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: 16, lineHeight: 1.6 }}>{result.headline}</p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 500 }}>About Section</h3>
                  <button className="btn-outline" onClick={() => handleCopy(result.about, 'about')} style={{ fontSize: 12, padding: '6px 12px' }}>
                    <Clipboard size={14} /> {copied === 'about' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre style={{ 
                  fontFamily: 'inherit', 
                  fontSize: 14, 
                  lineHeight: 1.7, 
                  whiteSpace: 'pre-wrap', 
                  background: 'var(--paper)', 
                  padding: 16, 
                  borderRadius: 8, 
                  margin: 0 
                }}>
                  {result.about}
                </pre>
              </div>

              {result.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 500 }}>{exp.role} at {exp.company}</h3>
                    <button className="btn-outline" onClick={() => handleCopy(exp.optimized, `exp-${i}`)} style={{ fontSize: 12, padding: '6px 12px' }}>
                      <Clipboard size={14} /> {copied === `exp-${i}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre style={{ 
                    fontFamily: 'inherit', 
                    fontSize: 14, 
                    lineHeight: 1.7, 
                    whiteSpace: 'pre-wrap', 
                    background: 'var(--paper)', 
                    padding: 16, 
                    borderRadius: 8, 
                    margin: 0 
                  }}>
                    {exp.optimized}
                  </pre>
                </div>
              ))}

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 12 }}>Skills to Add</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result.skills.map((skill, i) => (
                    <span key={i} className="badge badge-pro">{skill}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={18} style={{ color: 'var(--success)' }} /> Pro Tips
                </h3>
                <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--ink-muted)' }}>
                  {result.tips.map((tip, i) => (
                    <li key={i} style={{ marginBottom: 8, lineHeight: 1.6 }}>{tip}</li>
                  ))}
                </ul>
              </div>

              <button className="btn-outline" onClick={() => setResult(null)} style={{ width: '100%', justifyContent: 'center' }}>
                ← Optimize another profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
