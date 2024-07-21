import { redirect } from 'next/navigation'
import { getSupabase } from '../../../utils/supabase/server'
import getCharacters from '../../characters/getCharacters'
import getProfile from '../../util/getProfile'
import getUser from '../../util/getUser'
import getLoadouts from '../getLoadouts'
import Content from './Content'
import getTeam from './getTeam'

export default async function Teams({
  params: { teamId },
}: {
  params: { teamId: string }
}) {
  const supabase = getSupabase()
  const user = await getUser(supabase)
  const profile = await getProfile(supabase, user)
  if (!profile?.active_account) redirect('/profile')
  const teams = await getTeam(supabase, profile?.active_account, teamId)
  if (!teams) return null
  const loadouts = await getLoadouts(supabase, profile?.active_account)
  if (!loadouts) return null
  const characters = await getCharacters(supabase, profile?.active_account)
  if (!characters) return null
  return (
    <Content
      team={teams}
      loadouts={loadouts}
      characters={characters}
      accountId={profile?.active_account}
    />
  )
}
