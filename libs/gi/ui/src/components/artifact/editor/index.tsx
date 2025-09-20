'use client'
import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import {
  CardThemed,
  DropdownButton,
  ImgIcon,
  ModalWrapper,
  NextImage,
} from '@genshin-optimizer/common/ui'
import {
  clamp,
  deepClone,
  shouldShowDevComponents,
} from '@genshin-optimizer/common/util'
import type { Processed } from '@genshin-optimizer/gi/art-scanner'
import { ScanningQueue } from '@genshin-optimizer/gi/art-scanner'
import { artifactAsset } from '@genshin-optimizer/gi/assets'
import type {
  ArtifactRarity,
  ArtifactSetKey,
  ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import {
  allElementWithPhyKeys,
  allSubstatKeys,
  artSlotMainKeys,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { cachedArtifact, validateArtifact } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import type { IArtifact, ISubstat } from '@genshin-optimizer/gi/good'
import { getArtSetStat } from '@genshin-optimizer/gi/stats'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import {
  getArtifactEfficiency,
  getMainStatDisplayStr,
  randomizeArtifact,
} from '@genshin-optimizer/gi/util'
import {
  Add,
  ChevronRight,
  PhotoCamera,
  Replay,
  Shuffle,
  Update,
} from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import HelpIcon from '@mui/icons-material/Help'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { ChangeEvent, ReactNode } from 'react'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CustomNumberTextField } from '../../CustomNumberTextField'
import { LocationAutocomplete } from '../../character'
import { ArtifactCardObj } from '../ArtifactCard'
import { ArtifactRarityDropdown } from '../ArtifactRarityDropdown'
import { ArtifactSetAutocomplete } from '../ArtifactSetAutocomplete'
import { ArtifactSlotDropdown } from '../ArtifactSlotDropdown'
import {
  ArtifactColoredIconStatWithUnit,
  ArtifactStatWithUnit,
} from '../ArtifactStatKeyDisplay'
import { ArtifactSetSlotName } from '../ArtifactTrans'
import { textsFromImage } from './ScanningUtil'
import { SubstatEfficiencyDisplayCard } from './SubstatEfficiencyDisplayCard'
import { SubstatInput } from './SubstatInput'
import { UploadExplainationModal } from './UploadExplainationModal'

const allSubstatFilter = new Set(allSubstatKeys)
type ResetMessage = { type: 'reset' }
type SubstatMessage = { type: 'substat'; index: number; substat: ISubstat }
type OverwriteMessage = { type: 'overwrite'; artifact: IArtifact }
type UpdateMessage = { type: 'update'; artifact: Partial<IArtifact> }
type Message = ResetMessage | SubstatMessage | OverwriteMessage | UpdateMessage
function artifactReducer(
  state: IArtifact | undefined,
  action: Message
): IArtifact | undefined {
  const handle = () => {
    switch (action.type) {
      case 'reset':
        return undefined
      case 'substat': {
        const { index, substat } = action
        const oldIndex = substat.key
          ? state!.substats.findIndex((current) => current.key === substat.key)
          : -1
        if (oldIndex === -1 || oldIndex === index)
          state!.substats[index] = substat
        // Already in used, swap the items instead
        else
          [state!.substats[index], state!.substats[oldIndex]] = [
            state!.substats[oldIndex],
            state!.substats[index],
          ]
        return { ...state! }
      }
      case 'overwrite':
        return action.artifact
      case 'update':
        return { ...state!, ...action.artifact }
    }
  }
  const art = handle()
  if (!art) return art
  return validateArtifact(art, true)
}

const InputInvis = styled('input')({
  display: 'none',
})

const LineBreak = styled('br')()

function getDefaultSlotKey(
  artifactSet?: ArtifactSetKey
): Extract<ArtifactSlotKey, 'flower' | 'circlet'> {
  if (artifactSet?.startsWith('Prayers')) {
    return 'circlet'
  } else {
    return 'flower'
  }
}

export type ArtifactEditorProps = {
  artifactIdToEdit?: string
  cancelEdit: () => void
  allowUpload?: boolean
  allowEmpty?: boolean
  disableSet?: boolean
  fixedSlotKey?: ArtifactSlotKey
}
export function ArtifactEditor({
  artifactIdToEdit = '',
  cancelEdit,
  allowUpload = false,
  allowEmpty = false,
  disableSet = false,
  fixedSlotKey,
}: ArtifactEditorProps) {
  const queueRef = useRef(
    new ScanningQueue(textsFromImage, shouldShowDevComponents)
  )
  const queue = queueRef.current
  const { t } = useTranslation('artifact')

  const database = useDatabase()

  const [show, setShow] = useState(false)

  const [artifact, artifactDispatch] = useReducer(artifactReducer, undefined)

  const [modalShow, setModalShow] = useState(false)

  const [{ processedNum, outstandingNum, scanningNum }, setScanningData] =
    useState({ processedNum: 0, outstandingNum: 0, scanningNum: 0 })

  const [scannedData, setScannedData] = useState(
    undefined as undefined | Omit<Processed, 'artifact'>
  )

  const { fileName, imageURL, debugImgs, texts } = scannedData ?? {}

  const queueTotal = processedNum + outstandingNum + scanningNum
  const disableEditSlot =
    (!['new', ''].includes(artifactIdToEdit) && !!artifact?.location) || // Disable slot for equipped artifact
    !!fixedSlotKey || // Disable slot if its fixed
    // Disable editing slot of existing artifacts // TODO: disable slot only for artifacts that are in a build?
    (!!artifactIdToEdit && artifactIdToEdit !== 'new')

  const uploadFiles = useCallback(
    (files?: FileList | null) => {
      if (!files) return
      setShow(true)
      queue.addFiles(Array.from(files).map((f) => ({ f, fName: f.name })))
    },
    [setShow, queue]
  )
  const clearQueue = useCallback(() => {
    queue.clearQueue()
  }, [queue])

  const onUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target) return
      uploadFiles(e.target.files)
      e.target.value = '' // reset the value so the same file can be uploaded again...
    },
    [uploadFiles]
  )
  const artValuesDirty = useDataManagerValues(database.arts)
  const {
    old,
    oldType,
  }: {
    old: ICachedArtifact | undefined
    oldType: 'edit' | 'duplicate' | 'upgrade' | ''
  } = useMemo(() => {
    const databaseArtifact =
      artValuesDirty && artifactIdToEdit && database.arts.get(artifactIdToEdit)
    if (databaseArtifact) return { old: databaseArtifact, oldType: 'edit' }
    if (artifact === undefined) return { old: undefined, oldType: '' }
    const { duplicated, upgraded } =
      artValuesDirty && database.arts.findDups(artifact)
    return {
      old: duplicated[0] ?? upgraded[0],
      oldType: duplicated.length !== 0 ? 'duplicate' : 'upgrade',
    }
  }, [artifact, artifactIdToEdit, database, artValuesDirty])

  const { artifact: cArtifact, errors } = useMemo(() => {
    if (!artifact) return { artifact: undefined, errors: [] as ReactNode[] }
    const validated = cachedArtifact(artifact, artifactIdToEdit)
    return validated
  }, [artifact, artifactIdToEdit])

  const artStat = artifact && getArtSetStat(artifact.setKey)
  const reset = useCallback(() => {
    cancelEdit?.()
    artifactDispatch({ type: 'reset' })
    setScannedData(undefined)
  }, [cancelEdit, artifactDispatch])
  const update = useCallback(
    (newValue: Partial<IArtifact>) => {
      const newStat =
        (newValue.setKey && getArtSetStat(newValue.setKey)) ?? artStat

      function pick<T>(
        value: T | undefined,
        available: readonly T[],
        prefer?: T
      ): T {
        return value && available.includes(value)
          ? value
          : (prefer ?? available[0])
      }

      if (newValue.setKey && newStat) {
        newValue.rarity = pick(
          artifact?.rarity,
          newStat.rarities,
          Math.max(...newStat.rarities)
        ) as ArtifactRarity
        // If we're updating an existing artifact, then slotKey should immediately be set to the artifact's slot.
        // Otherwise, if slot selection is disabled but a key has been provided in fixedSlotKey, we assign that
        // value (e.g. when creating a new artifact from the artifact swap UI). If neither, then we default to
        // 'flower' for all sets and 'circlet' for Prayers Set (Which only have circlets).
        newValue.slotKey =
          artifact?.slotKey ??
          fixedSlotKey ??
          getDefaultSlotKey(newValue.setKey)
      }
      if (newValue.rarity) newValue.level = artifact?.level ?? 0
      if (newValue.level)
        newValue.level = clamp(
          newValue.level,
          0,
          4 * (newValue.rarity ?? artifact!.rarity)
        )
      if (newValue.slotKey)
        newValue.mainStatKey = pick(
          artifact?.mainStatKey,
          artSlotMainKeys[newValue.slotKey]
        )

      if (newValue.mainStatKey) {
        newValue.substats = [0, 1, 2, 3].map((i) =>
          artifact && artifact.substats[i].key !== newValue.mainStatKey
            ? artifact!.substats[i]
            : { key: '', value: 0 }
        )
      }
      artifactDispatch({ type: 'update', artifact: newValue })
    },
    [artifact, artStat, artifactDispatch, fixedSlotKey]
  )
  const setSubstat = useCallback(
    (index: number, substat: ISubstat) => {
      artifactDispatch({ type: 'substat', index, substat })
    },
    [artifactDispatch]
  )
  const isValid = !errors.length
  const canClearArtifact = (): boolean =>
    window.confirm(t('editor.clearPrompt') as string)
  const { rarity = 5, level = 0 } = artifact ?? {}
  // Same as above when assigning newValue.slotKey in update.
  const slotKey = useMemo(() => {
    return artifact?.slotKey ?? fixedSlotKey ?? 'flower'
  }, [fixedSlotKey, artifact])
  const { currentEfficiency = 0, maxEfficiency = 0 } = cArtifact
    ? getArtifactEfficiency(cArtifact, allSubstatFilter)
    : {}
  const onClose = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (
        !artifactIdToEdit &&
        (queueTotal || artifact) &&
        !window.confirm(t('editor.clearPrompt') as string)
      ) {
        e?.preventDefault()
        return
      }
      setShow(false)
      queue.clearQueue()
      reset()
    },
    [t, artifactIdToEdit, queue, artifact, queueTotal, setShow, reset]
  )

  const theme = useTheme()
  const grmd = useMediaQuery(theme.breakpoints.up('md'))

  const element = artifact
    ? allElementWithPhyKeys.find((ele) => artifact.mainStatKey.includes(ele))
    : undefined
  const color = artifact ? (element ?? 'success') : 'primary'
  const guessedRolls = cArtifact?.substats.reduce(
    (accu, { rolls }) => accu + rolls.length,
    0
  )

  const updateSetKey = useCallback(
    (setKey: ArtifactSetKey | '') =>
      update({ setKey: setKey as ArtifactSetKey }),
    [update]
  )
  const setACDisable = useCallback(
    (key: ArtifactSetKey | '') => {
      if (key === '') return true
      //Disable being able to select any of the prayer set unless the current slotkey is circlet
      if (
        disableEditSlot &&
        slotKey !== 'circlet' &&
        (key === 'PrayersForDestiny' ||
          key === 'PrayersForIllumination' ||
          key === 'PrayersForWisdom' ||
          key === 'PrayersToSpringtime')
      )
        return true
      return false
    },
    [disableEditSlot, slotKey]
  )

  useEffect(() => {
    if (artifactIdToEdit === 'new') {
      setShow(true)
      artifactDispatch({ type: 'reset' })
    }
    const databaseArtifact =
      artifactIdToEdit && artValuesDirty && database.arts.get(artifactIdToEdit)
    if (databaseArtifact) {
      setShow(true)
      artifactDispatch({
        type: 'overwrite',
        artifact: deepClone(databaseArtifact),
      })
    }
  }, [artifactIdToEdit, database, artValuesDirty])

  // When there is scanned artifacts and no artifact in editor, put latest scanned artifact in editor
  useEffect(() => {
    if (!processedNum || scannedData) return
    const processed = queue.shiftProcessed()
    if (!processed) return
    const { artifact: scannedArt, ...rest } = processed
    setScannedData(rest)
    artifactDispatch({
      type: 'overwrite',
      artifact: scannedArt,
    })
  }, [queue, processedNum, scannedData])

  useEffect(() => {
    const pasteFunc = (e: Event) => {
      // Don't handle paste if targetting the edit team modal
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return
      }

      uploadFiles((e as ClipboardEvent).clipboardData?.files)
    }

    allowUpload && window.addEventListener('paste', pasteFunc)
    return () => {
      if (allowUpload) window.removeEventListener('paste', pasteFunc)
    }
  }, [uploadFiles, allowUpload])

  // register callback to scanning queue
  useEffect(() => {
    queue.callback = setScanningData
    return () => {
      queue.callback = () => {}
    }
  }, [queue])

  const removeId = (artifactIdToEdit !== 'new' && artifactIdToEdit) || old?.id
  return (
    <ModalWrapper open={show} onClose={onClose} data-testid="artifact-editor">
      <CardThemed>
        <UploadExplainationModal
          modalShow={modalShow}
          hide={() => setModalShow(false)}
        />
        <CardHeader
          title={
            <Trans t={t} i18nKey="editor.title">
              Artifact Editor
            </Trans>
          }
          action={
            <IconButton disabled={!!queueTotal} onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Grid container spacing={1} columns={{ xs: 1, md: 2 }}>
            {/* Left column */}
            <Grid item xs={1} display="flex" flexDirection="column" gap={1}>
              {/* set & rarity */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {/* Artifact Set */}
                <ArtifactSetAutocomplete
                  disabled={disableSet}
                  size="small"
                  artSetKey={artifact?.setKey ?? ''}
                  setArtSetKey={updateSetKey}
                  sx={{ flexGrow: 1 }}
                  label={artifact?.setKey ? '' : t('editor.unknownSetName')}
                  getOptionDisabled={({ key }) => setACDisable(key)}
                />
                {/* rarity dropdown */}
                <ArtifactRarityDropdown
                  rarity={artifact ? rarity : undefined}
                  onChange={(r) => update({ rarity: r })}
                  filter={(r) => !!artStat?.rarities?.includes?.(r)}
                  disabled={!artStat}
                />
              </Box>

              {/* level */}
              <Box component="div" display="flex">
                <CustomNumberTextField
                  id="filled-basic"
                  label={t('editor.level')}
                  variant="filled"
                  sx={{ flexShrink: 1, flexGrow: 1, mr: 1, my: 0 }}
                  margin="dense"
                  size="small"
                  value={level}
                  disabled={!artStat}
                  placeholder={`0~${rarity * 4}`}
                  onChange={(l) => update({ level: l })}
                />
                <ButtonGroup>
                  <Button
                    onClick={() => update({ level: level - 1 })}
                    disabled={!artStat || level === 0}
                  >
                    -
                  </Button>
                  {rarity
                    ? [...Array(rarity + 1).keys()]
                        .map((i) => 4 * i)
                        .map((i) => (
                          <Button
                            key={i}
                            onClick={() => update({ level: i })}
                            disabled={!artStat || level === i}
                          >
                            {i}
                          </Button>
                        ))
                    : null}
                  <Button
                    onClick={() => update({ level: level + 1 })}
                    disabled={!artStat || level === rarity * 4}
                  >
                    +
                  </Button>
                </ButtonGroup>
              </Box>

              {/* slot */}
              <Box component="div" display="flex">
                <ArtifactSlotDropdown
                  disabled={
                    disableEditSlot ||
                    !artStat ||
                    artifact?.setKey?.startsWith('Prayer')
                  }
                  slotKey={slotKey}
                  onChange={(slotKey) =>
                    update({ slotKey: slotKey ? slotKey : undefined })
                  }
                />
                <CardThemed bgt="light" sx={{ p: 1, ml: 1, flexGrow: 1 }}>
                  <Suspense fallback={<Skeleton width="60%" />}>
                    <Typography color="text.secondary">
                      {artifact ? (
                        <span>
                          <ImgIcon
                            size={2}
                            src={artifactAsset(
                              artifact.setKey,
                              artifact.slotKey
                            )}
                          />
                          <ArtifactSetSlotName
                            setKey={artifact.setKey}
                            slotKey={artifact.slotKey}
                          />
                        </span>
                      ) : (
                        t('editor.unknownPieceName')
                      )}
                    </Typography>
                  </Suspense>
                </CardThemed>
              </Box>

              {/* main stat */}
              <Box
                component="div"
                display="flex"
                gap={1}
                data-testid="main-stat"
              >
                <DropdownButton
                  startIcon={
                    artifact?.mainStatKey ? (
                      <StatIcon statKey={artifact.mainStatKey} />
                    ) : undefined
                  }
                  title={
                    <b>
                      {artifact ? (
                        <ArtifactStatWithUnit statKey={artifact.mainStatKey} />
                      ) : (
                        t('mainStat')
                      )}
                    </b>
                  }
                  disabled={!artStat}
                  color={color}
                >
                  {artSlotMainKeys[slotKey].map((mainStatK) => (
                    <MenuItem
                      key={mainStatK}
                      selected={artifact?.mainStatKey === mainStatK}
                      disabled={artifact?.mainStatKey === mainStatK}
                      onClick={() => update({ mainStatKey: mainStatK })}
                    >
                      <ArtifactColoredIconStatWithUnit statKey={mainStatK} />
                    </MenuItem>
                  ))}
                </DropdownButton>
                <CardThemed bgt="light" sx={{ p: 1, flexGrow: 1 }}>
                  <Typography color="text.secondary">
                    {artifact
                      ? getMainStatDisplayStr(
                          artifact.mainStatKey,
                          rarity,
                          level
                        )
                      : t('mainStat')}
                  </Typography>
                </CardThemed>
                <Button
                  disabled={!artifact}
                  onClick={() => update({ lock: !artifact?.lock })}
                  color={artifact?.lock ? 'success' : 'primary'}
                >
                  {artifact?.lock ? <LockIcon /> : <LockOpenIcon />}
                </Button>
              </Box>
              <LocationAutocomplete
                location={artifact?.location ?? ''}
                setLocation={(location) => update({ location })}
                autoCompleteProps={{ disabled: !artifact }}
              />
              <CardThemed bgt="light" sx={{ py: 1, px: 2 }}>
                <Grid container spacing={1}>
                  <Grid item flexGrow={1}>
                    {cArtifact?.totalRolls
                      ? 'Total Rolls: ' + cArtifact.totalRolls
                      : 'Total Guessed Rolls: ' + guessedRolls}
                  </Grid>
                </Grid>
              </CardThemed>
              {/* Current/Max Substats Efficiency */}
              <SubstatEfficiencyDisplayCard
                valid={isValid}
                efficiency={currentEfficiency}
                t={t}
              />
              {currentEfficiency !== maxEfficiency && (
                <SubstatEfficiencyDisplayCard
                  max
                  valid={isValid}
                  efficiency={maxEfficiency}
                  t={t}
                />
              )}
              {/* Image OCR */}
              {allowUpload && (
                <CardThemed bgt="light">
                  <CardContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    {/* TODO: artifactDispatch not overwrite */}
                    <Suspense fallback={<Skeleton width="100%" height="100" />}>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item flexGrow={1}>
                          <label htmlFor="contained-button-file">
                            <InputInvis
                              accept="image/*"
                              id="contained-button-file"
                              multiple
                              type="file"
                              onChange={onUpload}
                            />
                            <Button
                              component="span"
                              startIcon={<PhotoCamera />}
                            >
                              {t('editor.uploadBtn')}
                            </Button>
                            {/* https://github.com/frzyc/genshin-optimizer/pull/2597 */}
                            <LineBreak />
                          </label>
                        </Grid>
                        {shouldShowDevComponents && debugImgs && (
                          <Grid item>
                            <DebugModal imgs={debugImgs} />
                          </Grid>
                        )}
                        <Grid item>
                          <Button
                            color="info"
                            sx={{ px: 2, minWidth: 0 }}
                            onClick={() => setModalShow(true)}
                          >
                            <HelpIcon />
                          </Button>
                        </Grid>
                      </Grid>

                      {imageURL && (
                        <Box display="flex" justifyContent="center">
                          <Box
                            component={NextImage ? NextImage : 'img'}
                            src={imageURL}
                            width="100%"
                            maxWidth={350}
                            height="auto"
                            alt={
                              fileName ||
                              'Screenshot to parse for artifact values'
                            }
                          />
                        </Box>
                      )}
                      {!!queueTotal && (
                        <LinearProgress
                          variant="buffer"
                          value={(100 * processedNum) / queueTotal}
                          valueBuffer={
                            (100 * (processedNum + scanningNum)) / queueTotal
                          }
                        />
                      )}
                      {!!queueTotal && (
                        <CardThemed sx={{ pl: 2 }}>
                          <Box display="flex" alignItems="center">
                            {!!scanningNum && <CircularProgress size="1em" />}
                            <Typography sx={{ flexGrow: 1, ml: 1 }}>
                              <span>
                                Screenshots in file-queue:
                                <b>{queueTotal}</b>
                                {/* {process.env.NODE_ENV === "development" && ` (Debug: Processed ${processed.length}/${maxProcessedCount}, Processing: ${outstanding.filter(entry => entry.result).length}/${maxProcessingCount}, Outstanding: ${outstanding.length})`} */}
                              </span>
                            </Typography>

                            <Button
                              size="small"
                              color="error"
                              onClick={clearQueue}
                            >
                              Clear file-queue
                            </Button>
                          </Box>
                        </CardThemed>
                      )}
                    </Suspense>
                  </CardContent>
                </CardThemed>
              )}
            </Grid>
            {/* Right column */}
            <Grid item xs={1} display="flex" flexDirection="column" gap={1}>
              {/* substat selections */}
              {[0, 1, 2, 3].map((index) => (
                <SubstatInput
                  key={index}
                  index={index}
                  artifact={cArtifact}
                  setSubstat={setSubstat}
                />
              ))}
              {texts && (
                <CardThemed bgt="light">
                  <CardContent>
                    <div>{texts.slotKey}</div>
                    <div>{texts.mainStatKey}</div>
                    <div>{texts.mainStatVal}</div>
                    <div>{texts.rarity}</div>
                    <div>{texts.level}</div>
                    <div>{texts.lock}</div>
                    <div>{texts.substats}</div>
                    <div>{texts.setKey}</div>
                    <div>{texts.location}</div>
                  </CardContent>
                </CardThemed>
              )}
            </Grid>
          </Grid>

          {/* Duplicate/Updated/Edit UI */}
          {old && (
            <Grid container sx={{ justifyContent: 'space-around' }} spacing={1}>
              <Grid item xs={12} md={5.5} lg={4}>
                <CardThemed bgt="light">
                  <Typography
                    sx={{ textAlign: 'center' }}
                    py={1}
                    variant="h6"
                    color="text.secondary"
                  >
                    {oldType !== 'edit'
                      ? oldType === 'duplicate'
                        ? t('editor.dupArt')
                        : t('editor.upArt')
                      : t('editor.beforeEdit')}
                  </Typography>
                  <ArtifactCardObj artifact={old} />
                </CardThemed>
              </Grid>
              {grmd && (
                <Grid
                  item
                  md={1}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <CardThemed bgt="light" sx={{ display: 'flex' }}>
                    <ChevronRight sx={{ fontSize: 40 }} />
                  </CardThemed>
                </Grid>
              )}
              <Grid item xs={12} md={5.5} lg={4}>
                <CardThemed bgt="light">
                  <Typography
                    sx={{ textAlign: 'center' }}
                    py={1}
                    variant="h6"
                    color="text.secondary"
                  >
                    {t('editor.preview')}
                  </Typography>
                  {cArtifact && <ArtifactCardObj artifact={cArtifact} />}
                </CardThemed>
              </Grid>
            </Grid>
          )}

          {/* Error alert */}
          {!isValid && (
            <Alert variant="filled" severity="error">
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </Alert>
          )}
          {/* Buttons */}
          <Box display="flex" gap={2}>
            {oldType === 'edit' ? (
              <Button
                startIcon={<Add />}
                onClick={() => {
                  artifact && database.arts.set(old!.id, artifact)
                  if (!allowEmpty) {
                    setShow(false)
                    cancelEdit()
                  }
                  reset()
                }}
                disabled={!artifact || !isValid}
                color="primary"
              >
                {t('editor.btnSave')}
              </Button>
            ) : (
              <Button
                startIcon={<Add />}
                onClick={() => {
                  database.arts.new(artifact!)
                  if (!allowEmpty) {
                    setShow(false)
                    cancelEdit()
                  }
                  reset()
                }}
                disabled={!artifact || !isValid}
                color={oldType === 'duplicate' ? 'warning' : 'primary'}
              >
                {t('editor.btnAdd')}
              </Button>
            )}
            {allowEmpty && (
              <Button
                startIcon={<Replay />}
                disabled={!artifact}
                onClick={() => {
                  canClearArtifact() && reset()
                }}
                color="error"
              >
                {t('editor.btnClear')}
              </Button>
            )}
            {process.env['NODE_ENV'] === 'development' && (
              <Button
                color="info"
                startIcon={<Shuffle />}
                onClick={() =>
                  artifactDispatch({
                    type: 'overwrite',
                    artifact: randomizeArtifact(artifact),
                  })
                }
              >
                {t('editor.btnRandom')}
              </Button>
            )}
            {old && oldType !== 'edit' && (
              <Button
                startIcon={<Update />}
                onClick={() => {
                  artifact && database.arts.set(old.id, artifact)
                  reset()
                  if (!allowEmpty) setShow(false)
                }}
                disabled={!artifact || !isValid}
                color="success"
              >
                {t('editor.btnUpdate')}
              </Button>
            )}
            {!!removeId && (
              <Button
                startIcon={<DeleteForeverIcon />}
                onClick={() => {
                  if (!window.confirm(t('editor.confirmDelete'))) return
                  database.arts.remove(removeId)
                  reset()
                  if (!allowEmpty) setShow(false)
                }}
                disabled={!artifact || !isValid}
                color="error"
              >
                {t('editor.delete')}
              </Button>
            )}
          </Box>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function DebugModal({ imgs }: { imgs: Record<string, string> }) {
  const [show, setshow] = useState(false)
  const onOpen = () => setshow(true)
  const onClose = () => setshow(false)
  return (
    <>
      <Button color="warning" onClick={onOpen}>
        DEBUG
      </Button>
      <ModalWrapper open={show} onClose={onClose}>
        <CardThemed>
          <CardContent>
            <Stack spacing={1}>
              {Object.entries(imgs).map(([key, url]) => (
                <Box key={key}>
                  <Typography>{key}</Typography>
                  <Box
                    component={NextImage ? NextImage : 'img'}
                    src={url}
                    maxWidth="100%"
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
