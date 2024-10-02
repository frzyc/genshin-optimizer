import { CardThemed, useTitle } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { members } from '@genshin-optimizer/sr/formula'
import type {
  CharacterContextObj,
  LoadoutContextObj,
} from '@genshin-optimizer/sr/ui'
import {
  CharacterContext,
  LoadoutContext,
  TeamCalcProvider,
  TeamCharacterSelector,
  useCharacter,
  useDatabaseContext,
  useLoadout,
  useLoadoutContext,
  useTeam,
} from '@genshin-optimizer/sr/ui'
import { Box, Skeleton } from '@mui/material'
import { Suspense, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Navigate,
  Route,
  Routes,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router-dom'
import TeamSettings from './TeamSettings'
import TeammateDisplay from './TeammateDisplay'

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

  const team = useTeam(teamId)!
  const { loadoutMetadata } = team
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
  const loadoutMetadatumIndex = useMemo(
    () =>
      loadoutMetadata.findIndex(
        (loadoutMetadatum) =>
          loadoutMetadatum?.loadoutId &&
          database.loadouts.get(loadoutMetadatum.loadoutId)?.key ===
            characterKeyRaw
      ),
    [loadoutMetadata, database.loadouts, characterKeyRaw]
  )
  const loadoutMetadatum = useMemo(
    () => loadoutMetadata[loadoutMetadatumIndex],
    [loadoutMetadata, loadoutMetadatumIndex]
  )
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])
  useEffect(() => {
    if (!loadoutMetadatum) navigate('', { replace: true })
  }, [loadoutMetadatum, navigate])

  const loadoutId = loadoutMetadatum?.loadoutId
  const characterKey = database.loadouts.get(loadoutId)?.key

  const { t } = useTranslation(['charNames_gen', 'page_character'])

  useTitle(
    useMemo(() => {
      const charName = characterKey
        ? // TODO: replace Character with CharKeyToName function once it's ported
          t('charNames_gen:Character')
        : t('Team Settings')
      const tabName = tab
        ? t(`page_character:tabs.${tab}`)
        : characterKey
        ? t('Loadout/Build')
        : tab
      return `${team.name} - ${charName}${tabName ? ` - ${tabName}` : ''}`
    }, [characterKey, t, tab, team.name])
  )

  const loadout = useLoadout(loadoutId ?? '')
  const loadoutContextObj: LoadoutContextObj | undefined = useMemo(() => {
    if (!loadoutId || !loadout || !loadoutMetadatum) return undefined
    const charMap = {
      ...team.loadoutMetadata.map(
        (ldata) => ldata && database.loadouts.get(ldata.loadoutId)?.key
      ),
    } as unknown as Record<'0' | '1' | '2' | '3', CharacterKey>
    return { teamId, team, loadoutId, loadout, loadoutMetadatum, charMap }
  }, [loadoutId, loadout, loadoutMetadatum, team, teamId, database])

  return (
    <TeamCalcProvider
      teamId={teamId}
      currentIndex={members[loadoutMetadatumIndex]}
    >
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
          {loadoutContextObj ? (
            <LoadoutContext.Provider value={loadoutContextObj}>
              <TeammateDisplayWrapper />
            </LoadoutContext.Provider>
          ) : (
            <TeamSettings teamId={teamId} />
          )}
        </Box>
      </Box>
    </TeamCalcProvider>
  )
}

function TeammateDisplayWrapper({ tab }: { tab?: string }) {
  const {
    loadout: { key: characterKey },
  } = useLoadoutContext()
  const character = useCharacter(characterKey)
  const characterContextValue: CharacterContextObj | undefined = useMemo(
    () =>
      character && {
        character,
      },
    [character]
  )
  if (!characterContextValue)
    return <Skeleton variant="rectangular" width="100%" height={1000} />

  return (
    <CharacterContext.Provider value={characterContextValue}>
      <Routes>
        <Route path=":characterKey">
          <Route path="*" index element={<TeammateDisplay tab={tab} />} />
        </Route>
      </Routes>
    </CharacterContext.Provider>
  )
}
