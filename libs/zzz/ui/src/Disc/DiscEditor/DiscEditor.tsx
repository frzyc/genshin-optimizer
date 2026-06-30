import { CardThemed, ModalWrapper, usePrev } from '@genshin-optimizer/common-ui'
import {
  getUnitStr,
  range,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common-util'
import type { DiscSetKey, DiscSlotKey } from '@genshin-optimizer/zzz-consts'
import {
  allDiscSlotKeys,
  discMaxLevel,
  getDiscMainStatVal,
} from '@genshin-optimizer/zzz-consts'
import {
  type ICachedDisc,
  validateDiscBasedOnRarity,
} from '@genshin-optimizer/zzz-db'
import { useDatabaseContext } from '@genshin-optimizer/zzz-db-ui'
import type { IDisc, ISubstat } from '@genshin-optimizer/zzz-zood'
import AddIcon from '@mui/icons-material/Add'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import ReplayIcon from '@mui/icons-material/Replay'
import UpdateIcon from '@mui/icons-material/Update'
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Stack } from '@mui/system'
import type { ChangeEvent, MouseEvent } from 'react'
import { Suspense, useCallback, useEffect, useMemo, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { LocationAutocomplete } from '../../Character/LocationAutocomplete'
import { DiscCardObj } from '../DiscCard'
import { DiscMainStatGroup } from '../DiscMainStatGroup'
import { DiscRarityDropdown } from '../DiscRarityDropdown'
import { DiscSetAutocomplete } from '../DiscSetAutocomplete'
import { useDiscEditorSnackbar } from './DiscEditorSnackbarContext'
import type { DiscEditorSnackbarKind } from './DiscEditorSnackbarContext'
import { DiscScanPanel } from './DiscScanPanel'
import SubstatInput from './SubstatInput'
import type { CycleTickResult } from './useGameCapture'
import { useGameCapture } from './useGameCapture'
import { useHandleScanningQueue } from './useHandleScanningQueue'

interface DiscReducerState {
  disc: Partial<ICachedDisc>
  validatedDisc?: IDisc
  errors?: string[]
}
function handleSubstats(
  index: number,
  substat: ISubstat | undefined,
  disc: Partial<ICachedDisc>
): ISubstat[] {
  const substats = [...(disc.substats || [])]
  if (substat) {
    const oldIndex = substat?.key
      ? substats.findIndex((current) => current.key === substat.key)
      : -1
    if (oldIndex === -1 || oldIndex === index) substats[index] = substat
    // Already in used, swap the items instead
    else
      [substats[index], substats[oldIndex]] = [
        substats[oldIndex],
        substats[index],
      ]

    if (oldIndex !== -1 && substats[oldIndex] === undefined) {
      substats.splice(oldIndex, 1)
    }
  } else {
    substats.splice(index, 1)
  }

  return substats
}
function reducer(
  state: DiscReducerState,
  action: Partial<ICachedDisc>
): DiscReducerState {
  if (!action || Object.keys(action).length === 0)
    return {
      disc: {} as Partial<ICachedDisc>,
    }
  const disc = { ...state.disc, ...action }
  const { validatedDisc, errors } = validateDiscBasedOnRarity(disc)

  return {
    // Combine because validatedDisc:IDisc is missing the `id` field in ICachedDisc
    disc: { ...disc, ...(validatedDisc || {}) } as Partial<ICachedDisc>,
    validatedDisc,
    errors,
  }
}
function useDiscValidation(discFromProp: Partial<ICachedDisc>) {
  const [{ disc, validatedDisc, errors }, setDisc] = useReducer(reducer, {
    disc: discFromProp,
    validatedDisc: undefined,
    errors: [],
  })
  if (usePrev(discFromProp) !== discFromProp) setDisc(discFromProp)

  return { disc, validatedDisc, errors, setDisc }
}

export function DiscEditor({
  disc: discFromProp,
  show,
  allowUpload,
  onShow,
  onClose,
  fixedSlotKey,
  allowEmpty = false,
  disableSet = false,
  cancelEdit,
}: {
  disc: Partial<ICachedDisc>
  show: boolean
  allowUpload?: boolean
  onShow: () => void
  onClose: () => void
  allowEmpty?: boolean
  disableSet?: boolean
  fixedSlotKey?: DiscSlotKey
  cancelEdit?: () => void
}) {
  const { t } = useTranslation('disc')
  const { database } = useDatabaseContext()
  const { pushSnackbar } = useDiscEditorSnackbar()
  const { disc, validatedDisc, setDisc, errors } =
    useDiscValidation(discFromProp)
  const {
    prev,
    prevEditType,
  }: {
    prev: ICachedDisc | undefined
    prevEditType: 'edit' | 'duplicate' | 'upgrade' | ''
  } = useMemo(() => {
    if (!disc) return { prev: undefined, prevEditType: '' }
    const dbDisc = disc?.id && database.discs.get(disc?.id)
    if (dbDisc) return { prev: dbDisc, prevEditType: 'edit' }
    if (disc === undefined) return { prev: undefined, prevEditType: '' }
    const { duplicated, upgraded } = database.discs.findDups(
      disc as ICachedDisc
    )
    return {
      prev: duplicated[0] ?? upgraded[0],
      prevEditType:
        duplicated.length !== 0
          ? 'duplicate'
          : upgraded.length !== 0
            ? 'upgrade'
            : '',
    }
  }, [disc, database])

  const { rarity = 'S', level = 0 } = disc ?? {}
  const slotKey = useMemo(() => {
    return fixedSlotKey ?? disc?.slotKey
  }, [fixedSlotKey, disc])

  const {
    scannedData,
    processedNum,
    scanningNum,
    queueTotal,
    queueBusy,
    addFiles,
    uploadFiles,
    clearQueue,
    clearScannedData,
  } = useHandleScanningQueue(onShow, (scanned) => setDisc(scanned))

  const onCapture = useCallback((file: File) => addFiles([file]), [addFiles])

  const isValid = !errors?.length

  const clearEditor = useCallback(() => {
    cancelEdit?.()
    setDisc({})
    clearScannedData()
  }, [cancelEdit, clearScannedData, setDisc])
  const addDisc = useCallback(
    (discToAdd: IDisc) => {
      database.discs.new(discToAdd)
      pushSnackbar('added')
      clearEditor()
    },
    [database.discs, pushSnackbar, clearEditor]
  )

  const updateDisc = useCallback(
    (
      id: string,
      discToUpdate: Partial<ICachedDisc>,
      kind: DiscEditorSnackbarKind = 'updated'
    ) => {
      database.discs.set(id, discToUpdate)
      pushSnackbar(kind)
      clearEditor()
    },
    [database.discs, pushSnackbar, clearEditor]
  )
  const removeDisc = useCallback(
    (id: string) => {
      database.discs.remove(id)
      pushSnackbar('removed')
      clearEditor()
    },
    [database.discs, clearEditor, pushSnackbar]
  )

  const commitCaptureScan = useCallback((): CycleTickResult => {
    if (!isValid) return 'pause'
    if (validatedDisc) {
      const prevId = prev?.id
      if (prevId) {
        updateDisc(
          prevId,
          validatedDisc,
          prevEditType === 'duplicate' ? 'duplicate' : 'updated'
        )
      } else {
        addDisc(validatedDisc)
      }
    }
    return 'proceed'
  }, [addDisc, isValid, prev?.id, prevEditType, updateDisc, validatedDisc])

  const {
    capturePhase,
    captureDeadlineAt,
    isCapturing,
    scheduleCycleTimer,
    startCapture: startGameCapture,
    stopCapture: stopGameCapture,
  } = useGameCapture({
    onShow,
    onCapture,
    queueBusy,
    onCycleTick: commitCaptureScan,
  })
  useEffect(() => {
    if (!isValid) return
    if (capturePhase === 'paused' && !queueBusy) {
      scheduleCycleTimer()
    }
  }, [capturePhase, queueBusy, scheduleCycleTimer, isValid])

  const stopCapture = useCallback(() => {
    stopGameCapture()
  }, [stopGameCapture])

  const startCapture = useCallback(async () => {
    await startGameCapture()
  }, [startGameCapture])

  const setSubstat = useCallback(
    (index: number, substat?: ISubstat) => {
      const substats = handleSubstats(index, substat, disc)

      setDisc({ substats })
    },
    [disc, setDisc]
  )

  const theme = useTheme()
  const grmd = useMediaQuery(theme.breakpoints.up('md'))
  const removeId = disc?.id || prev?.id
  const canClearDisc = (): boolean =>
    window.confirm(t('editor.clearPrompt') as string)

  const {
    fileName,
    imageURL,
    imageWidth,
    imageHeight,
    ocrLines,
    debugImgs,
    texts,
  } = scannedData ?? {}
  const hasEditorContent = !!scannedData || Object.keys(disc).length > 0

  const onCloseModal = useCallback(
    (e: MouseEvent) => {
      if (
        (disc.id || Object.keys(disc).length > 0) &&
        !window.confirm(t('editor.clearPrompt') as string)
      ) {
        e?.preventDefault()
        return
      }
      stopCapture()
      onClose()
      clearEditor()
    },
    [t, disc, onClose, clearEditor, stopCapture]
  )

  const onUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target) return
      uploadFiles(e.target.files)
      e.target.value = '' // reset the value so the same file can be uploaded again...
    },
    [uploadFiles]
  )

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

  return (
    <Suspense fallback={false}>
      <ModalWrapper open={show} onClose={onCloseModal}>
        <Box>
          <CardThemed bgt="dark">
            <CardHeader
              title="Disc Editor"
              action={
                <IconButton onClick={onCloseModal}>
                  <CloseIcon />
                </IconButton>
              }
            />
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              <Grid container spacing={1} columns={{ xs: 1, md: 2 }}>
                {/* left column */}
                <Grid item xs={1} display="flex" flexDirection="column" gap={1}>
                  {/* set */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <DiscSetAutocomplete
                      disabled={disableSet || !!disc.id}
                      size="small"
                      discSetKey={disc?.setKey ?? ''}
                      setDiscSetKey={(key) =>
                        setDisc({ setKey: key as DiscSetKey })
                      }
                      sx={{ flexGrow: 1 }}
                      label={disc?.setKey ? '' : t('editor.unknownSetName')}
                    />
                    <DiscRarityDropdown
                      rarity={disc ? rarity : undefined}
                      onRarityChange={(rarity) => setDisc({ rarity })}
                      disabled={!disc.mainStatKey || !!disc.id}
                    />
                  </Box>
                  {/* level */}
                  <Box component="div" display="flex">
                    <TextField
                      label="Level"
                      variant="filled"
                      sx={{ flexShrink: 1, flexGrow: 1, mr: 1, my: 0 }}
                      margin="dense"
                      size="small"
                      value={level}
                      disabled={!disc.rarity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0
                        setDisc({ level: value })
                      }}
                    />
                    <ButtonGroup>
                      <Button
                        onClick={() => setDisc({ level: level - 1 })}
                        disabled={!disc.rarity || level === 0}
                      >
                        -
                      </Button>
                      {rarity
                        ? range(0, discMaxLevel[rarity] / 3)
                            .map((i) => 3 * i)
                            .map((i) => (
                              <Button
                                key={i}
                                onClick={() => setDisc({ level: i })}
                                disabled={!disc.rarity || level === i}
                              >
                                {i}
                              </Button>
                            ))
                        : null}
                      <Button
                        onClick={() => setDisc({ level: level + 1 })}
                        disabled={
                          !disc.rarity || level === discMaxLevel[rarity]
                        }
                      >
                        +
                      </Button>
                    </ButtonGroup>
                  </Box>
                  {/* slot */}
                  <Stack direction="row" gap={1}>
                    <CardThemed bgt="light" sx={{ px: 2, py: 1 }}>
                      <Typography color="text.secondary">
                        Slot [{slotKey}]
                      </Typography>
                    </CardThemed>
                    <ButtonGroup sx={{ flexGrow: 1 }}>
                      {allDiscSlotKeys.map((sk) => (
                        <Button
                          key={sk}
                          color={sk === slotKey ? 'success' : undefined}
                          onClick={() => setDisc({ slotKey: sk })}
                          disabled={
                            !!disc.id || !!fixedSlotKey || !disc.mainStatKey
                          }
                          sx={{ flexGrow: 1 }}
                        >
                          {sk}
                        </Button>
                      ))}
                    </ButtonGroup>
                    <Button
                      onClick={() => setDisc({ lock: !disc?.lock })}
                      color={disc?.lock ? 'success' : 'primary'}
                      disabled={!disc || !disc.mainStatKey}
                    >
                      {disc?.lock ? <LockIcon /> : <LockOpenIcon />}
                    </Button>
                  </Stack>
                  {/* main stat */}
                  <Box component="div" display="flex" gap={1}>
                    <DiscMainStatGroup
                      slotKey={slotKey}
                      statKey={disc?.mainStatKey}
                      setStatKey={(mainStatKey) => setDisc({ mainStatKey })}
                    />
                    <CardThemed bgt="light" sx={{ p: 1, flexGrow: 1 }}>
                      <Typography color="text.secondary">
                        {disc?.mainStatKey
                          ? `${toPercent(
                              getDiscMainStatVal(
                                rarity,
                                disc.mainStatKey,
                                level
                              ),
                              disc.mainStatKey
                            ).toFixed(
                              statKeyToFixed(disc.mainStatKey)
                            )}${getUnitStr(disc.mainStatKey)}`
                          : t('mainStat')}
                      </Typography>
                    </CardThemed>
                  </Box>
                  <LocationAutocomplete
                    locKey={disc?.location ?? ''}
                    setLocKey={(charKey) => setDisc({ location: charKey })}
                  />
                  {/* Image OCR */}
                  {allowUpload && (
                    <DiscScanPanel
                      uploadLabel={t('editor.uploadBtn')}
                      onUpload={onUpload}
                      capturePhase={capturePhase}
                      captureDeadlineAt={captureDeadlineAt}
                      onToggleCapture={isCapturing ? stopCapture : startCapture}
                      preview={
                        imageURL
                          ? {
                              fileName,
                              imageURL,
                              imageWidth: imageWidth ?? 1,
                              imageHeight: imageHeight ?? 1,
                              ocrLines: ocrLines ?? [],
                              debugImgs,
                            }
                          : undefined
                      }
                      queueTotal={queueTotal}
                      processedNum={processedNum}
                      scanningNum={scanningNum}
                      onClearQueue={clearQueue}
                    />
                  )}
                </Grid>

                {/* right column */}
                <Grid item xs={1} display="flex" flexDirection="column" gap={1}>
                  {/* substat selections */}
                  {[0, 1, 2, 3].map((index) => (
                    <SubstatInput
                      rarity={rarity}
                      key={index}
                      index={index}
                      disc={disc}
                      setSubstat={setSubstat}
                    />
                  ))}
                  {!!texts?.length && (
                    <CardThemed bgt="light">
                      <CardContent>
                        {texts.map((text, i) => (
                          <Typography key={i} color="warning.main">
                            {text}
                          </Typography>
                        ))}
                      </CardContent>
                    </CardThemed>
                  )}
                </Grid>
              </Grid>

              {/* Duplicate/Updated/Edit UI */}
              {prev && (
                <Grid
                  container
                  sx={{ justifyContent: 'space-around' }}
                  spacing={1}
                >
                  <Grid
                    item
                    xs={12}
                    md={5.5}
                    lg={4}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    <CardThemed bgt="light">
                      <Typography
                        sx={{ textAlign: 'center' }}
                        py={1}
                        variant="h6"
                        color="text.secondary"
                      >
                        {prevEditType !== 'edit'
                          ? prevEditType === 'duplicate'
                            ? t('editor.dupeDisc')
                            : t('editor.updateDisc')
                          : t('editor.beforeEdit')}
                      </Typography>
                    </CardThemed>
                    <DiscCardObj disc={prev} />
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
                        <ChevronRightIcon sx={{ fontSize: 40 }} />
                      </CardThemed>
                    </Grid>
                  )}
                  <Grid
                    item
                    xs={12}
                    md={5.5}
                    lg={4}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    <CardThemed bgt="light">
                      <Typography
                        sx={{ textAlign: 'center' }}
                        py={1}
                        variant="h6"
                        color="text.secondary"
                      >
                        {t('editor.preview')}
                      </Typography>
                    </CardThemed>
                    {validatedDisc && <DiscCardObj disc={validatedDisc} />}
                  </Grid>
                </Grid>
              )}
              {/* Error alert */}
              {!isValid && (
                <Alert variant="filled" severity="error">
                  {errors?.map((e, i) => (
                    <div key={i}>{e}</div>
                  ))}
                </Alert>
              )}
              {/* Buttons */}
              <Box display="flex" gap={2}>
                {prevEditType === 'edit' && prev?.id ? (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => updateDisc(prev.id, disc)}
                    disabled={!validatedDisc || !isValid}
                    color="primary"
                  >
                    {t('editor.btnSave')}
                  </Button>
                ) : (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => validatedDisc && addDisc(validatedDisc)}
                    disabled={!validatedDisc || !isValid}
                    color={prevEditType === 'duplicate' ? 'warning' : 'primary'}
                  >
                    {t('editor.btnAdd')}
                  </Button>
                )}
                {allowEmpty && (
                  <Button
                    startIcon={<ReplayIcon />}
                    disabled={!hasEditorContent}
                    onClick={() => {
                      canClearDisc() && clearEditor()
                    }}
                    color="error"
                  >
                    {t('editor.btnClear')}
                  </Button>
                )}
                {prev && prevEditType !== 'edit' && (
                  <Button
                    startIcon={<UpdateIcon />}
                    onClick={() => {
                      if (!validatedDisc) return
                      updateDisc(prev.id, validatedDisc)
                    }}
                    disabled={!isValid}
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
                      removeDisc(removeId)
                    }}
                    disabled={!removeId}
                    color="error"
                  >
                    {t('editor.delete')}
                  </Button>
                )}
              </Box>
            </CardContent>
          </CardThemed>
        </Box>
      </ModalWrapper>
    </Suspense>
  )
}
