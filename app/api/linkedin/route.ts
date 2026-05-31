import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { optimizeLinkedIn } from '@/lib/tailor'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro, trial_end_at, has_used_trial')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    let isEligible = profile.is_pro
    if (!isEligible && profile.trial_end_at) {
      const now = new Date()
      const trialEnd = new Date(profile.trial_end_at)
      if (now <= trialEnd) {
        isEligible = true
      }
    }

    if (!isEligible) {
      return NextResponse.json({ error: 'Pro or free trial required' }, { status: 403 })
    }

    const body = await req.json()
    const resumeText = body.resumeText as string
    const jobDescription = body.jobDescription as string | undefined

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
    }

    const result = await optimizeLinkedIn(resumeText, jobDescription)

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('LinkedIn optimization error:', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}
