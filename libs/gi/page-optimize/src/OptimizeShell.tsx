import { useTitle } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allCharacterKeys,
  charKeyToLocGenderedCharKey,
} from '@genshin-optimizer/gi/consts'
import type { GeneratedBuild } from '@genshin-optimizer/gi/db'
import type { CharacterContextObj } from '@genshin-optimizer/gi/db-ui'
import {
  CharacterContext,
  TeamCharacterContext,
  type TeamCharacterContextObj,
  useBuildTc,
  useCharacter,
  useDBMeta,
  useDatabase,
  useTeam,
  useTeamChar,
} from '@genshin-optimizer/gi/db-ui'
import {
  type BuildTcContexObj,
  BuildTcContext,
  type SetBuildTcAction,
} from '@genshin-optimizer/gi/page-team/experiment-ui'
import {
  type ChartData,
  DataContext,
  FormulaDataWrapper,
  GraphContext,
  type GraphContextObj,
  OptTargetWrapper,
  SillyContext,
  type dataContextObj,
  ensureOptimizeContext,
  getExperimentTabPath,
  isTeamCharTabSegment,
  useTeamDataNoContext,
} from '@genshin-optimizer/gi/ui'
import { Box, Skeleton } from '@mui/material'
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  Route,
  Routes,
  useLocation,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router-dom'
import OptimizeContent from './OptimizeContent'

const fallback = <Skeleton variant="rectangular" width="100%" height={1000} />
const chartDataAll: Record<string, ChartData> = {}
const graphBuildAll: Record<string, GeneratedBuild[]> = {}

export function OptimizeShell() {
  const { teamId = '' } = useParams<{ teamId: string }>()
  const team = useTeam(teamId)

  if (!teamId || !team) {
    return fallback
  }

  return (
    <Suspense fallback={fallback}>
      <OptimizePage teamId={teamId} />
    </Suspense>
  )
}

function OptimizePage({ teamId }: { teamId: string }) {
  const database = useDatabase()
  const navigate = useNavigate()
  const location = useLocation()
  const { silly } = useContext(SillyContext)
  const { gender } = useDBMeta()

  const team = useTeam(teamId)!
  const { loadoutData } = team
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const {
    params: { characterKey: characterKeyFromMatch },
  } = useMatch({ path: '/experiment/:teamId/:characterKey', end: false }) ?? {
    params: {},
  }
  const {
    params: { tab: tabFromMatch },
  } = useMatch({
    path: '/experiment/:teamId/:characterKey/:tab',
    end: true,
  }) ?? {
    params: {},
  }

  const segmentCharKey = pathSegments[2]
  const segmentTab = pathSegments[3]

  const characterKeyRaw = ((): CharacterKey | undefined => {
    const fromMatch = characterKeyFromMatch as CharacterKey | undefined
    if (fromMatch && allCharacterKeys.includes(fromMatch)) return fromMatch
    if (
      segmentCharKey &&
      allCharacterKeys.includes(segmentCharKey as CharacterKey)
    ) {
      return segmentCharKey as CharacterKey
    }
    return undefined
  })()

  const tab = ((): string | undefined => {
    if (tabFromMatch && isTeamCharTabSegment(tabFromMatch)) return tabFromMatch
    if (segmentTab && isTeamCharTabSegment(segmentTab)) return segmentTab
    return undefined
  })()

  const loadoutDatum = useMemo(() => {
    if (!characterKeyRaw) return undefined
    return loadoutData.find(
      (loadoutDatum) =>
        loadoutDatum?.teamCharId &&
        database.teamChars.get(loadoutDatum.teamCharId)?.key === characterKeyRaw
    )
  }, [loadoutData, database.teamChars, characterKeyRaw])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    if (loadoutDatum || !characterKeyRaw) return
    ensureOptimizeContext(database, {
      characterKey: characterKeyRaw,
      teamId,
      teamCharId: database.dbMeta.get().optTeamCharId,
    })
  }, [loadoutDatum, characterKeyRaw, teamId, database])

  useEffect(() => {
    if (characterKeyRaw || !segmentTab || !isTeamCharTabSegment(segmentTab)) {
      return
    }
    const meta = database.dbMeta.get()
    const firstLoadout = loadoutData.find((ld) => ld?.teamCharId)
    const slotCharKey = firstLoadout
      ? database.teamChars.get(firstLoadout.teamCharId)?.key
      : undefined
    const ck = meta.optCharKey ?? slotCharKey
    if (!ck) {
      navigate('/experiment', { replace: true })
      return
    }
    navigate(getExperimentTabPath(teamId, ck, segmentTab), { replace: true })
  }, [characterKeyRaw, segmentTab, teamId, database, navigate, loadoutData])

  const teamCharId = loadoutDatum?.teamCharId
  const characterKey = database.teamChars.get(teamCharId)?.key
  const teamChar = useTeamChar(teamCharId ?? '')

  const { t } = useTranslation([
    'sillyWisher_charNames',
    'charNames_gen',
    'page_character',
    'ui',
  ])

  useTitle(
    useMemo(() => {
      const charName = characterKey
        ? t(
            `${
              silly ? 'sillyWisher_charNames' : 'charNames_gen'
            }:${charKeyToLocGenderedCharKey(characterKey, gender)}`
          )
        : t('ui:tabs.optimize')
      const tabName = tab ? t(`page_character:tabs.${tab}`) : undefined
      return tabName
        ? `${t('ui:tabs.optimize')} — ${charName} — ${tabName}`
        : `${t('ui:tabs.optimize')} — ${charName}`
    }, [t, silly, characterKey, gender, tab])
  )

  const teamCharacterContextValue: TeamCharacterContextObj | undefined =
    useMemo(() => {
      if (!teamCharId || !teamChar || !loadoutDatum) return undefined
      return { teamId, team, teamCharId, teamChar, loadoutDatum }
    }, [teamId, team, teamCharId, teamChar, loadoutDatum])

  const teamData = useTeamDataNoContext(teamId, teamCharId ?? '')
  const { target: charUIData } =
    (characterKey && teamData?.[characterKey]) ?? {}

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return { data: charUIData, teamData, compareData: undefined }
  }, [charUIData, teamData])

  if (!teamCharacterContextValue || !dataContextValue) {
    return fallback
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <TeamCharacterContext.Provider value={teamCharacterContextValue}>
        <DataContext.Provider value={dataContextValue}>
          <OptimizeInnerContent tab={tab} />
        </DataContext.Provider>
      </TeamCharacterContext.Provider>
    </Box>
  )
}

