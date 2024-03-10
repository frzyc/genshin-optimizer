import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { charKeyToLocGenderedCharKey } from '@genshin-optimizer/gi/consts'
import type { GeneratedBuild } from '@genshin-optimizer/gi/db'
import {
  useCharacter,
  useDBMeta,
  useDatabase,
  useTeam,
  useTeamChar,
} from '@genshin-optimizer/gi/db-ui'
import { SillyContext } from '@genshin-optimizer/gi/ui'
import { Box, CardContent, Skeleton } from '@mui/material'
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useMatch, useNavigate, useParams } from 'react-router-dom'
import CloseButton from '../Components/CloseButton'
import type { CharacterContextObj } from '../Context/CharacterContext'
import { CharacterContext } from '../Context/CharacterContext'
import { DataContext, type dataContextObj } from '../Context/DataContext'
import { FormulaDataWrapper } from '../Context/FormulaDataContext'
import {
  GraphContext,
  type ChartData,
  type GraphContextObj,
} from '../Context/GraphContext'
import {
  TeamCharacterContext,
  type TeamCharacterContextObj,
} from '../Context/TeamCharacterContext'
import { getCharSheet } from '../Data/Characters'
import { useTeamDataNoContext } from '../ReactHooks/useTeamData'
import useTitle from '../ReactHooks/useTitle'
import { shouldShowDevComponents } from '../Util/Util'
import Content from './CharacterDisplay/Content'
import { EnemyEditorElement } from './EnemyEditorElement'
import TeamCharacterSelector from './TeamCharacterSelector'
import TeamSetting from './TeamSetting'

export default function PageTeam() {
  const navigate = useNavigate()
  const database = useDatabase()
  const onClose = useCallback(() => navigate('/teams'), [navigate])
  const { teamId } = useParams<{ teamId?: string }>()
  const invalidKey = !teamId || !database.teams.keys.includes(teamId)

  // An edit is triggered whenever a team gets opened even if no edits are done
  useEffect(() => {
    if (invalidKey || !teamId) return
    database.teams.set(teamId, { lastEdit: Date.now() })
  }, [teamId, database.teams, invalidKey])

  if (invalidKey) return <Navigate to="/teams" />

  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}
      >
        {teamId && <Page teamId={teamId} onClose={onClose} />}
      </Suspense>
    </Box>
  )
}

