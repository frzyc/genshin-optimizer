import type { Tables } from '@genshin-optimizer/gi/supabase'
import { redirect } from 'next/navigation'
import { getSupabase } from '../../utils/supabase/server'
import getProfile from '../util/getProfile'
import getUser from '../util/getUser'
import Content from './Content'
import getWeapons from './getWeapons'

export default async function Weapons() {
  const supabase = getSupabase()
  const user = await getUser(supabase)
  const profile = await getProfile(supabase, user)
  if (!profile?.active_account) redirect('/profile')
  const weapons = await getWeapons(supabase, profile?.active_account)
  return (
    <Content
      weapons={weapons as Array<Tables<'weapons'>>}
      accountId={profile?.active_account}
    />
  )
}