function OptimizeInnerContent({ tab }: { tab?: string }) {
  const database = useDatabase()
  const {
    teamCharId,
    teamChar: { key: characterKey },
    loadoutDatum,
  } = useContext(TeamCharacterContext)
  const character = useCharacter(characterKey as CharacterKey)
  const CharacterContextValue: CharacterContextObj | undefined = useMemo(
    () => character && { character },
    [character]
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
  }, [teamCharId])

  const graphContextValue: GraphContextObj | undefined = useMemo(
    () => ({
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
    }),
    [teamCharId, chartData, graphBuilds]
  )

  const buildTc = useBuildTc(loadoutDatum.buildTcId)!
  const setBuildTc = useCallback(
    (data: SetBuildTcAction) => {
      database.buildTcs.set(loadoutDatum.buildTcId, data)
    },
    [loadoutDatum.buildTcId, database]
  )
  const buildTCContextObj = useMemo(
    () =>
      ({
        buildTc: loadoutDatum.buildType === 'tc' ? buildTc : undefined,
        setBuildTc,
      }) as BuildTcContexObj,
    [buildTc, loadoutDatum.buildType, setBuildTc]
  )

  if (!CharacterContextValue) return fallback

  return (
    <CharacterContext.Provider value={CharacterContextValue}>
      <BuildTcContext.Provider value={buildTCContextObj}>
        <GraphContext.Provider value={graphContextValue}>
          <FormulaDataWrapper>
            <OptTargetWrapper>
              <Routes>
                <Route path=":characterKey">
                  <Route
                    path="*"
                    index
                    element={
                      <OptimizeContent
                        key={`${characterKey}${loadoutDatum.teamCharId}${loadoutDatum.buildType === 'tc' ? loadoutDatum.buildTcId : loadoutDatum.buildId}`}
                        tab={tab}
                      />
                    }
                  />
                </Route>
              </Routes>
            </OptTargetWrapper>
          </FormulaDataWrapper>
        </GraphContext.Provider>
      </BuildTcContext.Provider>
    </CharacterContext.Provider>
  )
}
