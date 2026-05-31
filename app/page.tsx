'use client'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Download, Star } from 'lucide-react'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid var(--paper-3)', background: 'white' }}>
        <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, letterSpacing: '-0.5px' }}>Resumatch</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/auth/login" style={{ textDecoration: 'none' }}><button className="btn-outline" style={{ padding: '8px 18px' }}>Sign in</button></Link>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}><button className="btn-primary">Get started free</button></Link>
        </div>
      </nav>

      <section style={{ maxWidth: 760, margin: '0 auto', padding: '96px 24px 64px', textAlign: 'center' }}>
        <div className="badge badge-success" style={{ marginBottom: 24, fontSize: 13 }}>
          <Zap size={12} /> Free — 3 tailors included
        </div>
        <h1 className="serif" style={{ fontSize: 'clamp(42px, 8vw, 72px)', lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: 24 }}>
          Your resume,<br />
          <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>perfectly matched</span><br />
          to every job.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto 40px' }}>
          Upload your CV, paste the job description. Get a tailored resume and cover letter in 30 seconds — without lying.
        </p>
        <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
          <button className="btn-accent" style={{ fontSize: 16, padding: '14px 32px' }}>
            Tailor my resume free <ArrowRight size={16} />
          </button>
        </Link>
        <p style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 14 }}>No credit card required</p>
      </section>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { n: '01', title: 'Upload your CV', desc: 'Drop in your existing PDF resume — we extract everything automatically.' },
            { n: '02', title: 'Paste the job', desc: 'Copy the job description from LinkedIn, Indeed, or anywhere.' },
            { n: '03', title: 'Get tailored output', desc: 'AI rewrites and emphasises your real experience to match the role precisely.' },
          ].map(s => (
            <div className="card" key={s.n}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-faint)', letterSpacing: '0.1em', marginBottom: 10 }}>{s.n}</div>
              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'white', borderTop: '1px solid var(--paper-3)', borderBottom: '1px solid var(--paper-3)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 className="serif" style={{ fontSize: 36, textAlign: 'center', marginBottom: 48, letterSpacing: '-0.5px' }}>Everything you need to land the interview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              { icon: <Zap size={20} />, title: 'Match score', desc: 'See how well your CV fits the role before applying.' },
              { icon: <Shield size={20} />, title: 'Never fabricates', desc: "Only reframes your real experience. We don't invent skills." },
              { icon: <Star size={20} />, title: 'Cover letter', desc: 'A tailored cover letter generated alongside every resume.' },
              { icon: <Download size={20} />, title: 'Export to .docx', desc: 'Download your tailored resume as an editable Word doc.' },
            ].map(f => (
              <div key={f.title}>
                <div style={{ color: 'var(--accent)', marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontWeight: 500, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 700, margin: '0 auto', padding: '80px 24px' }}>
        <h2 className="serif" style={{ fontSize: 36, textAlign: 'center', marginBottom: 48, letterSpacing: '-0.5px' }}>Simple pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="badge badge-free" style={{ marginBottom: 16 }}>Free</div>
            <div style={{ fontSize: 36, fontWeight: 300, marginBottom: 4 }}>$0</div>
            <div style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 24 }}>forever</div>
            {['3 resume tailors', 'Cover letter included', 'Match score', 'Copy to clipboard'].map(f => (
              <div key={f} style={{ fontSize: 14, color: 'var(--ink-muted)', padding: '6px 0', borderBottom: '1px solid var(--paper-2)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--success)' }}>✓</span> {f}
              </div>
            ))}
          </div>
          <div className="card" style={{ border: '2px solid var(--ink)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
              <span className="badge badge-pro">Most popular</span>
            </div>
            <div className="badge badge-pro" style={{ marginBottom: 16 }}>Pro</div>
            <div style={{ fontSize: 36, fontWeight: 300, marginBottom: 4 }}>$15</div>
            <div style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 24 }}>per month</div>
            {['Unlimited tailors', 'Cover letter included', 'Match score', 'Download as .docx', 'Missing keywords list', 'Resume history'].map(f => (
              <div key={f} style={{ fontSize: 14, color: 'var(--ink-muted)', padding: '6px 0', borderBottom: '1px solid var(--paper-2)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--success)' }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
            <button className="btn-accent" style={{ fontSize: 15, padding: '13px 28px' }}>Start free — no card needed <ArrowRight size={15} /></button>
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--paper-3)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="serif" style={{ fontSize: 18 }}>Resumatch</span>
        <span style={{ fontSize: 13, color: 'var(--ink-faint)' }}>© 2025 Resumatch</span>
      </footer>
    </div>
  )
}
