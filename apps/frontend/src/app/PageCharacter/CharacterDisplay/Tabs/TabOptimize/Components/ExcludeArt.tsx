import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/react-util'
import { clamp, filterFunction } from '@genshin-optimizer/util'
import AddIcon from '@mui/icons-material/Add'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import SettingsIcon from '@mui/icons-material/Settings'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import BlockIcon from '@mui/icons-material/Block'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  Divider,
  Grid,
  Pagination,
  Skeleton,
  Typography,
} from '@mui/material'
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { Trans, useTranslation } from 'react-i18next'
import ArtifactCardNano from '../../../../../Components/Artifact/ArtifactCardNano'
import ArtifactFilterDisplay from '../../../../../Components/Artifact/ArtifactFilterDisplay'
import CardDark from '../../../../../Components/Card/CardDark'
import CardLight from '../../../../../Components/Card/CardLight'
import CloseButton from '../../../../../Components/CloseButton'
import InfoTooltip from '../../../../../Components/InfoTooltip'
import ModalWrapper from '../../../../../Components/ModalWrapper'
import SqBadge from '../../../../../Components/SqBadge'
import { CharacterContext } from '../../../../../Context/CharacterContext'
import { DatabaseContext } from '../../../../../Database/Database'
import ArtifactCard from '../../../../../PageArtifact/ArtifactCard'
import {
  artifactFilterConfigs,
  initialFilterOption,
} from '../../../../../PageArtifact/ArtifactSort'
import useBuildSetting from '../useBuildSetting'
import type { ICachedArtifact } from '../../../../../Types/artifact'

