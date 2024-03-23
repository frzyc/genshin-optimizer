import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import { useInfScroll } from '@genshin-optimizer/common/ui'
import { filterFunction } from '@genshin-optimizer/common/util'
import { useDatabase, useOptConfig } from '@genshin-optimizer/gi/db-ui'
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
import ArtifactCardNano from '../../../../../Components/Artifact/ArtifactCardNano'
import ArtifactFilterDisplay from '../../../../../Components/Artifact/ArtifactFilterDisplay'
import CardDark from '../../../../../Components/Card/CardDark'
import CardLight from '../../../../../Components/Card/CardLight'
import InfoTooltip from '../../../../../Components/InfoTooltip'
import ModalWrapper from '../../../../../Components/ModalWrapper'
import SqBadge from '../../../../../Components/SqBadge'
import { TeamCharacterContext } from '../../../../../Context/TeamCharacterContext'
import ArtifactCard from '../../../../../PageArtifact/ArtifactCard'
import {
  artifactFilterConfigs,
  initialFilterOption,
} from '../../../../../PageArtifact/ArtifactSort'

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
  const onSelect = useCallback(
    (id: string) => {
      database.optConfigs.set(optConfigId, {
        artExclusion: [...artExclusion, id],
        useExcludedArts: false,
      })
    },
    [database, optConfigId, artExclusion]
  )
  const onDelSelect = useCallback(
    (id: string) => {
      database.optConfigs.set(optConfigId, {
        artExclusion: artExclusion.filter((i) => i !== id),
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
        <CardDark>
          <CardHeader
            title={
              <Box display="flex" gap={1} alignItems="center">
                <Typography variant="h6">{t`excludeArt.title_exclude`}</Typography>
                <InfoTooltip
                  title={<Typography>{t`excludeArt.title_tooltip`}</Typography>}
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
  const database = useDatabase()
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
  const artifactIds = useMemo(() => {
    const filterFunc = filterFunction(filterOption, filterConfigs)
    return (
      dbDirty &&
      database.arts.values
        .filter(filterFunc)
        .map((art) => art.id)
        .filter((id) => !artExclusion.includes(id))
    )
  }, [dbDirty, database, filterConfigs, filterOption, artExclusion])

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
      <CardDark>
        <CardHeader
          title={t`excludeArt.selExc`}
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
            />
          </Suspense>
          <Box mt={1}>
            <Suspense
              fallback={
                <Skeleton variant="rectangular" width="100%" height={300} />
              }
            >
              <Grid container spacing={1} columns={{ xs: 2, md: 3, lg: 4 }}>
                {artifactIdsToShow.map((id) => (
                  <Grid item key={id} xs={1}>
                    <ArtifactCard artifactId={id} onClick={clickHandler} />
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
      </CardDark>
    </ModalWrapper>
  )
}
