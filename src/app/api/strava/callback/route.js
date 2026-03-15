import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=strava_denied`)
  }

  // Échange le code contre des tokens Strava
  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })

  const stravaData = await tokenRes.json()

  if (stravaData.errors) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=strava_error`)
  }

  // Sauvegarde dans Supabase
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('profiles').upsert({
    id: user.id,
    strava_athlete_id: stravaData.athlete.id,
    strava_access_token: stravaData.access_token,
    strava_refresh_token: stravaData.refresh_token,
    strava_token_expires_at: stravaData.expires_at,
    full_name: `${stravaData.athlete.firstname} ${stravaData.athlete.lastname}`,
    avatar_url: stravaData.athlete.profile,
  })

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?strava=connected`)
}