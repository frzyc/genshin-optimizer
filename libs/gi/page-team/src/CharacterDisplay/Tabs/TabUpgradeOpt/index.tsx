import { AdResponsive } from '@genshin-optimizer/common/ad'
import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  bulkCatTotal,
  clamp,
  filterFunction,
  notEmpty,
  objKeyMap,
  objPathValue,
  range,
} from '@genshin-optimizer/common/util'
import type { ArtifactSetKey, CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allArtifactSetKeys,
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import type { ArtSetExclusionKey } from '@genshin-optimizer/gi/db'
import { type ICachedArtifact } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
  useLoadoutArtifacts,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  AddArtInfo,
  ArtifactEditor,
  ArtifactSetMultiAutocomplete,
  ArtifactSlotToggle,
  DataContext,
  GOAdWrapper,
  HitModeToggle,
  NoArtWarning,
  ReactionToggle,
  getTeamData,
  resolveInfo,
  useTeamData,
} from '@genshin-optimizer/gi/ui'
import { uiDataForTeam } from '@genshin-optimizer/gi/uidata'
import type { ArtifactFilterOption } from '@genshin-optimizer/gi/util'
import {
  artifactFilterConfigs,
  initialArtifactFilterOption,
} from '@genshin-optimizer/gi/util'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import { dynamicData, mergeData, optimize } from '@genshin-optimizer/gi/wr'
import AddIcon from '@mui/icons-material/Add'
import {
  Alert,
  Box,
  ButtonGroup,
  CardContent,
  Grid,
  Pagination,
  Skeleton,
  Typography,
} from '@mui/material'
import type { ButtonProps } from '@mui/material/Button'
import Button from '@mui/material/Button'
import { Stack } from '@mui/system'
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CustomMultiTargetButton } from '../../CustomMultiTarget/CustomMultiTargetButton'
import ArtifactSetConfig from '../TabOptimize/Components/ArtifactSetConfig'
import BonusStatsCard from '../TabOptimize/Components/BonusStatsCard'
import MainStatSelectionCard from '../TabOptimize/Components/MainStatSelectionCard'
import { OptCharacterCard } from '../TabOptimize/Components/OptCharacterCard'
import OptimizationTargetSelector from '../TabOptimize/Components/OptimizationTargetSelector'
import StatFilterCard from '../TabOptimize/Components/StatFilterCard'
import { LevelFilter } from './LevelFilter'
import UpgradeOptChartCard from './UpgradeOptChartCard'
import { UpOptCalculator } from './upOpt'

// artifact button gets its own type so multiple translations can be used
type AddArtifactButtonProps = Omit<ButtonProps, 'onClick'> & {
  onClick: () => void
}

function AddArtifactButton({ onClick }: AddArtifactButtonProps) {
  const { t } = useTranslation(['artifact', 'ui'])
  return (
    <Button fullWidth onClick={onClick} color="info" startIcon={<AddIcon />}>
      {t('addNew')}
    </Button>
  )
}

