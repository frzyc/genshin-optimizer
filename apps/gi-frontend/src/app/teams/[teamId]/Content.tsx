'use client'
import { Container, Skeleton } from '@mui/material'
import { Suspense, useState } from 'react'
import type { Characters } from '../../characters/getCharacters'
import type { Loadouts } from '../getLoadouts'
import { TeamCharacter } from './TeamCharacter'
import { TeamContent } from './TeamContent'
import { TeamContext } from './TeamContext'
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
  const [team] = useState(serverTeam)
  const [loadouts] = useState(serverLoadouts)
  const [characters] = useState(serverCharacters)

  return (
    <Container>
      <TeamContext.Provider value={team}>
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
          <TeamCharacter />
        </Suspense>
      </TeamContext.Provider>
    </Container>
  )
}
