import AddIcon from '@mui/icons-material/Add'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  Divider,
  Grid,
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
import useBoolState from '../../../../../ReactHooks/useBoolState'
import useForceUpdate from '../../../../../ReactHooks/useForceUpdate'
import useMediaQueryUp from '../../../../../ReactHooks/useMediaQueryUp'
import { filterFunction } from '../../../../../Util/SortByFilters'
import useBuildSetting from '../useBuildSetting'

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
        useExcludedArts: true,
      })
    },
    [buildSettingDispatch, artExclusion]
  )
  const onDelSelect = useCallback(
    (id: string) => {
      buildSettingDispatch({
        artExclusion: artExclusion.filter((i) => i !== id),
        useExcludedArts: true,
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
          disabled={disabled}
          startIcon={
            useExcludedArts ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />
          }
          color={useExcludedArts ? 'success' : 'secondary'}
          sx={{ flexGrow: 1 }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box>{t('excludeArt.button_text')}</Box>
            <SqBadge sx={{ whiteSpace: 'normal' }}>
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
  const artIdList = useMemo(() => {
    const filterFunc = filterFunction(filterOption, filterConfigs)
    return (
      dbDirty &&
      database.arts.values
        .filter(filterFunc)
        .map((art) => art.id)
        .filter((id) => !artExclusion.includes(id))
        .slice(0, numToShowMap[brPt])
    )
  }, [dbDirty, database, filterConfigs, filterOption, brPt, artExclusion])

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
          <Box mt={1}>
            <Suspense
              fallback={
                <Skeleton variant="rectangular" width="100%" height={300} />
              }
            >
              <Grid container spacing={1} columns={{ xs: 2, md: 3, lg: 4 }}>
                {artIdList.map((id) => (
                  <Grid item key={id} xs={1}>
                    <ArtifactCard artifactId={id} onClick={clickHandler} />
                  </Grid>
                ))}
              </Grid>
            </Suspense>
          </Box>
        </CardContent>
      </CardDark>
    </ModalWrapper>
  )
}
