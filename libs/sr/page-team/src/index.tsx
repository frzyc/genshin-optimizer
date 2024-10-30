import { CardThemed, useTitle } from '@genshin-optimizer/common/ui'
import {
  CharacterContext,
  useCharacter,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/sr/db-ui'
import { Box, Skeleton } from '@mui/material'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Navigate,
  Route,
  Routes,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { TeamCalcProvider } from './TeamCalcProvider'
import { TeamCharacterSelector } from './TeamCharacterSelector'
import TeammateDisplay from './TeammateDisplay'
import type { PresetContextObj, TeamContextObj } from './context'
import { PresetContext, TeamContext, useTeamContext } from './context'

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
  const navigate = useNavigate()
  const [presetIndex, setPresetIndex] = useState(0)
  const presetObj = useMemo(
    () =>
      ({
        presetIndex,
        setPresetIndex,
      } as PresetContextObj),
    [presetIndex, setPresetIndex]
  )
  const team = useTeam(teamId)!
  const { teamMetadata } = team
  // use the current URL as the "source of truth" for characterKey.
  const {
    params: { characterKey: characterKeyRaw },
  } = useMatch({ path: '/teams/:teamId/:characterKey', end: false }) ?? {
    params: {},
  }

  // validate characterKey
  const teamMetadatumIndex = useMemo(() => {
    const index = teamMetadata.findIndex(
      (teammateDatum) =>
        teammateDatum && teammateDatum.characterKey === characterKeyRaw
    )
    if (index === -1) return 0
    return index
  }, [teamMetadata, characterKeyRaw])
  const teammateDatum = useMemo(
    () => teamMetadata[teamMetadatumIndex],
    [teamMetadata, teamMetadatumIndex]
  )
  const characterKey = teammateDatum?.characterKey
  useEffect(() => {
    if (characterKey && characterKey !== characterKeyRaw)
      navigate(`${characterKey}`, { replace: true })
  }, [characterKey, characterKeyRaw, teammateDatum, navigate])

  const { t } = useTranslation(['charNames_gen', 'page_character'])

  useTitle(
    useMemo(() => {
      const charName = characterKey
        ? // TODO: replace Character with CharKeyToName function once it's ported
          t('charNames_gen:Character')
        : t('Team Settings')
      return `${team.name} - ${charName}`
    }, [characterKey, t, team.name])
  )

  const teamContextObj: TeamContextObj | undefined = useMemo(() => {
    if (!teamId || !team || !teammateDatum) return undefined
    return {
      teamId,
      team,
      teammateDatum,
    }
  }, [teammateDatum, team, teamId])

  return (
    <PresetContext.Provider value={presetObj}>
      <TeamCalcProvider teamId={teamId} currentChar={characterKey}>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexDirection: 'column',
            mx: 1,
            mt: 2,
          }}
        >
          <CardThemed
            sx={{
              overflow: 'visible',
              top: 0,
              position: 'sticky',
              zIndex: 100,
            }}
          >
            <TeamCharacterSelector teamId={teamId} charKey={characterKey} />
          </CardThemed>
          <Box
          // sx={(theme) => {
          //   const elementKey = characterKey && allStats.char[characterKey]
          //   if (!elementKey) return {}
          //   const hex = theme.palette[elementKey].main as string
          //   const color = hexToColor(hex)
          //   if (!color) return {}
          //   const rgba = colorToRgbaString(color, 0.1)
          //   return {
          //     background: `linear-gradient(to bottom, ${rgba} 0%, rgba(0,0,0,0)) 25%`,
          //   }
          // }}
          >
            {teamContextObj && (
              <TeamContext.Provider value={teamContextObj}>
                <TeammateDisplayWrapper />
              </TeamContext.Provider>
            )}
          </Box>
        </Box>
      </TeamCalcProvider>
    </PresetContext.Provider>
  )
}

function TeammateDisplayWrapper() {
  const {
    teammateDatum: { characterKey },
  } = useTeamContext()
  const character = useCharacter(characterKey)
  if (!character)
    return <Skeleton variant="rectangular" width="100%" height={1000} />

  return (
    <CharacterContext.Provider value={character}>
      <Routes>
        <Route path=":characterKey">
          <Route path="*" index element={<TeammateDisplay />} />
        </Route>
      </Routes>
    </CharacterContext.Provider>
  )
}
