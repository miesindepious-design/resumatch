import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { tailorResume } from '@/lib/tailor'
import { PDFParse } from 'pdf-parse'

const FREE_LIMIT = 3
const TRIAL_DURATION_DAYS = 14

export async function POST(req: NextRequest) {
  let parser: PDFParse | null = null
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get user profile + usage
    const { data: profile } = await supabase
      .from('profiles')
      .select('tailor_count, is_pro, trial_start_at, trial_end_at')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Check if user is in active trial
    const now = new Date()
    const isInTrial = 
      profile.trial_start_at && 
      profile.trial_end_at && 
      new Date(profile.trial_start_at) <= now && 
      new Date(profile.trial_end_at) >= now

    if (!profile.is_pro && !isInTrial && profile.tailor_count >= FREE_LIMIT) {
      return NextResponse.json({ error: 'FREE_LIMIT_REACHED', used: profile.tailor_count, limit: FREE_LIMIT }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('resume') as File | null
    const jobDescription = formData.get('jobDescription') as string

    if (!file || !jobDescription) {
      return NextResponse.json({ error: 'Missing resume or job description' }, { status: 400 })
    }

    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Please upload a PDF file' }, { status: 400 })
    }

    // Extract text from PDF using pdf-parse v2
    const buffer = Buffer.from(await file.arrayBuffer())
    parser = new PDFParse({ data: buffer })
    const parsed = await parser.getText()
    const resumeText = parsed.text?.trim()

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json({ error: 'Could not extract text from PDF. Please ensure your PDF is text-based, not scanned.' }, { status: 400 })
    }

    // Run AI tailoring
    const result = await tailorResume(resumeText, jobDescription)

    // Increment usage counter
    await supabase
      .from('profiles')
      .update({ tailor_count: (profile.tailor_count || 0) + 1 })
      .eq('id', user.id)

    // Save to history
    await supabase.from('tailor_history').insert({
      user_id: user.id,
      original_resume: resumeText,
      job_description: jobDescription,
      tailored_resume: result.tailoredResume,
      cover_letter: result.coverLetter,
      match_score: result.matchScore,
      missing_keywords: result.missingKeywords,
      improvements: result.improvements,
    })

    return NextResponse.json({
      ...result,
      usageAfter: (profile.tailor_count || 0) + 1,
      isPro: profile.is_pro,
    })
  } catch (err: any) {
    console.error('Tailor error:', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  } finally {
    if (parser) {
      await parser.destroy()
    }
  }
}
