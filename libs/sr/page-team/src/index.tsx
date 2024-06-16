import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  TeamCharacterSelector,
  useDatabaseContext,
} from '@genshin-optimizer/sr/ui'
import { Box, Skeleton } from '@mui/material'
import { Suspense, useEffect, useMemo } from 'react'
import { Navigate, useMatch, useNavigate, useParams } from 'react-router-dom'

const fallback = <Skeleton variant="rectangular" width="100%" height={1000} />

export default function PageTeam() {
  const { database } = useDatabaseContext()
  const { teamId } = useParams<{ teamId?: string }>()
  const invalidKey = !teamId || !database.teams.keys.includes(teamId)

  // An edit is triggered whenever a team gets opened even if no edits are done
  useEffect(() => {
    if (invalidKey) return
    database.teams.set(teamId, { lastEdit: Date.now() })
  }, [teamId, database.teams, invalidKey])

  if (invalidKey) return <Navigate to="/teams" />

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Suspense fallback={fallback}>
        {teamId && <Page teamId={teamId} />}
      </Suspense>
    </Box>
  )
}

function Page({ teamId }: { teamId: string }) {
  const { database } = useDatabaseContext()
  const navigate = useNavigate()

  const team = database.teams.get(teamId)!
  const { loadoutData } = team
  // use the current URL as the "source of truth" for characterKey and tab.
  const {
    params: { characterKey: characterKeyRaw },
  } = useMatch({ path: '/teams/:teamId/:characterKey', end: false }) ?? {
    params: {},
  }
  const {
    params: { tab },
  } = useMatch({ path: '/teams/:teamId/:characterKey/:tab' }) ?? {
    params: {},
  }

  // validate characterKey
  const loadoutDatum = useMemo(() => {
    const loadoutDatum = loadoutData.find(
      (loadoutDatum) =>
        loadoutDatum?.teamCharId &&
        database.teamChars.get(loadoutDatum.teamCharId)?.key === characterKeyRaw
    )

    return loadoutDatum
  }, [loadoutData, database.teamChars, characterKeyRaw])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])
  useEffect(() => {
    if (!loadoutDatum) navigate('', { replace: true })
  }, [loadoutDatum, navigate])

  const teamCharId = loadoutDatum?.teamCharId
  const characterKey = database.teamChars.get(teamCharId)?.key

  return (
    <Box
      sx={{ display: 'flex', gap: 1, flexDirection: 'column', mx: 1, mt: 2 }}
    >
      <CardThemed>
        <TeamCharacterSelector
          teamId={teamId}
          charKey={characterKey}
          tab={tab}
        />
      </CardThemed>
    </Box>
  )
}
