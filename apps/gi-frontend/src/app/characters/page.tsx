import type { Tables } from '@genshin-optimizer/gi/supabase'
import { redirect } from 'next/navigation'
import { getSupabase } from '../../utils/supabase/server'
import getProfile from '../util/getProfile'
import getUser from '../util/getUser'
import Content from './Content'
import getCharacters from './getCharacters'

export default async function Characters() {
  const supabase = getSupabase()
  const user = await getUser(supabase)
  const profile = await getProfile(supabase, user)
  if (!profile?.active_account) redirect('/profile')
  const characters = await getCharacters(supabase, profile?.active_account)
  return (
    <Content
      characters={characters as Array<Tables<'characters'>>}
      accountId={profile?.active_account}
    />
  )
}