const tabs = ['overview', 'talent', 'teambuffs', 'optimize']
if (shouldShowDevComponents) tabs.push('upopt')
const tabsTc = ['overview', 'talent', 'teambuffs']
const fallback = <Skeleton variant="rectangular" width="100%" height={1000} />
// Stored per teamCharId
const chartDataAll: Record<string, ChartData> = {}
const graphBuildAll: Record<string, GeneratedBuild[]> = {}
function Page({ teamId, onClose }: { teamId: string; onClose?: () => void }) {
  const navigate = useNavigate()
  const { silly } = useContext(SillyContext)
  const database = useDatabase()
  const { gender } = useDBMeta()

  const team = useTeam(teamId)!
  const { teamCharIds } = team

  // use the current URL as the "source of truth" for characterKey and tab.
  const {
    params: { characterKey: characterKeyRaw },
  } = useMatch({ path: '/teams/:teamId/:characterKey', end: false }) ?? {
    params: {},
  }

  const {
    params: { tab: tabRaw },
  } = useMatch({ path: '/teams/:teamId/:characterKey/:tab', end: false }) ?? {
    params: {},
  }

  // validate characterKey
  const { characterKey, teamCharId } = useMemo(() => {
    const teamCharId =
      teamCharIds.find(
        (teamCharId) =>
          database.teamChars.get(teamCharId)?.key === characterKeyRaw
      ) ?? teamCharIds[0]
    const characterKey = database.teamChars.get(teamCharId)?.key
    return { characterKey, teamCharId }
  }, [teamCharIds, characterKeyRaw, database])

  const teamChar = useTeamChar(teamCharId ?? '')

  // validate tab value
  const tab = useMemo(() => {
    if (!teamChar) return 'overview'
    if (teamChar.buildType === 'tc') {
      if (!tabRaw || !tabsTc.includes(tabRaw)) return 'overview'
    } else {
      if (!tabRaw || !tabs.includes(tabRaw)) return 'overview'
    }
    return tabRaw
  }, [teamChar, tabRaw])
  // Enforce validated routing for tabs and character
  useEffect(() => {
    if (!characterKey) return
    if (characterKeyRaw !== characterKey || tab !== tabRaw)
      navigate(`/teams/${teamId}/${characterKey}/${tab}`)
  }, [
    database,
    characterKey,
    characterKeyRaw,
    navigate,
    teamCharIds,
    tab,
    teamId,
    tabRaw,
  ])

  const { t } = useTranslation([
    'sillyWisher_charNames',
    'charNames_gen',
    'page_character',
  ])

  useTitle(
    useMemo(
      () =>
        `${team.name} - ${t(
          `${silly ? 'sillyWisher_charNames' : 'charNames_gen'}:${
            characterKey
              ? charKeyToLocGenderedCharKey(characterKey, gender)
              : 'Character'
          }`
        )} - ${t(`page_character:tabs.${tab}`)}`,
      [t, team.name, silly, characterKey, gender, tab]
    )
  )

  const teamCharacterContextValue: TeamCharacterContextObj | undefined =
    useMemo(() => {
      if (!teamCharId || !teamChar) return undefined
      return {
        teamId,
        team,
        teamCharId,
        teamChar,
      }
    }, [teamId, team, teamCharId, teamChar])

  const teamData = useTeamDataNoContext(teamId, teamCharId ?? '')
  const { target: charUIData } =
    (characterKey && teamData?.[characterKey]) ?? {}

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
      oldData: undefined,
    }
  }, [charUIData, teamData])

  return (
    <CardThemed>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TeamSetting teamId={teamId} dataContextValue={dataContextValue} />
          <EnemyEditorElement teamId={teamId} />
          <CloseButton sx={{ ml: 'auto' }} onClick={onClose} />
        </Box>

        <TeamCharacterSelector
          teamId={teamId}
          characterKey={characterKey}
          tab={tab}
        />
        {teamCharacterContextValue ? (
          dataContextValue ? (
            <TeamCharacterContext.Provider value={teamCharacterContextValue}>
              <DataContext.Provider value={dataContextValue}>
                <InnerContent tab={tab} />
              </DataContext.Provider>
            </TeamCharacterContext.Provider>
          ) : (
            fallback
          )
        ) : null}
      </CardContent>
    </CardThemed>
  )
}
function InnerContent({ tab }: { tab: string }) {
  const { gender } = useDBMeta()
  const {
    teamCharId,
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const characterSheet = characterKey
    ? getCharSheet(characterKey, gender)
    : undefined
  const character = useCharacter(characterKey as CharacterKey)
  const CharacterContextValue: CharacterContextObj | undefined = useMemo(
    () =>
      character &&
      characterSheet && {
        character,
        characterSheet,
      },
    [character, characterSheet]
  )

  const [chartData, setChartDataState] = useState<ChartData | undefined>(
    chartDataAll[teamCharId]
  )
  const [graphBuilds, setGraphBuildState] = useState<
    GeneratedBuild[] | undefined
  >(graphBuildAll[teamCharId])
  useEffect(() => {
    setChartDataState(chartDataAll[teamCharId])
    setGraphBuildState(graphBuildAll[teamCharId])
  }, [teamCharId, setChartDataState, setGraphBuildState])

  const graphContextValue: GraphContextObj | undefined = useMemo(() => {
    return {
      chartData,
      setChartData: (data) => {
        if (data) chartDataAll[teamCharId] = data
        setChartDataState(data)
      },
      graphBuilds,
      setGraphBuilds: (data) => {
        if (data) graphBuildAll[teamCharId] = data
        setGraphBuildState(data)
      },
    }
  }, [
    teamCharId,
    chartData,
    graphBuilds,
    setChartDataState,
    setGraphBuildState,
  ])
  if (!CharacterContextValue) return fallback
  return (
    <CharacterContext.Provider value={CharacterContextValue}>
      <GraphContext.Provider value={graphContextValue}>
        <FormulaDataWrapper>
          <Content tab={tab} />
        </FormulaDataWrapper>
      </GraphContext.Provider>
    </CharacterContext.Provider>
  )
}
