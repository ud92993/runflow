const STRAVA_BASE = 'https://www.strava.com/api/v3'

// Rafraîchit le token si expiré
export async function getValidToken(profile, supabase) {
  const now = Math.floor(Date.now() / 1000)
  
  if (profile.strava_token_expires_at > now) {
    return profile.strava_access_token // Token encore valide
  }

  // Token expiré → on le rafraîchit
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: profile.strava_refresh_token,
    }),
  })

  const data = await res.json()

  // Sauvegarde les nouveaux tokens en base
  await supabase
    .from('profiles')
    .update({
      strava_access_token: data.access_token,
      strava_refresh_token: data.refresh_token,
      strava_token_expires_at: data.expires_at,
    })
    .eq('id', profile.id)

  return data.access_token
}

// Récupère les activités récentes
export async function fetchStravaActivities(accessToken, perPage = 30, page = 1) {
  const res = await fetch(
    `${STRAVA_BASE}/athlete/activities?per_page=${perPage}&page=${page}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  return res.json()
}