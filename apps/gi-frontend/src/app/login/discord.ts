'use server'
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export async function discordOAuth() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback',
    },
  })
  console.log({ data, error })
  if (data.url) {
    redirect(data.url) // use the redirect API for your server framework
  }
}
