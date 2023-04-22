import { Upgrade, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CardContent,
  Grid,
  Link,
  Skeleton,
  Typography,
  Pagination,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import CardDark from '../../../../Components/Card/CardDark'
import CardLight from '../../../../Components/Card/CardLight'
import CharacterCard from '../../../../Components/Character/CharacterCard'
import StatFilterCard from '../TabOptimize/Components/StatFilterCard'
import ArtifactCard from '../../../../PageArtifact/ArtifactCard'
import BonusStatsCard from '../TabOptimize/Components/BonusStatsCard'
import {
  HitModeToggle,
  ReactionToggle,
} from '../../../../Components/HitModeEditor'
import OptimizationTargetSelector from '../TabOptimize/Components/OptimizationTargetSelector'
import ArtifactSetConfig from '../TabOptimize/Components/ArtifactSetConfig'
import useDBMeta from '../../../../ReactHooks/useDBMeta'

import {
  Suspense,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Trans } from 'react-i18next'
import type { dataContextObj } from '../../../../Context/DataContext'
import { DataContext } from '../../../../Context/DataContext'
import { DatabaseContext } from '../../../../Database/Database'
import { optimize } from '../../../../Formula/optimization'
import type { NumNode } from '../../../../Formula/type'
import useCharSelectionCallback from '../../../../ReactHooks/useCharSelectionCallback'
import useTeamData, { getTeamData } from '../../../../ReactHooks/useTeamData'
import useBuildSetting from '../TabOptimize/useBuildSetting'
import { dynamicData } from '../TabOptimize/foreground'
import { clamp, objectKeyMap, objPathValue } from '../../../../Util/Util'
import { mergeData, uiDataForTeam } from '../../../../Formula/api'
import { evalArtifact } from './evalArtifact'
import type {
  QueryArtifact,
  QueryBuild,
  UpgradeOptResult,
} from './artifactQuery'
import { querySetup, toQueryArtifact, cmpQuery } from './artifactQuery'
import UpgradeOptChartCard from './UpgradeOptChartCard'
import MainStatSelectionCard from '../TabOptimize/Components/MainStatSelectionCard'
import { CharacterContext } from '../../../../Context/CharacterContext'
import ArtifactLevelSlider from '../../../../Components/Artifact/ArtifactLevelSlider'
import type { ICachedArtifact } from '../../../../Types/artifact'
import type { DynStat } from '../../../../Solver/common'
import type { ArtifactSlotKey, CharacterKey } from '@genshin-optimizer/consts'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/consts'
import useForceUpdate from '../../../../ReactHooks/useForceUpdate'

export default function TabUpopt() {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { database } = useContext(DatabaseContext)
  const { gender } = useDBMeta()

  const onClickTeammate = useCharSelectionCallback()

  const noArtifact = useMemo(() => !database.arts.values.length, [database])

  const { buildSetting, buildSettingDispatch } = useBuildSetting(characterKey)
  const { optimizationTarget, levelLow, levelHigh } = buildSetting
  const teamData = useTeamData(characterKey)
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
    () =>
      objectKeyMap(
        filteredArts.map(({ id }) => id),
        (_) => true
      ),
    [filteredArts]
  )

  const [artifactUpgradeOpts, setArtifactUpgradeOpts] = useState(
    undefined as UpgradeOptResult | undefined
  )

  const [show20, setShow20] = useState(true)
  const [check4th, setCheck4th] = useState(true)
  const [useFilters, setUseMainStatFilter] = useState(false)

  // Because upgradeOpt is a two-stage estimation method, we want to expand (slow-estimate) our artifacts lazily as they are needed.
  // Lazy method means we need to take care to never 'lift' any artifacts past the current page, since that may cause a user to miss artifacts
  //  that are lifted in the middle of an expansion. Increase lookahead to mitigate this issue.
  const upgradeOptExpandSink = useCallback(
    (
      { query, arts }: UpgradeOptResult,
      start: number,
      expandTo: number
    ): UpgradeOptResult => {
      const lookahead = 5
      // if (querySaved === undefined) return upOpt
      const queryArts: QueryArtifact[] = database.arts.values
        .filter((art) => art.rarity === 5)
        .map((art) => toQueryArtifact(art, 20))

      const qaLookup: Dict<string, QueryArtifact> = {}
      queryArts.forEach((art) => (qaLookup[art.id] = art))

      const fixedList = arts.slice(0, start)
      const arr = arts.slice(start)

      let i = 0
      const end = Math.min(expandTo - start + lookahead, arr.length)
      do {
        for (; i < end; i++) {
          const arti = qaLookup[arr[i].id]
          if (arti) arr[i] = evalArtifact(query, arti, true, check4th)
        }

        // sort on only bottom half to prevent lifting
        arr.sort(cmpQuery)
        for (i = 0; i < end; i++) {
          if (arr[i].evalMode === 'fast') break
        }
      } while (i < end)

      return { query, arts: [...fixedList, ...arr] }
    },
    [database, check4th]
  )

  // Paging logic
  const [pageIdex, setpageIdex] = useState(0)
  const invScrollRef = useRef<HTMLDivElement>(null)

  const artifactsToDisplayPerPage = 5
  const { artifactsToShow, numPages, currentPageIndex, minObj0, maxObj0 } =
    useMemo(() => {
      if (!artifactUpgradeOpts)
        return {
          artifactsToShow: [],
          numPages: 0,
          toShow: 0,
          minObj0: 0,
          maxObj0: 0,
        }
      const numPages = Math.ceil(
        artifactUpgradeOpts.arts.length / artifactsToDisplayPerPage
      )
      const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
      const toShow = artifactUpgradeOpts.arts.slice(
        currentPageIndex * artifactsToDisplayPerPage,
        (currentPageIndex + 1) * artifactsToDisplayPerPage
      )
      const thr = toShow.length > 0 ? toShow[0].thresholds[0] : 0

      return {
        artifactsToShow: toShow,
        numPages,
        currentPageIndex,
        minObj0: toShow.reduce((a, b) => Math.min(b.distr.lower, a), thr),
        maxObj0: toShow.reduce((a, b) => Math.max(b.distr.upper, a), thr),
      }
    }, [artifactUpgradeOpts, artifactsToDisplayPerPage, pageIdex])

  const setPage = useCallback(
    (e, value) => {
      if (!artifactUpgradeOpts) return
      invScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      const start = (currentPageIndex + 1) * artifactsToDisplayPerPage
      const end = value * artifactsToDisplayPerPage
      const zz = upgradeOptExpandSink(artifactUpgradeOpts, start, end)
      setArtifactUpgradeOpts(zz)
      setpageIdex(value - 1)
    },
    [
      setpageIdex,
      setArtifactUpgradeOpts,
      invScrollRef,
      currentPageIndex,
      artifactsToDisplayPerPage,
      artifactUpgradeOpts,
      upgradeOptExpandSink,
    ]
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

    if (!characterKey || !optimizationTarget) return
    const teamData = await getTeamData(database, characterKey, 0, [])
    if (!teamData) return
    const workerData = uiDataForTeam(teamData.teamData, gender, characterKey)[
      characterKey
    ]?.target.data![0]
    if (!workerData) return
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic
    const optimizationTargetNode = objPathValue(
      workerData.display ?? {},
      optimizationTarget
    ) as NumNode | undefined
    if (!optimizationTargetNode) return
    setArtifactUpgradeOpts(undefined)
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
    // const valueFilter: { value: NumNode, minimum: number }[] = Object.entries(statFilters).map(([key, value]) => {
    //   if (key.endsWith("_")) value = value / 100
    //   return { value: input.total[key], minimum: value }
    // }).filter(x => x.value && x.minimum > -Infinity)

    const equippedArts =
      database.chars.get(characterKey)?.equippedArtifacts ??
      ({} as StrictDict<ArtifactSlotKey, string>)
    const curEquip: QueryBuild = objectKeyMap(
      allArtifactSlotKeys,
      (slotKey) => {
        const art = database.arts.get(equippedArts[slotKey] ?? '')
        return art ? toQueryArtifact(art) : undefined
      }
    )
    const curEquipSetKeys = objectKeyMap(allArtifactSlotKeys, (slotKey) => {
      const art = database.arts.get(equippedArts[slotKey] ?? '')
      return art?.setKey ?? ''
    })
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
            throw Error('error in respectSex: num > 5')
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

    const queryArts: QueryArtifact[] = database.arts.values
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
      .map((art) => toQueryArtifact(art, 20))
    const qaLookup: Dict<string, QueryArtifact> = {}
    queryArts.forEach((art) => (qaLookup[art.id] = art))

    const nodesPreOpt = [
      optimizationTargetNode,
      ...valueFilter.map((x) => x.value),
    ]
    const nodes = optimize(
      nodesPreOpt,
      workerData,
      ({ path: [p] }) => p !== 'dyn'
    )
    const query = querySetup(
      nodes,
      valueFilter.map((x) => x.minimum),
      curEquip,
      data
    )

    let artUpOpt = queryArts.map((art) =>
      evalArtifact(query, art, false, check4th)
    )
    artUpOpt = artUpOpt.sort((a, b) => b.prob * b.upAvg - a.prob * a.upAvg)

    // Re-sort & slow eval
    let upOpt = { query: query, arts: artUpOpt }
    upOpt = upgradeOptExpandSink(upOpt, 0, 5)
    setArtifactUpgradeOpts(upOpt)
    console.log('result', upOpt)
  }, [
    buildSetting,
    characterKey,
    database,
    gender,
    data,
    upgradeOptExpandSink,
    show20,
    useFilters,
    check4th,
  ])

  const dataContext: dataContextObj | undefined = useMemo(() => {
    return data && teamData && { data, teamData }
  }, [data, teamData])

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {noArtifact && (
        <Alert severity="warning" variant="filled">
          {' '}
          Opps! It looks like you haven't added any artifacts to GO yet! You
          should go to the{' '}
          <Link component={RouterLink} to="/artifact">
            Artifacts
          </Link>{' '}
          page and add some!
        </Alert>
      )}
      {/* Build Generator Editor */}
      {dataContext && (
        <DataContext.Provider value={dataContext}>
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
                <CharacterCard
                  characterKey={characterKey}
                  onClickTeammate={onClickTeammate}
                />
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
                <Grid item lg={4} display="flex" flexDirection="column" gap={1}>
                  <CardLight>
                    <CardContent>
                      <span>Optimization Target: </span>
                      {
                        <OptimizationTargetSelector
                          optimizationTarget={optimizationTarget}
                          setTarget={(target) =>
                            buildSettingDispatch({ optimizationTarget: target })
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
                          buildSettingDispatch({ levelLow })
                        }
                        setHigh={(levelHigh) =>
                          buildSettingDispatch({ levelHigh })
                        }
                        setBoth={(levelLow, levelHigh) =>
                          buildSettingDispatch({ levelLow, levelHigh })
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
                <Grid item lg={8} display="flex" flexDirection="column" gap={1}>
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
                              show20 ? <CheckBox /> : <CheckBoxOutlineBlank />
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
                              check4th ? <CheckBox /> : <CheckBoxOutlineBlank />
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
                            onClick={() => setUseMainStatFilter(!useFilters)}
                          >
                            enable filters
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </CardLight>
                </Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid item lg={12}>
                  <CardLight>
                    <CardContent>
                      <Grid container spacing={1}>
                        <Grid item>
                          <Button
                            disabled={
                              !characterKey ||
                              !optimizationTarget ||
                              !objPathValue(
                                data?.getDisplay(),
                                optimizationTarget
                              )
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
                </Grid>

                {numPages > 1 && (
                  <CardDark>
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
                            total={artifactUpgradeOpts?.arts.length}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </CardDark>
                )}

                <Grid item lg={12} spacing={1}>
                  <Grid container display="flex" flexDirection="column" gap={1}>
                    {noArtifact && (
                      <Alert severity="info" variant="filled">
                        Looks like you haven't added any artifacts yet. If you
                        want, there are{' '}
                        <Link
                          color="warning.main"
                          component={RouterLink}
                          to="/scanner"
                        >
                          automatic scanners
                        </Link>{' '}
                        that can speed up the import process!
                      </Alert>
                    )}
                    <Suspense
                      fallback={
                        <Skeleton
                          variant="rectangular"
                          sx={{ width: '100%', height: 600, minHeight: 5000 }}
                        />
                      }
                    >
                      {/* <Grid item display="flex" flexDirection="column" gap={1}> */}
                      {artifactsToShow.map((art) => (
                        <Grid container key={art.id + 'asdfsf'} spacing={1}>
                          <Grid item xs={5} sm={4} md={4} lg={3} xl={3}>
                            <ArtifactCard
                              artifactId={art.id}
                              editorProps={{}}
                            />
                          </Grid>
                          <Grid item xs={7} sm={8} md={8} lg={9} xl={9}>
                            <UpgradeOptChartCard
                              upgradeOpt={art}
                              objMax={maxObj0}
                              objMin={minObj0}
                            />
                          </Grid>
                        </Grid>
                      ))}
                      {/* </Grid> */}
                    </Suspense>
                  </Grid>
                </Grid>

                {numPages > 1 && (
                  <CardDark>
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
                            total={artifactUpgradeOpts?.arts.length}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </CardDark>
                )}
              </Grid>
            </Grid>
          </Grid>
        </DataContext.Provider>
      )}
    </Box>
  )
}

function ShowingArt({ numShowing, total }) {
  return (
    <Typography color="text.secondary">
      <Trans i18nKey="showingNum" count={numShowing} value={total}>
        {/* Showing <b>{{ count: numShowing }}</b> out of {{ value: total }} Artifacts */}
        Showing {{ count: numShowing }} out of {{ value: total }} Artifacts
      </Trans>
    </Typography>
  )
}
