'use client'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  function connectStrava() {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID, // ← ajoute cette var en NEXT_PUBLIC_
      redirect_uri: `${window.location.origin}/api/strava/callback`,
      response_type: 'code',
      scope: 'read,activity:read_all',
    })
    window.location.href = `https://www.strava.com/oauth/authorize?${params}`
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-6xl font-black tracking-widest text-[#e8ff57]">RUNFLOW</h1>
      <p className="text-gray-400 text-lg">Suivi de course & plans d'entraînement personnalisés</p>
      
      <button
        onClick={signInWithGoogle}
        className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition"
      >
        Créer un compte avec Google
      </button>
      
      <button
        onClick={connectStrava}
        className="bg-[#fc4c02] text-white font-semibold px-8 py-3 rounded-xl hover:bg-orange-600 transition flex items-center gap-2"
      >
        <span>Connecter Strava</span>
      </button>
    </main>
  )
}