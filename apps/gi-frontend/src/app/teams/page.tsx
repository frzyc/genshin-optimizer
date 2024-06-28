import type { Tables } from '@genshin-optimizer/gi/supabase'
import { redirect } from 'next/navigation'
import { getSupabase } from '../../utils/supabase/server'
import getProfile from '../util/getProfile'
import getUser from '../util/getUser'
import Content from './Content'
import getTeams from './getTeams'

export default async function Teams() {
  const supabase = getSupabase()
  const user = await getUser(supabase)
  const profile = await getProfile(supabase, user)
  if (!profile?.active_account) redirect('/profile')
  const teams = (await getTeams(supabase, profile?.active_account)) ?? []
  return (
    <Content
      teams={teams as Array<Tables<'teams'>>}
      accountId={profile?.active_account}
    />
  )
}
