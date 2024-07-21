import { redirect } from 'next/navigation'
import { getSupabase } from '../../utils/supabase/server'
import getProfile from '../util/getProfile'
import getUser from '../util/getUser'
import Content from './Content'
import getArtifacts from './getArtifacts'

export default async function Artifacts() {
  const supabase = getSupabase()
  const user = await getUser(supabase)
  const profile = await getProfile(supabase, user)
  if (!profile?.active_account) redirect('/profile')
  const artifacts = await getArtifacts(supabase, profile?.active_account)
  if (!artifacts) return null
  return <Content artifacts={artifacts} accountId={profile?.active_account} />
}
