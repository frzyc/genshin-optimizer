import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { charKeyToLocGenderedCharKey } from '@genshin-optimizer/gi/consts'
import type { Team, TeamCharacter } from '@genshin-optimizer/gi/db'
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
import useTeamData from '../ReactHooks/useTeamData'
import useTitle from '../ReactHooks/useTitle'
import { shouldShowDevComponents } from '../Util/Util'
import Content from './CharacterDisplay/Content'
import TeamCharacterSelector from './TeamCharacterSelector'
import TeamSettingElement from './TeamSettingElement'

export default function PageTeam() {
  const navigate = useNavigate()
  const database = useDatabase()
  const onClose = useCallback(() => navigate('/teams'), [navigate])
  const { teamId } = useParams<{ teamId?: string }>()
  const invalidKey = !database.teams.keys.includes(teamId)
  if (invalidKey) return <Navigate to="/characters" />

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

function Page({ teamId, onClose }: { teamId: string; onClose?: () => void }) {
  const navigate = useNavigate()
  const { silly } = useContext(SillyContext)
  const database = useDatabase()
  const { gender } = useDBMeta()

  const team = useTeam(teamId)
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

  const teamChar = useTeamChar(teamCharId)

  // validate tab value
  const tab = useMemo(() => {
    if (!teamChar) return 'overview'
    if (teamChar.buildType === 'tc') {
      if (!tabsTc.includes(tabRaw)) return 'overview'
    } else {
      if (!tabs.includes(tabRaw)) return 'overview'
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
          `${
            silly ? 'sillyWisher_charNames' : 'charNames_gen'
          }:${charKeyToLocGenderedCharKey(characterKey, gender)}`
        )} - ${t(`page_character:tabs.${tab}`)}`,
      [t, team.name, silly, characterKey, gender, tab]
    )
  )

  return (
    <CardThemed>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box flexGrow={1}>
            <TeamSettingElement teamId={teamId} />
          </Box>
          <CloseButton onClick={onClose} />
        </Box>

        <TeamCharacterSelector />
        {characterKey && team && teamChar && (
          <PageContent
            characterKey={characterKey}
            teamCharId={teamCharId}
            teamId={teamId}
            team={team}
            teamChar={teamChar}
            tab={tab}
          />
        )}
      </CardContent>
    </CardThemed>
  )
}
// Stored per teamCharId
const chartDataAll: Record<string, ChartData> = {}
const graphBuildAll: Record<string, string[][]> = {}
function PageContent({
  characterKey,
  teamCharId,
  teamChar,
  teamId,
  team,
  tab,
}: {
  characterKey: CharacterKey
  teamCharId: string
  teamChar: TeamCharacter
  teamId: string
  team: Team
  tab: string
}) {
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)
  const character = useCharacter(characterKey)
  const teamCharacterContextValue: TeamCharacterContextObj | undefined =
    useMemo(() => {
      if (!character || !characterSheet) return undefined
      return {
        teamId,
        team,
        teamCharId,
        teamChar,
        character,
        characterSheet,
      }
    }, [teamId, team, teamCharId, teamChar, character, characterSheet])
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
  const [graphBuilds, setGraphBuildState] = useState<string[][] | undefined>(
    graphBuildAll[teamCharId]
  )
  useEffect(() => {
    setChartDataState(chartDataAll[teamCharId])
    setGraphBuildState(graphBuildAll[teamCharId])
  }, [teamCharId, setChartDataState, setGraphBuildState])
  const graphContextValue: GraphContextObj | undefined = useMemo(() => {
    return {
      chartData,
      setChartData: (data) => {
        chartDataAll[teamCharId] = data
        setChartDataState(data)
      },
      graphBuilds,
      setGraphBuilds: (data) => {
        graphBuildAll[teamCharId] = data
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
  return teamCharacterContextValue &&
    graphContextValue &&
    CharacterContextValue ? (
    <TeamCharacterContext.Provider value={teamCharacterContextValue}>
      <CharacterContext.Provider value={CharacterContextValue}>
        <DataContextWrapper>
          <GraphContext.Provider value={graphContextValue}>
            <FormulaDataWrapper>
              <Content tab={tab} />
            </FormulaDataWrapper>
          </GraphContext.Provider>
        </DataContextWrapper>
      </CharacterContext.Provider>
    </TeamCharacterContext.Provider>
  ) : (
    <Skeleton variant="rectangular" width="100%" height={1000} />
  )
}
function DataContextWrapper({ children }: { children: React.ReactNode }) {
  const {
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const teamData = useTeamData()
  const { target: charUIData } = teamData?.[characterKey] ?? {}

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
      oldData: undefined,
    }
  }, [charUIData, teamData])
  if (!dataContextValue)
    return <Skeleton variant="rectangular" width="100%" height={1000} />
  return (
    <DataContext.Provider value={dataContextValue}>
      {children}
    </DataContext.Provider>
  )
}
