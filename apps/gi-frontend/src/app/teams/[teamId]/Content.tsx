'use client'
import { Container, Skeleton } from '@mui/material'
import { Suspense, useState } from 'react'
import { useSupabase } from '../../../utils/supabase/client'
import type { Characters } from '../../characters/getCharacters'
import type { Loadouts } from '../getLoadouts'
import { TeamContent } from './TeamContent'
import type { Team } from './getTeam'

export default function Content({
  team: serverTeam,
  characters: serverCharacters,
  loadouts: serverLoadouts,
  accountId,
}: {
  team: Team
  characters: Characters
  loadouts: Loadouts
  accountId: string
}) {
  const supabase = useSupabase()
  const [team, setTeam] = useState(serverTeam)
  const [loadouts, setLoadouts] = useState(serverLoadouts)
  const [characters, setCharacters] = useState(serverCharacters)
  return (
    <Container>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <TeamContent
          accountId={accountId}
          team={team}
          loadouts={loadouts}
          characters={characters}
        />
      </Suspense>
    </Container>
  )
}
