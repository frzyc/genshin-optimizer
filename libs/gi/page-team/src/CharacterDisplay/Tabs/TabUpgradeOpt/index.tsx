import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  clamp,
  objKeyMap,
  objPathValue,
  range,
} from '@genshin-optimizer/common/util'
import type { ArtifactSetKey, CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import type { ArtSetExclusionKey } from '@genshin-optimizer/gi/db'
import { type ICachedArtifact } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import { dynamicData } from '@genshin-optimizer/gi/solver-tc'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  AddArtInfo,
  ArtifactEditor,
  ArtifactLevelSlider,
  CharacterCardEquipmentRow,
  CharacterCardHeader,
  CharacterCardHeaderContent,
  CharacterCardStats,
  DataContext,
  HitModeToggle,
  NoArtWarning,
  ReactionToggle,
  getTeamData,
  resolveInfo,
  shouldShowDevComponents,
  useTeamData,
} from '@genshin-optimizer/gi/ui'
import { uiDataForTeam } from '@genshin-optimizer/gi/uidata'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import { mergeData, optimize } from '@genshin-optimizer/gi/wr'
import { Upgrade } from '@mui/icons-material'
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  Grid,
  Pagination,
  Skeleton,
  Typography,
} from '@mui/material'
import { Stack } from '@mui/system'
import {
  Suspense,
  useCallback,
  useContext,
  useDeferredValue,
  useMemo,
  useState,
} from 'react'
import { Trans } from 'react-i18next'
import ArtifactSetConfig from '../TabOptimize/Components/ArtifactSetConfig'
import BonusStatsCard from '../TabOptimize/Components/BonusStatsCard'
import MainStatSelectionCard from '../TabOptimize/Components/MainStatSelectionCard'
import OptimizationTargetSelector from '../TabOptimize/Components/OptimizationTargetSelector'
import StatFilterCard from '../TabOptimize/Components/StatFilterCard'
import UpgradeOptChartCard from './UpgradeOptChartCard'
import { UpOptCalculator } from './upOpt'

