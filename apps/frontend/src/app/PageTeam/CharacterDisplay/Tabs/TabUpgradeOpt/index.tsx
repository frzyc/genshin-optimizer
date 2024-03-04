import {
  useDBMeta,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import { CheckBox, CheckBoxOutlineBlank, Upgrade } from '@mui/icons-material'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Pagination,
  Skeleton,
  Typography,
} from '@mui/material'
import CardLight from '../../../../Components/Card/CardLight'
import {
  HitModeToggle,
  ReactionToggle,
} from '../../../../Components/HitModeEditor'
import ArtifactSetConfig from '../TabOptimize/Components/ArtifactSetConfig'
import BonusStatsCard from '../TabOptimize/Components/BonusStatsCard'
import OptimizationTargetSelector from '../TabOptimize/Components/OptimizationTargetSelector'
import StatFilterCard from '../TabOptimize/Components/StatFilterCard'

import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { clamp } from '@genshin-optimizer/common/util'
import type {
  ArtifactSlotKey,
  CharacterKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import { type ICachedArtifact } from '@genshin-optimizer/gi/db'
import {
  Suspense,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Trans } from 'react-i18next'
import ArtifactLevelSlider from '../../../../Components/Artifact/ArtifactLevelSlider'
import type { dataContextObj } from '../../../../Context/DataContext'
import { DataContext } from '../../../../Context/DataContext'
import { TeamCharacterContext } from '../../../../Context/TeamCharacterContext'
import { mergeData, uiDataForTeam } from '../../../../Formula/api'
import { optimize } from '../../../../Formula/optimization'
import type { NumNode } from '../../../../Formula/type'
import type { DynStat } from '../../../../Solver/common'
import { objPathValue, shouldShowDevComponents } from '../../../../Util/Util'
import MainStatSelectionCard from '../TabOptimize/Components/MainStatSelectionCard'
import { dynamicData } from '../TabOptimize/foreground'
import UpgradeOptChartCard from './UpgradeOptChartCard'

import { CardThemed } from '@genshin-optimizer/common/ui'
import { Stack } from '@mui/system'
import AddArtInfo from '../../../../Components/AddArtInfo'
import { CharacterCardEquipmentRow } from '../../../../Components/Character/CharacterCard/CharacterCardEquipmentRow'
import {
  CharacterCardHeader,
  CharacterCardHeaderContent,
} from '../../../../Components/Character/CharacterCard/CharacterCardHeader'
import { CharacterCardStats } from '../../../../Components/Character/CharacterCard/CharacterCardStats'
import NoArtWarning from '../../../../Components/NoArtWarning'
import useTeamData, { getTeamData } from '../../../../ReactHooks/useTeamData'
import type { UpOptBuild } from './upOpt'
import { UpOptCalculator, toArtifact } from './upOpt'

export default function TabUpopt() {
  const {
    teamId,
    teamCharId,
    teamChar: { optConfigId, key: characterKey },
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { gender } = useDBMeta()

  const activeCharKey = database.teams.getActiveTeamChar(teamId).key

  const noArtifact = useMemo(() => !database.arts.values.length, [database])

  const buildSetting = useOptConfig(optConfigId)
  const { optimizationTarget, levelLow, levelHigh } = buildSetting
  const teamData = useTeamData()
  const { target: data } = teamData?.[characterKey as CharacterKey] ?? {}

  const [artsDirty] = useForceUpdate()
  // const [{ equipmentPriority, threads = defThreads }, setDisplayOptimize] = useState(database.displayOptimize.get())
  const [, setDisplayOptimize] = useState(database.displayOptimize.get())
  useEffect(
    () => database.displayOptimize.follow((_r, to) => setDisplayOptimize(to)),
    [database, setDisplayOptimize]
  )
  const deferredArtsDirty = useDeferredValue(artsDirty)
  const deferredBuildSetting = useDeferredValue(buildSetting)
  const filteredArts = useMemo(() => {
    const {
      mainStatKeys,
      excludedLocations,
      artExclusion,
      levelLow,
      levelHigh,
      allowLocationsState,
      useExcludedArts,
    } = deferredArtsDirty && deferredBuildSetting

    return database.arts.values.filter((art) => {
      if (!useExcludedArts && artExclusion.includes(art.id)) return false
      if (art.level < levelLow) return false
      if (art.level > levelHigh) return false
      const mainStats = mainStatKeys[art.slotKey]
      if (mainStats?.length && !mainStats.includes(art.mainStatKey))
        return false

      const locKey = charKeyToLocCharKey(characterKey)
      const unequippedStateAndEquippedElsewhere =
        allowLocationsState === 'unequippedOnly' &&
        art.location &&
        art.location !== locKey
      const customListStateAndNotOnList =
        allowLocationsState === 'customList' &&
        art.location &&
        art.location !== locKey &&
        excludedLocations.includes(art.location)
      if (unequippedStateAndEquippedElsewhere || customListStateAndNotOnList)
        return false

      return true
    })
  }, [database, characterKey, deferredArtsDirty, deferredBuildSetting])
  const filteredArtIdMap = useMemo(
    () => Object.fromEntries(filteredArts.map(({ id }) => [id, true])),
    [filteredArts]
  )

  const [upOptCalc, setUpOptCalc] = useState(
    undefined as UpOptCalculator | undefined
  )

  const [, setForceUpdate] = useForceUpdate()

  const [show20, setShow20] = useState(true)
  const [check4th, setCheck4th] = useState(true)
  const [useFilters, setUseMainStatFilter] = useState(false)

  // Paging logic
  const [pageIdex, setpageIdex] = useState(0)

  const artifactsToDisplayPerPage = 5
  const { artifactsToShow, numPages, currentPageIndex, minObj0, maxObj0 } =
    useMemo(() => {
      if (!upOptCalc)
        return {
          artifactsToShow: [],
          numPages: 0,
          currentPageIndex: 0,
          toShow: 0,
          minObj0: 0,
          maxObj0: 0,
        }
      const numPages = Math.ceil(
        upOptCalc.artifacts.length / artifactsToDisplayPerPage
      )
      const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
      const toShow = upOptCalc.artifacts.slice(
        currentPageIndex * artifactsToDisplayPerPage,
        (currentPageIndex + 1) * artifactsToDisplayPerPage
      )
      const thr = upOptCalc.thresholds[0]

      return {
        artifactsToShow: toShow,
        numPages,
        currentPageIndex,
        minObj0: toShow.reduce(
          (a, b) => Math.min(b.result!.distr.lower, a),
          thr
        ),
        maxObj0: toShow.reduce(
          (a, b) => Math.max(b.result!.distr.upper, a),
          thr
        ),
      }
    }, [pageIdex, upOptCalc])

  const setPage = useCallback(
    (e, value) => {
      if (!upOptCalc) return
      const end = value * artifactsToDisplayPerPage
      upOptCalc.calcSlowToIndex(end)
      setpageIdex(value - 1)
    },
    [upOptCalc]
  )

  const generateBuilds = useCallback(async () => {
    const {
      statFilters,
      optimizationTarget,
      mainStatKeys,
      levelLow,
      levelHigh,
      artSetExclusion,
    } = buildSetting

    if (!shouldShowDevComponents) return
    if (!characterKey || !optimizationTarget) return
    const teamData = getTeamData(database, teamId, teamCharId, 0, [])
    if (!teamData) return
    const workerData = uiDataForTeam(teamData.teamData, gender, activeCharKey)[
      characterKey
    ]?.target.data![0]
    if (!workerData) return
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic
    const optimizationTargetNode = objPathValue(
      workerData.display ?? {},
      optimizationTarget
    ) as NumNode | undefined
    if (!optimizationTargetNode) return
    setUpOptCalc(undefined)
    setpageIdex(0)

    const valueFilter: { value: NumNode; minimum: number }[] = Object.entries(
      statFilters
    ).flatMap(([pathStr, settings]) =>
      settings
        .filter((setting) => !setting.disabled)
        .map((setting) => {
          const filterNode: NumNode = objPathValue(
            workerData.display ?? {},
            JSON.parse(pathStr)
          )
          const minimum =
            filterNode.info?.unit === '%' ? setting.value / 100 : setting.value
          return { value: filterNode, minimum }
        })
    )

    const equippedArts =
      database.chars.get(characterKey)?.equippedArtifacts ??
      ({} as StrictDict<ArtifactSlotKey, string>)
    const curEquip: UpOptBuild = Object.fromEntries(
      allArtifactSlotKeys.map((slotKey) => {
        const art = database.arts.get(equippedArts[slotKey] ?? '')
        return [slotKey, art ? toArtifact(art) : undefined]
      })
    ) as UpOptBuild
    const curEquipSetKeys = Object.fromEntries(
      allArtifactSlotKeys.map((slotKey) => {
        const art = database.arts.get(equippedArts[slotKey] ?? '')
        return [slotKey, art?.setKey ?? '']
      })
    )
    function respectSexExclusion(art: ICachedArtifact) {
      const newSK = { ...curEquipSetKeys }
      newSK[art.slotKey] = art.setKey
      const skc: DynStat = {}
      allArtifactSlotKeys.forEach(
        (slotKey) => (skc[newSK[slotKey]] = (skc[newSK[slotKey]] ?? 0) + 1)
      )
      const pass = Object.entries(skc).every(([setKey, num]) => {
        if (!artSetExclusion[setKey]) return true
        switch (num) {
          case 0:
          case 1:
            return true
          case 2:
          case 3:
            return !artSetExclusion[setKey].includes(2)
          case 4:
          case 5:
            return !artSetExclusion[setKey].includes(4)
          default:
            throw Error('error in respectSetExclude: num > 5')
        }
      })
      if (!pass) return false

      if (!artSetExclusion['rainbow']) return true
      const nRainbow = Object.values(skc).reduce((a, b) => a + (b % 2), 0)
      switch (nRainbow) {
        case 0:
        case 1:
          return true
        case 2:
        case 3:
          return !artSetExclusion['rainbow'].includes(2)
        case 4:
        case 5:
          return !artSetExclusion['rainbow'].includes(4)
        default:
          throw Error('error in respectSex: nRainbow > 5')
      }
    }

    const nodesPreOpt = [
      optimizationTargetNode,
      ...valueFilter.map((x) => x.value),
    ]
    const nodes = optimize(
      nodesPreOpt,
      workerData,
      ({ path: [p] }) => p !== 'dyn'
    )
    const artifactsToConsider = database.arts.values
      .filter((art) => art.rarity === 5)
      .filter(respectSexExclusion)
      .filter((art) => show20 || art.level !== 20)
      .filter(
        (art) =>
          !useFilters ||
          !mainStatKeys[art.slotKey]?.length ||
          mainStatKeys[art.slotKey]?.includes(art.mainStatKey)
      )
      .filter(
        (art) =>
          !useFilters || (levelLow <= art.level && art.level <= levelHigh)
      )

    const upoptCalc = new UpOptCalculator(
      nodes,
      [-Infinity, ...valueFilter.map((x) => x.minimum)],
      curEquip,
      artifactsToConsider
    )
    upoptCalc.calc4th = check4th
    upoptCalc.calcFastAll()
    upoptCalc.calcSlowToIndex(5)
    setUpOptCalc(upoptCalc)
  }, [
    buildSetting,
    characterKey,
    database,
    teamId,
    teamCharId,
    gender,
    activeCharKey,
    check4th,
    show20,
    useFilters,
  ])

  const dataContext: dataContextObj | undefined = useMemo(() => {
    return data && teamData && { data, teamData }
  }, [data, teamData])

  const pagination = numPages > 1 && (
    <CardLight>
      <CardContent>
        <Grid container>
          <Grid item flexGrow={1}>
            <Pagination
              count={numPages}
              page={currentPageIndex + 1}
              onChange={setPage}
            />
          </Grid>
          <Grid item>
            <ShowingArt
              numShowing={artifactsToShow.length}
              total={upOptCalc?.artifacts.length}
            />
          </Grid>
        </Grid>
      </CardContent>
    </CardLight>
  )

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {noArtifact && <NoArtWarning />}
      {/* Build Generator Editor */}
      {dataContext && (
        <DataContext.Provider value={dataContext}>
          <Stack spacing={1}>
            <Box>
              <Grid container spacing={1}>
                {/* 1*/}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={3}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  {/* character card */}
                  <Box>
                    <Suspense
                      fallback={
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height={600}
                        />
                      }
                    >
                      <CardThemed bgt="light">
                        <CharacterCardHeader characterKey={characterKey}>
                          <CharacterCardHeaderContent
                            characterKey={characterKey}
                          />
                        </CharacterCardHeader>
                        <Box
                          sx={{
                            p: 1,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}
                        >
                          <CharacterCardEquipmentRow />
                          <CharacterCardStats />
                        </Box>
                      </CardThemed>
                    </Suspense>
                  </Box>
                  <BonusStatsCard />
                </Grid>

                {/* 2 */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={9}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  <Grid container spacing={1}>
                    <Grid
                      item
                      lg={4}
                      display="flex"
                      flexDirection="column"
                      gap={1}
                    >
                      <CardLight>
                        <CardContent>
                          <span>Optimization Target: </span>
                          {
                            <OptimizationTargetSelector
                              optimizationTarget={optimizationTarget}
                              setTarget={(target) =>
                                database.optConfigs.set(optConfigId, {
                                  optimizationTarget: target,
                                })
                              }
                              disabled={false}
                            />
                          }
                        </CardContent>
                      </CardLight>
                      <CardLight>
                        <CardContent>
                          <StatFilterCard disabled={false} />
                        </CardContent>
                      </CardLight>
                      {useFilters && (
                        <CardLight>
                          <CardContent sx={{ py: 1 }}>
                            Artifact Level Filter
                          </CardContent>
                          <ArtifactLevelSlider
                            levelLow={levelLow}
                            levelHigh={levelHigh}
                            setLow={(levelLow) =>
                              database.optConfigs.set(optConfigId, { levelLow })
                            }
                            setHigh={(levelHigh) =>
                              database.optConfigs.set(optConfigId, {
                                levelHigh,
                              })
                            }
                            setBoth={(levelLow, levelHigh) =>
                              database.optConfigs.set(optConfigId, {
                                levelLow,
                                levelHigh,
                              })
                            }
                            disabled={false}
                          />
                          <CardContent>
                            <MainStatSelectionCard
                              disabled={false}
                              filteredArtIdMap={filteredArtIdMap}
                            />
                          </CardContent>
                        </CardLight>
                      )}
                    </Grid>
                    <Grid
                      item
                      lg={8}
                      display="flex"
                      flexDirection="column"
                      gap={1}
                    >
                      <CardLight>
                        <CardContent>
                          <ArtifactSetConfig disabled={false} />
                        </CardContent>
                      </CardLight>
                      <CardLight>
                        <CardContent>
                          <Grid container spacing={1}>
                            <Grid item>
                              <Button
                                startIcon={
                                  show20 ? (
                                    <CheckBox />
                                  ) : (
                                    <CheckBoxOutlineBlank />
                                  )
                                }
                                color={show20 ? 'success' : 'secondary'}
                                onClick={() => setShow20(!show20)}
                              >
                                show lvl 20
                              </Button>
                            </Grid>
                            <Grid item>
                              <Button
                                startIcon={
                                  check4th ? (
                                    <CheckBox />
                                  ) : (
                                    <CheckBoxOutlineBlank />
                                  )
                                }
                                color={check4th ? 'success' : 'secondary'}
                                onClick={() => setCheck4th(!check4th)}
                              >
                                compute 4th sub
                              </Button>
                            </Grid>
                            <Grid item>
                              <Button
                                startIcon={
                                  useFilters ? (
                                    <CheckBox />
                                  ) : (
                                    <CheckBoxOutlineBlank />
                                  )
                                }
                                color={useFilters ? 'success' : 'secondary'}
                                onClick={() =>
                                  setUseMainStatFilter(!useFilters)
                                }
                              >
                                enable filters
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </CardLight>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <CardLight>
              <CardContent>
                <Grid container spacing={1}>
                  <Grid item>
                    <Button
                      disabled={
                        !characterKey ||
                        !optimizationTarget ||
                        !objPathValue(data?.getDisplay(), optimizationTarget)
                      }
                      color={characterKey ? 'success' : 'warning'}
                      onClick={generateBuilds}
                      startIcon={<Upgrade />}
                    >
                      Calc Upgrade Priority
                    </Button>
                  </Grid>
                  <Grid item>
                    <HitModeToggle size="small" />
                  </Grid>
                  <Grid item>
                    <ReactionToggle size="small" />
                  </Grid>
                </Grid>
              </CardContent>
            </CardLight>
            {pagination}
            {noArtifact && <AddArtInfo />}
            <Suspense
              fallback={
                <Skeleton
                  variant="rectangular"
                  sx={{ width: '100%', height: 600, minHeight: 5000 }}
                />
              }
            >
              {artifactsToShow.map((art, i) => (
                <Box key={art.id}>
                  <UpgradeOptChartCard
                    upgradeOpt={art}
                    thresholds={upOptCalc?.thresholds ?? []}
                    objMax={maxObj0}
                    objMin={minObj0}
                    calcExactCallback={() => {
                      const ix =
                        currentPageIndex * artifactsToDisplayPerPage + i
                      upOptCalc?.calcExact(ix)
                      setForceUpdate()
                    }}
                  />
                </Box>
              ))}
            </Suspense>
            {pagination}
          </Stack>
        </DataContext.Provider>
      )}
    </Box>
  )
}

function ShowingArt({ numShowing, total }) {
  return (
    <Typography color="text.secondary">
      <Trans i18nKey="showingNum" count={numShowing} value={total}>
        Showing {{ count: numShowing }} out of {{ value: total }} Artifacts
      </Trans>
    </Typography>
  )
}
