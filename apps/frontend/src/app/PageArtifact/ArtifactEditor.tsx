import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { clamp, deepClone } from '@genshin-optimizer/common/util'
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
import {
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
  LinearProgress,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { ChangeEvent } from 'react'
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
import ArtifactRarityDropdown from '../Components/Artifact/ArtifactRarityDropdown'
import ArtifactSetAutocomplete from '../Components/Artifact/ArtifactSetAutocomplete'
import ArtifactSlotDropdown from '../Components/Artifact/ArtifactSlotDropdown'
import {
  ArtifactColoredIconStatWithUnit,
  ArtifactStatWithUnit,
} from '../Components/Artifact/ArtifactStatKeyDisplay'
import { LocationAutocomplete } from '../Components/Character/LocationAutocomplete'
import CloseButton from '../Components/CloseButton'
import CustomNumberTextField from '../Components/CustomNumberTextField'
import DropdownButton from '../Components/DropdownMenu/DropdownButton'
import ImgIcon from '../Components/Image/ImgIcon'
import ModalWrapper from '../Components/ModalWrapper'
import { getArtSheet } from '../Data/Artifacts'
import Artifact from '../Data/Artifacts/Artifact'
import StatIcon from '../KeyMap/StatIcon'
import { shouldShowDevComponents } from '../Util/Util'
import ArtifactCard from './ArtifactCard'
import SubstatEfficiencyDisplayCard from './ArtifactEditor/Components/SubstatEfficiencyDisplayCard'
import SubstatInput from './ArtifactEditor/Components/SubstatInput'
import UploadExplainationModal from './ArtifactEditor/Components/UploadExplainationModal'
import { textsFromImage } from './ScanningUtil'

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
export type ArtifactEditorProps = {
  artifactIdToEdit?: string
  cancelEdit: () => void
  allowUpload?: boolean
  allowEmpty?: boolean
  disableSet?: boolean
  fixedSlotKey?: ArtifactSlotKey
}
export default function ArtifactEditor({
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

  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()
  useEffect(
    () => database.arts.followAny(setDirtyDatabase),
    [database, setDirtyDatabase]
  )

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
    (!['new', ''].includes(artifactIdToEdit) && !!artifact?.location) ||
    !!fixedSlotKey

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

  const {
    old,
    oldType,
  }: {
    old: ICachedArtifact | undefined
    oldType: 'edit' | 'duplicate' | 'upgrade' | ''
  } = useMemo(() => {
    const databaseArtifact =
      dirtyDatabase && artifactIdToEdit && database.arts.get(artifactIdToEdit)
    if (databaseArtifact) return { old: databaseArtifact, oldType: 'edit' }
    if (artifact === undefined) return { old: undefined, oldType: '' }
    const { duplicated, upgraded } =
      dirtyDatabase && database.arts.findDups(artifact)
    return {
      old: duplicated[0] ?? upgraded[0],
      oldType: duplicated.length !== 0 ? 'duplicate' : 'upgrade',
    }
  }, [artifact, artifactIdToEdit, database, dirtyDatabase])

  const { artifact: cArtifact, errors } = useMemo(() => {
    if (!artifact) return { artifact: undefined, errors: [] as Displayable[] }
    const validated = cachedArtifact(artifact, artifactIdToEdit)
    return validated
  }, [artifact, artifactIdToEdit])

  const sheet = artifact ? getArtSheet(artifact.setKey) : undefined
  const reset = useCallback(() => {
    cancelEdit?.()
    artifactDispatch({ type: 'reset' })
    setScannedData(undefined)
  }, [cancelEdit, artifactDispatch])
  const update = useCallback(
    (newValue: Partial<IArtifact>) => {
      const newSheet = newValue.setKey ? getArtSheet(newValue.setKey) : sheet!

      function pick<T>(
        value: T | undefined,
        available: readonly T[],
        prefer?: T
      ): T {
        return value && available.includes(value)
          ? value
          : prefer ?? available[0]
      }

      if (newValue.setKey) {
        newValue.rarity = pick(
          artifact?.rarity,
          newSheet.rarity,
          Math.max(...newSheet.rarity) as ArtifactRarity
        )
        // If we're updating an existing artifact, then slotKey should immediately be set to the artifact's slot.
        // Otherwise, if slot selection is disabled but a key has been provided in fixedSlotKey, we assign that
        // value (e.g. when creating a new artifact from the artifact swap UI). If neither, then we default to
        // 'flower'.
        newValue.slotKey = artifact?.slotKey ?? fixedSlotKey ?? 'flower'
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
    [artifact, sheet, artifactDispatch, fixedSlotKey]
  )
  const setSubstat = useCallback(
    (index: number, substat: ISubstat) => {
      artifactDispatch({ type: 'substat', index, substat })
    },
    [artifactDispatch]
  )
  const isValid = !errors.length
  const canClearArtifact = (): boolean =>
    window.confirm(t`editor.clearPrompt` as string)
  const { rarity = 5, level = 0 } = artifact ?? {}
  // Same as above when assigning newValue.slotKey in update.
  const slotKey = useMemo(() => {
    return artifact?.slotKey ?? fixedSlotKey ?? 'flower'
  }, [fixedSlotKey, artifact])
  const { currentEfficiency = 0, maxEfficiency = 0 } = cArtifact
    ? Artifact.getArtifactEfficiency(cArtifact, allSubstatFilter)
    : {}
  const onClose = useCallback(
    (e) => {
      if (
        !artifactIdToEdit &&
        (queueTotal || artifact) &&
        !window.confirm(t`editor.clearPrompt` as string)
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
  const color = artifact ? element ?? 'success' : 'primary'

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
      artifactIdToEdit && dirtyDatabase && database.arts.get(artifactIdToEdit)
    if (databaseArtifact) {
      setShow(true)
      artifactDispatch({
        type: 'overwrite',
        artifact: deepClone(databaseArtifact),
      })
    }
  }, [artifactIdToEdit, database, dirtyDatabase])

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
    const pasteFunc = (e: Event) =>
      uploadFiles((e as ClipboardEvent).clipboardData?.files)
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
  return (
    <ModalWrapper open={show} onClose={onClose}>
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
          action={<CloseButton disabled={!!queueTotal} onClick={onClose} />}
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
                  filter={(r) => !!sheet?.rarity?.includes?.(r)}
                  disabled={!sheet}
                />
              </Box>

              {/* level */}
              <Box component="div" display="flex">
                <CustomNumberTextField
                  id="filled-basic"
                  label="Level"
                  variant="filled"
                  sx={{ flexShrink: 1, flexGrow: 1, mr: 1, my: 0 }}
                  margin="dense"
                  size="small"
                  value={level}
                  disabled={!sheet}
                  placeholder={`0~${rarity * 4}`}
                  onChange={(l) => update({ level: l })}
                />
                <ButtonGroup>
                  <Button
                    onClick={() => update({ level: level - 1 })}
                    disabled={!sheet || level === 0}
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
                            disabled={!sheet || level === i}
                          >
                            {i}
                          </Button>
                        ))
                    : null}
                  <Button
                    onClick={() => update({ level: level + 1 })}
                    disabled={!sheet || level === rarity * 4}
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
                    !sheet ||
                    artifact?.setKey?.startsWith('Prayer')
                  }
                  slotKey={slotKey}
                  onChange={(slotKey) => update({ slotKey })}
                />
                <CardThemed bgt="light" sx={{ p: 1, ml: 1, flexGrow: 1 }}>
                  <Suspense fallback={<Skeleton width="60%" />}>
                    <Typography color="text.secondary">
                      {artifact && sheet?.getSlotName(artifact!.slotKey) ? (
                        <span>
                          <ImgIcon
                            size={2}
                            src={artifactAsset(
                              artifact.setKey,
                              artifact.slotKey
                            )}
                          />
                          {sheet?.getSlotName(artifact!.slotKey)}
                        </span>
                      ) : (
                        t`editor.unknownPieceName`
                      )}
                    </Typography>
                  </Suspense>
                </CardThemed>
              </Box>

              {/* main stat */}
              <Box component="div" display="flex" gap={1}>
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
                        t`mainStat`
                      )}
                    </b>
                  }
                  disabled={!sheet}
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
                      : t`mainStat`}
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
                              Upload Screenshot (or Ctrl-V)
                            </Button>
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
                            component="img"
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
                        ? t`editor.dupArt`
                        : t`editor.upArt`
                      : t`editor.beforeEdit`}
                  </Typography>
                  <ArtifactCard artifactObj={old} />
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
                  >{t`editor.preview`}</Typography>
                  <ArtifactCard artifactObj={cArtifact} />
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
          <Grid container spacing={2}>
            <Grid item>
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
                  {t`editor.btnSave`}
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
                  {t`editor.btnAdd`}
                </Button>
              )}
            </Grid>
            <Grid item flexGrow={1}>
              {allowEmpty && (
                <Button
                  startIcon={<Replay />}
                  disabled={!artifact}
                  onClick={() => {
                    canClearArtifact() && reset()
                  }}
                  color="error"
                >{t`editor.btnClear`}</Button>
              )}
            </Grid>
            <Grid item>
              {process.env.NODE_ENV === 'development' && (
                <Button
                  color="info"
                  startIcon={<Shuffle />}
                  onClick={() =>
                    artifactDispatch({
                      type: 'overwrite',
                      artifact: randomizeArtifact(),
                    })
                  }
                >{t`editor.btnRandom`}</Button>
              )}
            </Grid>
            {old && oldType !== 'edit' && (
              <Grid item>
                <Button
                  startIcon={<Update />}
                  onClick={() => {
                    artifact && database.arts.set(old.id, artifact)
                    allowEmpty ? reset() : setShow(false)
                  }}
                  disabled={!artifact || !isValid}
                  color="success"
                >{t`editor.btnUpdate`}</Button>
              </Grid>
            )}
          </Grid>
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
                  <Box component="img" src={url} maxWidth="100%" />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
