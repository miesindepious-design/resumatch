import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if user has already used trial
    const { data: profile } = await supabase.from('profiles').select('has_used_trial, trial_end_at').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    if (profile.has_used_trial && !profile.trial_end_at) {
      return NextResponse.json({ error: 'Trial already used' }, { status: 400 })
    }

    // Start trial (14 days)
    const trialStart = new Date()
    const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000)

    await supabase.from('profiles').update({
      trial_start_at: trialStart.toISOString(),
      trial_end_at: trialEnd.toISOString(),
      has_used_trial: true
    }).eq('id', user.id)

    return NextResponse.json({ 
      success: true,
      trialStartAt: trialStart.toISOString(),
      trialEndAt: trialEnd.toISOString(),
      daysLeft: 14
    })
  } catch (err) {
    console.error('Trial start error:', err)
    return NextResponse.json({ error: 'Failed to start trial' }, { status: 500 })
  }
}