export default function ExcludeArt({
  disabled = false,
  excludedTotal,
}: {
  disabled?: boolean
  excludedTotal: string
}) {
  const { t } = useTranslation('page_character_optimize')
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const {
    buildSetting: { artExclusion, useExcludedArts },
    buildSettingDispatch,
  } = useBuildSetting(characterKey)
  const [show, onOpen, onClose] = useBoolState(false)
  const numExcludedArt = artExclusion.length
  const [showSel, onOpenSel, onCloseSel] = useBoolState(false)
  const onSelect = useCallback(
    (id: string) => {
      buildSettingDispatch({
        artExclusion: [...artExclusion, id],
        useExcludedArts: false,
      })
    },
    [buildSettingDispatch, artExclusion]
  )
  const onDelSelect = useCallback(
    (id: string) => {
      buildSettingDispatch({
        artExclusion: artExclusion.filter((i) => i !== id),
        useExcludedArts: false,
      })
    },
    [buildSettingDispatch, artExclusion]
  )
  const toggleArtExclusion = useCallback(
    () => buildSettingDispatch({ useExcludedArts: !useExcludedArts }),
    [buildSettingDispatch, useExcludedArts]
  )
  return (
    <>
      {/* Begin modal */}
      <ModalWrapper
        open={show}
        onClose={onClose}
        containerProps={{ maxWidth: 'xl' }}
      >
        <CardDark>
          <CardContent>
            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="h6">{t`excludeArt.title_exclude`}</Typography>
              <InfoTooltip
                title={<Typography>{t`excludeArt.title_tooltip`}</Typography>}
              />
              <Box flexGrow={1} />
              <CloseButton onClick={onClose} size="small" />
            </Box>
          </CardContent>
          <Divider />
          <CardContent>
            <ArtifactSelectModal
              show={showSel}
              onClose={onCloseSel}
              onSelect={onSelect}
              artExclusion={artExclusion}
            />
            <Button
              fullWidth
              onClick={onOpenSel}
              color="info"
              sx={{ mb: 1 }}
              startIcon={<AddIcon />}
            >{t`excludeArt.addExc`}</Button>
            {!!numExcludedArt && (
              <CardLight sx={{ mb: 1 }}>
                <Typography textAlign="center">{t`excludeArt.deSelectExc`}</Typography>
              </CardLight>
            )}
            <Grid
              container
              columns={{ xs: 3, md: 5, lg: 6, xl: 8 }}
              spacing={1}
            >
              {artExclusion.map((id) => (
                <Grid item key={id} xs={1}>
                  <ArtifactCardNano
                    artifactId={id}
                    slotKey="flower"
                    BGComponent={CardLight}
                    onClick={() => onDelSelect(id)}
                    showLocation
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </CardDark>
      </ModalWrapper>

      {/* Button to open modal */}
      <ButtonGroup sx={{ display: 'flex', width: '100%' }}>
        <Button
          onClick={toggleArtExclusion}
          disabled={disabled || !numExcludedArt}
          startIcon={
            useExcludedArts ? <CheckBoxOutlineBlankIcon /> : <CheckBoxIcon />
          }
          color={useExcludedArts ? 'secondary' : 'success'}
          sx={{ flexGrow: 1 }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box>{t('excludeArt.button_txt')}</Box>
            <SqBadge
              sx={{ whiteSpace: 'normal' }}
              color={
                !numExcludedArt
                  ? 'secondary'
                  : useExcludedArts
                  ? 'warning'
                  : 'primary'
              }
            >
              {useExcludedArts ? (
                <Trans t={t} i18nKey="excludeArt.usingNum">
                  Using {{ totalStr: excludedTotal } as TransObject} excluded
                  artifacts
                </Trans>
              ) : (
                <Trans t={t} i18nKey="excludeArt.excNum" count={numExcludedArt}>
                  {{ count: numExcludedArt } as TransObject} artifacts are
                  excluded
                </Trans>
              )}
            </SqBadge>
          </Box>
        </Button>
        <Button
          color="info"
          onClick={onOpen}
          disabled={disabled}
          sx={{ flexShrink: 1 }}
        >
          <SettingsIcon />
        </Button>
      </ButtonGroup>
    </>
  )
}

export function ExcludeArtRedButtons({ artifactIds }: { artifactIds: string[] }) {
  const { t } = useTranslation(['artifact', 'ui'])
  const { database } = useContext(DatabaseContext)
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const {
    buildSetting: { artExclusion },
    buildSettingDispatch,
  } = useBuildSetting(characterKey)
  const { numExcludedArt, numIncludedArt, numUnlock, numLock } = useMemo(() => {
    const artifacts = artifactIds.map((id) =>
      database.arts.get(id)
    ) as ICachedArtifact[]
    const numUnlock = artifacts.reduce((a, art) => a + (art.lock ? 0 : 1), 0)
    const numLock = artifacts.length - numUnlock
    const numIncludedArt = artifacts.reduce((a, art) => a + (artExclusion.includes(art.id) ? 0 : 1), 0)
    const numExcludedArt = artifacts.length - numIncludedArt
    return { numExcludedArt, numIncludedArt, numUnlock, numLock }
  }, [artifactIds, artExclusion, database])

  const excludeArtifacts = () =>
    window.confirm(`Are you sure you want to exclude ${numIncludedArt} artifacts?`) &&
    buildSettingDispatch({
      artExclusion: [...artExclusion, ...artifactIds],
      useExcludedArts: false,
    })

  const includeArtifacts = () =>
    window.confirm(`Are you sure you want to include ${numExcludedArt} artifacts?`) &&
    buildSettingDispatch({
      artExclusion: artExclusion.filter((i) => !artifactIds.includes(i)),
      useExcludedArts: false,
    })

  const lockArtifacts = () =>
    window.confirm(`Are you sure you want to lock ${numUnlock} artifacts?`) &&
    artifactIds.map((id) => database.arts.set(id, { lock: true }))

  const unlockArtifacts = () =>
    window.confirm(`Are you sure you want to unlock ${numLock} artifacts?`) &&
    artifactIds.map((id) => database.arts.set(id, { lock: false }))

  return (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={12} sm={6} md={3}>
        <Button
          fullWidth
          color="error"
          disabled={!numLock}
          onClick={unlockArtifacts}
          startIcon={<LockOpenIcon />}
        >
          <Trans t={t} i18nKey="button.unlockrtifacts">
            Unlock Artifacts
          </Trans>
          <SqBadge sx={{ ml: 1 }} color={numLock ? 'success' : 'secondary'}>
            {numLock}
          </SqBadge>
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Button
          fullWidth
          color="error"
          disabled={!numUnlock}
          onClick={lockArtifacts}
          startIcon={<LockIcon />}
        >
          <Trans t={t} i18nKey="button.lockArtifacts">
            Lock Artifacts
          </Trans>
          <SqBadge sx={{ ml: 1 }} color={numUnlock ? 'success' : 'secondary'}>
            {numUnlock}
          </SqBadge>
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Button
          fullWidth
          color="error"
          disabled={!numIncludedArt}
          onClick={excludeArtifacts}
          startIcon={<BlockIcon />}
        >
          <Trans t={t} i18nKey="button.excludeArtifacts">
            Exclude Artifacts
          </Trans>
          <SqBadge sx={{ ml: 1 }} color={numIncludedArt ? 'success' : 'secondary'}>
            {numIncludedArt}
          </SqBadge>
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Button
          fullWidth
          color="error"
          disabled={!numExcludedArt}
          onClick={includeArtifacts}
          startIcon={<ShowChartIcon />}
        >
          <Trans t={t} i18nKey="button.includeArtifacts">
            Include Artifacts
          </Trans>
          <SqBadge sx={{ ml: 1 }} color={numExcludedArt ? 'success' : 'secondary'}>
            {numExcludedArt}
          </SqBadge>
        </Button>
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="space-around">
        <Typography variant="caption" color="text.secondary">
          <Trans t={t} i18nKey="buttonHint">
            Note: the red buttons above only apply to
            <b>currently filtered artifacts</b>
          </Trans>
        </Typography>
      </Grid>
    </Grid>
  )
}

const numToShowMap = { xs: 2 * 3, sm: 2 * 3, md: 3 * 3, lg: 4 * 3, xl: 4 * 3 }
const filterOptionReducer = (state, action) => ({ ...state, ...action })
function ArtifactSelectModal({
  onSelect,
  show,
  onClose,
  artExclusion,
}: {
  onSelect: (id: string) => void
  show: boolean
  onClose: () => void
  artExclusion: string[]
}) {
  const { t } = useTranslation('page_character_optimize')
  const { t: tk } = useTranslation('artifact')
  const { database } = useContext(DatabaseContext)
  const clickHandler = useCallback(
    (id: string) => {
      onSelect(id)
      onClose()
    },
    [onSelect, onClose]
  )

  const [filterOption, filterOptionDispatch] = useReducer(
    filterOptionReducer,
    initialFilterOption()
  )

  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(() => {
    return database.arts.followAny(forceUpdate)
  }, [database, forceUpdate])

  const brPt = useMediaQueryUp()

  const filterConfigs = useMemo(() => artifactFilterConfigs(), [])
  const { artIdList, totalArtNum } = useMemo(() => {
    const filterFunc = filterFunction(filterOption, filterConfigs)
    const artIdList = (
      dbDirty &&
      database.arts.values
        .filter(filterFunc)
        .map((art) => art.id)
        .filter((id) => !artExclusion.includes(id))
    )
    return { artIdList, totalArtNum: artIdList.length }
  }, [dbDirty, database, filterConfigs, filterOption, artExclusion])

  // Pagination
  const [pageIdex, setpageIdex] = useState(0)
  const invScrollRef = useRef<HTMLDivElement>(null)
  const maxNumArtifactsToDisplay = numToShowMap[brPt]
  const { artifactIdsToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(artIdList.length / maxNumArtifactsToDisplay)
    const currentPageIndex = clamp(pageIdex, 0, numPages-1)
    return {
      artifactIdsToShow: artIdList.slice(
        currentPageIndex * maxNumArtifactsToDisplay,
        (currentPageIndex + 1) * maxNumArtifactsToDisplay
      ),
      numPages,
      currentPageIndex,
    }
  }, [artIdList, pageIdex, maxNumArtifactsToDisplay])

  const totalShowing =
    artIdList.length !== totalArtNum
      ? `${artIdList.length}/${totalArtNum}`
      : `${totalArtNum}`
  const setPage = useCallback(
    (e, value) => {
      invScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      setpageIdex(value - 1)
    },
    [setpageIdex, invScrollRef]
  )

  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'xl' }}
    >
      <CardDark>
        <CardContent
          sx={{
            py: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">{t`excludeArt.selExc`}</Typography>
          <CloseButton onClick={onClose} />
        </CardContent>
        <Divider />
        <CardContent>
          <Suspense
            fallback={
              <Skeleton variant="rectangular" width="100%" height={200} />
            }
          >
            <ArtifactFilterDisplay
              filterOption={filterOption}
              filterOptionDispatch={filterOptionDispatch}
              filteredIds={artIdList}
            />
          </Suspense>
        </CardContent>
        <Divider />
        <CardContent>
          <Box mt={1}>
            <Suspense
              fallback={
                <Skeleton variant="rectangular" width="100%" height={300} />
              }
            >
              <Grid container alignItems="center" sx={{ pb: 1 }}>
                <Grid item flexGrow={1}>
                  <Pagination
                    count={numPages}
                    page={currentPageIndex + 1}
                    onChange={setPage}
                  />
                </Grid>
                <Grid item flexGrow={1}>
                  <ShowingArt
                    numShowing={artifactIdsToShow.length}
                    total={totalShowing}
                    t={tk}
                  />
                </Grid>
              </Grid>
              <ExcludeArtRedButtons artifactIds={artIdList}/>
              <Grid container spacing={1} columns={{ xs: 2, md: 3, lg: 4 }} sx={{ pt: 1 }}>
                {artifactIdsToShow.map((id) => (
                  <Grid item key={id} xs={1}>
                    <ArtifactCard artifactId={id} onClick={clickHandler} />
                  </Grid>
                ))}
              </Grid>
            </Suspense>
          </Box>
          {numPages > 1 && (
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
                    numShowing={artifactIdsToShow.length}
                    total={totalShowing}
                    t={tk}
                  />
                </Grid>
              </Grid>
            </CardContent>
          )}
        </CardContent>
      </CardDark>
    </ModalWrapper>
  )
}

function ShowingArt({ numShowing, total, t }) {
  return (
    <Typography color="text.secondary">
      <Trans t={t} i18nKey="showingNum" count={numShowing} value={total}>
        Showing <b>{{ count: numShowing } as TransObject}</b> out of{' '}
        {{ value: total } as TransObject} Artifacts
      </Trans>
    </Typography>
  )
}