export default function TabUpopt() {
  const {
    teamId,
    teamCharId,
    teamChar: { optConfigId, key: characterKey },
    loadoutDatum,
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { gender } = useDBMeta()

  const [artifactIdToEdit, setArtifactIdToEdit] = useState<string | undefined>()

  const activeCharKey = database.teams.getActiveTeamChar(teamId)!.key

  const noArtifact = useMemo(() => !database.arts.values.length, [database])

  const buildSetting = useOptConfig(optConfigId)!
  const { optimizationTarget, levelLow, levelHigh } = buildSetting
  const teamData = useTeamData()
  const { target: data } = teamData?.[characterKey as CharacterKey] ?? {}

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
    } = deferredBuildSetting

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
  }, [database, characterKey, deferredBuildSetting])
  const filteredArtIdMap = useMemo(
    () => Object.fromEntries(filteredArts.map(({ id }) => [id, true])),
    [filteredArts]
  )

  const [upOptCalc, setUpOptCalc] = useState(
    undefined as UpOptCalculator | undefined
  )

  // Paging logic
  const [pageIdex, setpageIdex] = useState(0)

  const artifactsToDisplayPerPage = 5
  const { indexes, numPages, currentPageIndex, minObj0, maxObj0 } =
    useMemo(() => {
      if (!upOptCalc)
        return {
          indexes: [],
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
        indexes: range(
          currentPageIndex * artifactsToDisplayPerPage,
          Math.min(
            (currentPageIndex + 1) * artifactsToDisplayPerPage - 1,
            upOptCalc.artifacts.length - 1
          )
        ),
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
          const infoResolved = filterNode.info && resolveInfo(filterNode.info)
          const minimum =
            infoResolved?.unit === '%' ? setting.value / 100 : setting.value // TODO: Conversion
          return { value: filterNode, minimum }
        })
    )

    const equippedArts = database.teams.getLoadoutArtifacts(loadoutDatum)
    const curEquipSetKeys = objKeyMap(
      allArtifactSlotKeys,
      (slotKey) => equippedArts[slotKey]?.setKey
    )
    function respectSexExclusion(art: ICachedArtifact) {
      const newSK = { ...curEquipSetKeys }
      newSK[art.slotKey] = art.setKey
      const skc: Partial<Record<ArtifactSetKey, number>> = {}
      allArtifactSlotKeys.forEach((slotKey) => {
        const setKey = newSK[slotKey]
        if (!setKey) return
        if (setKey.startsWith('Prayers')) return
        skc[setKey] = (skc[setKey] ?? 0) + 1
      })
      const pass = Object.entries(skc).every(([setKey, num]) => {
        const ex = artSetExclusion[setKey as ArtSetExclusionKey]
        if (!ex) return true
        switch (num) {
          case 0:
          case 1:
            return true
          case 2:
          case 3:
            return !ex.includes(2)
          case 4:
          case 5:
            return !ex.includes(4)
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
      .filter(
        (art) =>
          !mainStatKeys[art.slotKey]?.length ||
          mainStatKeys[art.slotKey]?.includes(art.mainStatKey)
      )
      .filter((art) => levelLow <= art.level && art.level <= levelHigh)
    setUpOptCalc(
      new UpOptCalculator(
        nodes,
        [-Infinity, ...valueFilter.map((x) => x.minimum)],
        equippedArts,
        artifactsToConsider
      )
    )
  }, [
    buildSetting,
    characterKey,
    database,
    teamId,
    teamCharId,
    gender,
    activeCharKey,
    loadoutDatum,
  ])

  const dataContext: dataContextObj | undefined = useMemo(() => {
    return data && teamData && { data, teamData }
  }, [data, teamData])

  const pagination = numPages > 1 && (
    <CardThemed bgt="light">
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
              numShowing={indexes.length}
              total={upOptCalc?.artifacts.length ?? 0}
            />
          </Grid>
        </Grid>
      </CardContent>
    </CardThemed>
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
                  lg={4}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  <CardThemed bgt="light">
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
                    <MainStatSelectionCard
                      disabled={false}
                      filteredArtIdMap={filteredArtIdMap}
                    />
                  </CardThemed>
                </Grid>
                {/* 3 */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={5}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  <ArtifactSetConfig disabled={false} />

                  <StatFilterCard disabled={false} />
                </Grid>
              </Grid>
            </Box>
            <ButtonGroup>
              <OptimizationTargetSelector
                optimizationTarget={optimizationTarget}
                setTarget={(target) =>
                  database.optConfigs.set(optConfigId, {
                    optimizationTarget: target,
                  })
                }
                disabled={false}
              />
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
            </ButtonGroup>
            <CardThemed bgt="light">
              <CardContent>
                <Grid container spacing={1}>
                  <Grid item></Grid>
                  <Grid item>
                    <HitModeToggle size="small" />
                  </Grid>
                  <Grid item>
                    <ReactionToggle size="small" />
                  </Grid>
                </Grid>
              </CardContent>
            </CardThemed>
            {pagination}
            {noArtifact && <AddArtInfo />}
            <Suspense fallback={false}>
              <ArtifactEditor
                artifactIdToEdit={artifactIdToEdit}
                cancelEdit={() => setArtifactIdToEdit(undefined)}
                allowUpload
              />
            </Suspense>
            <Suspense
              fallback={
                <Skeleton
                  variant="rectangular"
                  sx={{ width: '100%', height: 600, minHeight: 5000 }}
                />
              }
            >
              {!!upOptCalc &&
                indexes.map((i) => (

                    <UpgradeOptChartCard
                    key={i}
                      upOptCalc={upOptCalc}
                      ix={i}
                      setArtifactIdToEdit={setArtifactIdToEdit}
                      thresholds={upOptCalc.thresholds ?? []}
                      objMax={maxObj0}
                      objMin={minObj0}
                      calcExactCallback={() => {
                        const ix =
                          currentPageIndex * artifactsToDisplayPerPage + i
                        upOptCalc?.calcExact(ix)
                      }}
                    />
                ))}
            </Suspense>
            {pagination}
          </Stack>
        </DataContext.Provider>
      )}
    </Box>
  )
}

function ShowingArt({
  numShowing,
  total,
}: {
  numShowing: number
  total: number
}) {
  return (
    <Typography color="text.secondary">
      <Trans i18nKey="showingNum" count={numShowing} value={total}>
        Showing {{ count: numShowing }} out of {{ value: total }} Artifacts
      </Trans>
    </Typography>
  )
}
