import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  InfoTooltip,
  ModalWrapper,
  SqBadge,
  useInfScroll,
} from '@genshin-optimizer/common/ui'
import { filterFunction } from '@genshin-optimizer/common/util'
import {
  TeamCharacterContext,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import {
  ArtifactCard,
  ArtifactCardNano,
  ArtifactFilterDisplay,
  ExcludeIcon,
  OptimizationIcon,
} from '@genshin-optimizer/gi/ui'
import {
  artifactFilterConfigs,
  initialArtifactFilterOption,
} from '@genshin-optimizer/gi/util'
import AddIcon from '@mui/icons-material/Add'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CloseIcon from '@mui/icons-material/Close'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
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
} from 'react'
import { Trans, useTranslation } from 'react-i18next'

export default function ExcludeArt({
  disabled = false,
  excludedTotal,
}: {
  disabled?: boolean
  excludedTotal: string
}) {
  const { t } = useTranslation('page_character_optimize')
  const database = useDatabase()
  const {
    teamChar: { optConfigId },
  } = useContext(TeamCharacterContext)
  const { artExclusion, useExcludedArts } = useOptConfig(optConfigId)!
  const [show, onOpen, onClose] = useBoolState(false)
  const numExcludedArt = artExclusion.length
  const [showSel, onOpenSel, onCloseSel] = useBoolState(false)
  const onExclude = useCallback(
    (ids: string[]) => {
      database.optConfigs.set(optConfigId, {
        artExclusion: [...artExclusion, ...ids],
        useExcludedArts: false,
      })
    },
    [database, optConfigId, artExclusion]
  )
  const onInclude = useCallback(
    (ids: string[]) => {
      database.optConfigs.set(optConfigId, {
        artExclusion: artExclusion.filter((i) => !ids.includes(i)),
        useExcludedArts: false,
      })
    },
    [database, optConfigId, artExclusion]
  )
  const toggleArtExclusion = useCallback(
    () =>
      database.optConfigs.set(optConfigId, {
        useExcludedArts: !useExcludedArts,
      }),
    [database, optConfigId, useExcludedArts]
  )

  return (
    <>
      {/* Begin modal */}
      <ModalWrapper
        open={show}
        onClose={onClose}
        containerProps={{ maxWidth: 'xl' }}
      >
        <CardThemed>
          <CardHeader
            title={
              <Box display="flex" gap={1} alignItems="center">
                <Typography variant="h6">
                  {t('excludeArt.title_exclude')}
                </Typography>
                <InfoTooltip
                  title={
                    <Typography>{t('excludeArt.title_tooltip')}</Typography>
                  }
                />
              </Box>
            }
            action={
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            }
          />

          <Divider />
          <CardContent>
            <ArtifactSelectModal
              show={showSel}
              onClose={onCloseSel}
              onExclude={onExclude}
              onInclude={onInclude}
              artExclusion={artExclusion}
            />
            <Button
              fullWidth
              onClick={onOpenSel}
              color="info"
              sx={{ mb: 1 }}
              startIcon={<AddIcon />}
            >
              {t('excludeArt.addExc')}
            </Button>
            {!!numExcludedArt && (
              <CardThemed bgt="light" sx={{ mb: 1 }}>
                <Typography textAlign="center">
                  {t('excludeArt.deSelectExc')}
                </Typography>
              </CardThemed>
            )}
            <Grid
              container
              columns={{ xs: 3, md: 5, lg: 6, xl: 8 }}
              spacing={1}
            >
              {artExclusion.map((id) => (
                <Grid item key={id} xs={1}>
                  <CardThemed
                    bgt="light"
                    sx={{ height: '100%', maxHeight: '8em' }}
                  >
                    <ArtifactCardNano
                      artifactId={id}
                      slotKey="flower"
                      onClick={() => onInclude([id])}
                      showLocation
                    />
                  </CardThemed>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </CardThemed>
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
                  Using {{ totalStr: excludedTotal } as any} excluded artifacts
                </Trans>
              ) : (
                <Trans t={t} i18nKey="excludeArt.excNum" count={numExcludedArt}>
                  {{ count: numExcludedArt } as any} artifacts are excluded
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

function ExcludeArtRedButtons({
  artifactIds,
  artExclusion,
  onExclude,
  onInclude,
}: {
  artifactIds: string[]
  artExclusion: string[]
  onExclude: (ids: string[]) => void
  onInclude: (ids: string[]) => void
}) {
  const { t } = useTranslation('page_character_optimize')
  const { numExclude, numInclude } = useMemo(() => {
    const excludedFiltered = artExclusion.filter((i) => artifactIds.includes(i))

    const numExclude = artifactIds.length - excludedFiltered.length
    const numInclude = artifactIds.length - numExclude

    return { numExclude, numInclude }
  }, [artifactIds, artExclusion])

  const excludeArtifacts = () =>
    window.confirm(t('optExcludeModal.excludeMsg', { count: numExclude })) &&
    onExclude(artifactIds)
  const includeArtifacts = () =>
    window.confirm(t('optExcludeModal.includeMsg', { count: numInclude })) &&
    onInclude(artifactIds)

  return (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={12} sm={6} md={6}>
        <Button
          fullWidth
          color="error"
          disabled={!numExclude}
          onClick={excludeArtifacts}
          startIcon={<ExcludeIcon />}
        >
          {t('optExcludeModal.excludeBtn')}
          <SqBadge sx={{ ml: 1 }} color={numExclude ? 'success' : 'secondary'}>
            {numExclude}
          </SqBadge>
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <Button
          fullWidth
          color="error"
          disabled={!numInclude}
          onClick={includeArtifacts}
          startIcon={<OptimizationIcon />}
        >
          {t('optExcludeModal.includeBtn')}
          <SqBadge sx={{ ml: 1 }} color={numInclude ? 'success' : 'secondary'}>
            {numInclude}
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
  onExclude,
  onInclude,
  show,
  onClose,
  artExclusion,
}: {
  onExclude: (ids: string[]) => void
  onInclude: (ids: string[]) => void
  show: boolean
  onClose: () => void
  artExclusion: string[]
}) {
  const { t } = useTranslation('page_character_optimize')
  const database = useDatabase()
  const [filterOption, filterOptionDispatch] = useReducer(
    filterOptionReducer,
    initialArtifactFilterOption()
  )

  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(() => {
    return database.arts.followAny(forceUpdate)
  }, [database, forceUpdate])

  const brPt = useMediaQueryUp()

  const filterConfigs = useMemo(
    () => artifactFilterConfigs({ excludedIds: artExclusion }),
    [artExclusion]
  )
  const artifactIds = useMemo(() => {
    const filterFunc = filterFunction(filterOption, filterConfigs)
    return (
      dbDirty && database.arts.values.filter(filterFunc).map((art) => art.id)
    )
  }, [dbDirty, database, filterConfigs, filterOption])

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    artifactIds.length
  )
  const artifactIdsToShow = useMemo(
    () => artifactIds.slice(0, numShow),
    [artifactIds, numShow]
  )
  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'xl' }}
    >
      <CardThemed>
        <CardHeader
          title={t('excludeArt.selExc')}
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
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
              filteredIds={artifactIds}
              enableExclusionFilter={true}
              excludedIds={artExclusion}
            />
          </Suspense>
          <Box mt={1}>
            <ExcludeArtRedButtons
              artifactIds={artifactIds}
              artExclusion={artExclusion}
              onExclude={onExclude}
              onInclude={onInclude}
            />
          </Box>
          <Box mt={1}>
            <Suspense
              fallback={
                <Skeleton variant="rectangular" width="100%" height={300} />
              }
            >
              <Grid container spacing={1} columns={{ xs: 2, md: 3, lg: 4 }}>
                {artifactIdsToShow.map((id) => (
                  <Grid item key={id} xs={1}>
                    <ArtifactCard
                      artifactId={id}
                      excluded={artExclusion.includes(id)}
                      onClick={() =>
                        artExclusion.includes(id)
                          ? onInclude([id])
                          : onExclude([id])
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Suspense>
            {artifactIds.length !== artifactIdsToShow.length && (
              <Skeleton
                ref={(node) => {
                  if (!node) return
                  setTriggerElement(node)
                }}
                sx={{ borderRadius: 1, mt: 1 }}
                variant="rectangular"
                width="100%"
                height={100}
              />
            )}
          </Box>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