const filterOptionReducer = (
  state: Partial<ArtifactFilterOption>,
  action: Partial<ArtifactFilterOption>
) => ({ ...state, ...action })
export default function TabUpopt() {
  const { t } = useTranslation('page_character_optimize')
  const {
    teamId,
    teamCharId,
    teamChar: { optConfigId, key: characterKey },
    loadoutDatum,
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { gender } = useDBMeta()
  const [filterOption, filterOptionDispatch] = useReducer(
    filterOptionReducer,
    initialArtifactFilterOption()
  )

  const [artifactIdToEdit, setArtifactIdToEdit] = useState<string | undefined>()

  const activeCharKey = database.teams.getActiveTeamChar(teamId)!.key

  const noArtifact = useMemo(() => !database.arts.values.length, [database])

  const optConfig = useOptConfig(optConfigId)!
  const { optimizationTarget, upOptLevelLow, upOptLevelHigh } = optConfig
  const teamData = useTeamData()
  const { target: data } = teamData?.[characterKey as CharacterKey] ?? {}

  const [artsDirty, setArtsDirty] = useForceUpdate()
  /**
   * Only register new/removal for artifact, so that changes to artifact will not cause upopt recalc.
   * Artifact updates are captured in UpgradeOptChartCard.
   * This makes updating an calculated artifact will not update the calculator list.(and will not change place in the list)
   */
  useEffect(
    () =>
      database.arts.followAny(
        (_, reason) =>
          (reason === 'new' || reason === 'remove') && setArtsDirty()
      ),
    [setArtsDirty, database]
  )
  const filteredArts = useMemo(() => {
    const {
      mainStatKeys,
      excludedLocations,
      artExclusion,
      upOptLevelLow,
      upOptLevelHigh,
      useExcludedArts,
    } = optConfig
    const filterFunc = filterFunction(filterOption, artifactFilterConfigs())

    return (
      artsDirty &&
      database.arts.values
        .filter((art) => {
          if (!useExcludedArts && artExclusion.includes(art.id)) return false
          if (art.level < upOptLevelLow) return false
          if (art.level > upOptLevelHigh) return false
          const mainStats = mainStatKeys[art.slotKey]
          if (mainStats?.length && !mainStats.includes(art.mainStatKey))
            return false

          const locKey = charKeyToLocCharKey(characterKey)
          if (
            art.location &&
            art.location !== locKey &&
            excludedLocations.includes(art.location)
          )
            return false

          return true
        })
        .filter(filterFunc)
    )
  }, [optConfig, artsDirty, database, characterKey, filterOption])
  const filteredArtIdMap = useMemo(
    () =>
      objKeyMap(
        filteredArts.map(({ id }) => id),
        (_) => true
      ),
    [filteredArts]
  )

  const { artSetKeys = [], slotKeys = [] } = filterOption

  const { levelTotal, setTotal, slotTotal } = useMemo(() => {
    const catKeys = {
      levelTotal: ['in'],
      setTotal: allArtifactSetKeys,
      slotTotal: allArtifactSlotKeys,
    } as const
    return bulkCatTotal(catKeys, (ctMap) =>
      database.arts.entries.forEach(([id, art]) => {
        const { level, setKey, slotKey } = art
        const { upOptLevelLow, upOptLevelHigh } = optConfig
        if (level >= upOptLevelLow && level <= upOptLevelHigh) {
          ctMap['levelTotal']['in'].total++
          if (filteredArtIdMap[id]) ctMap['levelTotal']['in'].current++
        }
        ctMap['setTotal'][setKey].total++
        ctMap['slotTotal'][slotKey].total++
        if (filteredArtIdMap[id]) {
          ctMap['setTotal'][setKey].current++
          ctMap['slotTotal'][slotKey].current++
        }
      })
    )
  }, [database, optConfig, filteredArtIdMap])

  const equippedArts = useLoadoutArtifacts(loadoutDatum)

  const upOptCalc = useMemo(() => {
    const {
      statFilters,
      optimizationTarget,
      mainStatKeys,
      upOptLevelLow,
      upOptLevelHigh,
      artSetExclusion,
    } = optConfig

    if (!optimizationTarget) return
    // FIXME: Use teamData here because teamData recalcs upon dependency update. Its kind of jank since there are some redundant calcs
    const teamDataLocal =
      teamData &&
      getTeamData(database, teamId, teamCharId, 0, {
        [teamCharId]: { art: [] },
      })
    if (!teamDataLocal) return
    const workerData = uiDataForTeam(
      teamDataLocal.teamData,
      gender,
      activeCharKey
    )[characterKey]?.target.data![0]
    if (!workerData) return
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic
    const optimizationTargetNode = objPathValue(
      workerData.display ?? {},
      optimizationTarget
    ) as NumNode | undefined
    if (!optimizationTargetNode) return

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
          const infoResolved = filterNode?.info && resolveInfo(filterNode.info)
          const minimum =
            infoResolved?.unit === '%' ? setting.value / 100 : setting.value // TODO: Conversion
          return { value: filterNode, minimum }
        })
    )

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
    const artifactsToConsider = filteredArts
      // retrieve the artifacts again, just incase there is an update that is not captured by UpgradeOptChartCard
      .map((art) => database.arts.get(art.id))
      .filter(notEmpty)
      .filter((art) => art.rarity === 5)
      .filter(respectSexExclusion)
      .filter(
        (art) =>
          !mainStatKeys[art.slotKey]?.length ||
          mainStatKeys[art.slotKey]?.includes(art.mainStatKey)
      )
      .filter(
        (art) => upOptLevelLow <= art.level && art.level <= upOptLevelHigh
      )
    if (!artifactsToConsider.length) return
    const nodes = optimize(
      [optimizationTargetNode, ...valueFilter.map((x) => x.value)],
      workerData,
      ({ path: [p] }) => p !== 'dyn'
    )

    return new UpOptCalculator(
      nodes,
      [-Infinity, ...valueFilter.map((x) => x.minimum)],
      equippedArts,
      artifactsToConsider
    )
    /**
     * WARNING:
     * Due to the violatile nature of the calculations above,
     * the dependency for this useMemo needs to be updated within the same render cycle as LoadoutDatum,
     * or crashes may occur when swapping charA upOpt -> charB upOpt
     */
  }, [
    optConfig,
    teamData,
    database,
    teamId,
    teamCharId,
    gender,
    activeCharKey,
    characterKey,
    filteredArts,
    equippedArts,
  ])

  // Paging logic
  const [pageIdex, setpageIdex] = useState(0)

  useEffect(() => {
    // reset paging on new upOptCalc
    setpageIdex(0)
  }, [upOptCalc])

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
                  <OptCharacterCard characterKey={characterKey} />
                  <BonusStatsCard />
                  <CustomMultiTargetButton />
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
                  <LevelFilter
                    levelTotal={levelTotal['in']}
                    upOptLevelLow={upOptLevelLow}
                    upOptLevelHigh={upOptLevelHigh}
                    optConfigId={optConfigId}
                  />
                  <ArtifactSlotToggle
                    onChange={(slotKeys) => {
                      filterOptionDispatch({ slotKeys })
                    }}
                    totals={slotTotal}
                    value={slotKeys}
                  />
                  <ArtifactSetMultiAutocomplete
                    // Only show 5-star artifacts sets as they are filtered out of this page
                    allowRarities={[5]}
                    totals={setTotal}
                    artSetKeys={artSetKeys}
                    setArtSetKeys={(artSetKeys) =>
                      filterOptionDispatch({ artSetKeys })
                    }
                  />
                  <CardThemed bgt="light">
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
                  <AddArtifactButton
                    onClick={() => setArtifactIdToEdit('new')}
                  />
                  <StatFilterCard disabled={false} />
                  <AdResponsive
                    bgt="light"
                    dataAdSlot="3955015620"
                    Ad={GOAdWrapper}
                  />
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
                targetSelectorModalProps={{
                  excludeSections: ['character', 'bonusStats', 'teamBuff'],
                }}
              />
            </ButtonGroup>
            <Alert severity="info">
              <Trans t={t} i18nKey={'upOptInfo'}>
                The Artifact Upgrader identifies artifacts with high potential
                to boost the Optimization Target's value, guiding you to
                artifacts worth leveling up.
                <br />
                As it only swaps one artifact at a time, for the best overall
                build across all artifacts, use the main artifact optimizer.
              </Trans>
            </Alert>
            {Object.values(equippedArts).some((a) => !a) && (
              <Alert severity="warning">
                <Trans t={t} i18nKey={'upOptEmptyBuild'}>
                  You're using a partially empty build. Since the Artifact
                  Upgrader only swaps artifacts individually, completing a set
                  is unlikely. It's recommended to begin with a base build,
                  preferably generated from the main Optimizer.
                </Trans>
              </Alert>
            )}
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
            {!upOptCalc?.artifacts.length && (
              <Alert severity="warning">{t('upOptNoResults')}</Alert>
            )}
            <Suspense
              fallback={
                <Skeleton
                  variant="rectangular"
                  sx={{ width: '100%', height: 600, minHeight: 5000 }}
                />
              }
            >
              {!!upOptCalc &&
                indexes.map(
                  (i) =>
                    upOptCalc.artifacts[i] && (
                      <UpgradeOptChartCard
                        key={`${i}+${upOptCalc.artifacts[i].id}`}
                        upOptCalc={upOptCalc}
                        ix={i}
                        setArtifactIdToEdit={setArtifactIdToEdit}
                        thresholds={upOptCalc.thresholds ?? []}
                        objMax={maxObj0}
                        objMin={minObj0}
                      />
                    )
                )}
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
  const { t } = useTranslation('page_character_optimize')
  return (
    <Typography color="text.secondary">
      <Trans t={t} i18nKey="upOptShowingNum" count={numShowing} value={total}>
        Showing {{ count: numShowing }} out of {{ value: total }} Artifacts
      </Trans>
    </Typography>
  )
}
