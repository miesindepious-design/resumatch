import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase';

// Verify LemonSqueezy webhook signature
function verifyWebhook(req: NextRequest, rawBody: string) {
  const signature = req.headers.get('x-signature');
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');
  
  return digest === signature;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  
  if (!verifyWebhook(req, rawBody)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = await createServerSupabaseClient();

  if (event.meta.event_name === 'order_created') {
    const userId = event.meta.custom_data?.user_id;
    if (userId) {
      await supabase.from('profiles').update({
        is_pro: true,
      }).eq('id', userId);
    }
  }

  if (event.meta.event_name === 'subscription_cancelled') {
    const userId = event.meta.custom_data?.user_id;
    if (userId) {
      await supabase.from('profiles').update({
        is_pro: false,
      }).eq('id', userId);
    }
  }

  return NextResponse.json({ received: true });
}
