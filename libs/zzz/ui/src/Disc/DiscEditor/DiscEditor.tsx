import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  NextImage,
} from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  range,
  shouldShowDevComponents,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import type { DiscSetKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import {
  allDiscSlotKeys,
  discMaxLevel,
  getDiscMainStatVal,
} from '@genshin-optimizer/zzz/consts'
import {
  type ICachedDisc,
  validateDiscBasedOnRarity,
} from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import type { Processed } from '@genshin-optimizer/zzz/disc-scanner'
import { ScanningQueue } from '@genshin-optimizer/zzz/disc-scanner'
import type { IDisc, ISubstat } from '@genshin-optimizer/zzz/zood'
import AddIcon from '@mui/icons-material/Add'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import ReplayIcon from '@mui/icons-material/Replay'
import UpdateIcon from '@mui/icons-material/Update'
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
  Skeleton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Stack, styled } from '@mui/system'
import type { ChangeEvent, MouseEvent } from 'react'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { LocationAutocomplete } from '../../Character/LocationAutocomplete'
import { DiscCard } from '../DiscCard'
import { DiscMainStatGroup } from '../DiscMainStatGroup'
import { DiscRarityDropdown } from '../DiscRarityDropdown'
import { DiscSetAutocomplete } from '../DiscSetAutocomplete'
import { ScanInfoModal } from './ScanInfoModal'
import { textsFromImage } from './ScanningUtil'
import SubstatInput from './SubstatInput'

// for pasting in screenshots
const InputInvis = styled('input')({
  display: 'none',
})

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
  useEffect(() => setDisc(discFromProp), [discFromProp])

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
      prevEditType: duplicated.length !== 0 ? 'duplicate' : 'upgrade',
    }
  }, [disc, database])

  const { rarity = 'S', level = 0 } = disc ?? {}
  const slotKey = useMemo(() => {
    return fixedSlotKey ?? disc?.slotKey
  }, [fixedSlotKey, disc])

  const reset = useCallback(() => {
    cancelEdit?.()
    setDisc({})
    setScannedData(undefined)
  }, [cancelEdit, setDisc])

  const setSubstat = useCallback(
    (index: number, substat?: ISubstat) => {
      const substats = handleSubstats(index, substat, disc)

      setDisc({ substats })
    },
    [disc, setDisc]
  )
  const onCloseModal = useCallback(
    (e: MouseEvent) => {
      if (
        (disc.id || Object.keys(disc).length > 0) &&
        !window.confirm(t('editor.clearPrompt') as string)
      ) {
        e?.preventDefault()
        return
      }
      onClose()
      reset()
    },
    [t, disc, onClose, reset]
  )
  const isValid = !errors?.length
  const theme = useTheme()
  const grmd = useMediaQuery(theme.breakpoints.up('md'))
  const removeId = disc?.id || prev?.id
  const canClearDisc = (): boolean =>
    window.confirm(t('editor.clearPrompt') as string)

  // Scanning stuff
  const queueRef = useRef(
    new ScanningQueue(textsFromImage, shouldShowDevComponents)
  )
  const queue = queueRef.current
  const [{ processedNum, outstandingNum, scanningNum }, setScanningData] =
    useState({ processedNum: 0, outstandingNum: 0, scanningNum: 0 })

  const [scannedData, setScannedData] = useState(
    undefined as undefined | Omit<Processed, 'disc'>
  )

  const { fileName, imageURL, debugImgs, texts } = scannedData ?? {}
  const queueTotal = processedNum + outstandingNum + scanningNum

  const uploadFiles = useCallback(
    (files?: FileList | null) => {
      if (!files) return
      onShow()
      queue.addFiles(Array.from(files).map((f) => ({ f, fName: f.name })))
    },
    [onShow, queue]
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

  // When there is scanned artifacts and no artifact in editor, put latest scanned artifact in editor
  useEffect(() => {
    if (!processedNum || scannedData) return
    const processed = queue.shiftProcessed()
    if (!processed) return
    const { disc: scannedDisc, ...rest } = processed
    setScannedData(rest)
    setDisc((scannedDisc ?? {}) as Partial<ICachedDisc>)
  }, [queue, processedNum, scannedData, setDisc])

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

  return (
    <Suspense fallback={false}>
      <ModalWrapper open={show} onClose={onCloseModal}>
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
                      disabled={!disc.rarity || level === discMaxLevel[rarity]}
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
                            getDiscMainStatVal(rarity, disc.mainStatKey, level),
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
                  <CardThemed bgt="light">
                    <CardContent
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                    >
                      {/* TODO: artifactDispatch not overwrite */}
                      <Suspense
                        fallback={<Skeleton width="100%" height="100" />}
                      >
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
                                startIcon={<PhotoCameraIcon />}
                              >
                                {t('editor.uploadBtn')}
                              </Button>
                            </label>
                          </Grid>
                          {shouldShowDevComponents && debugImgs && (
                            <Grid item>
                              <DebugModal imgs={debugImgs} />
                            </Grid>
                          )}
                          <Grid item>
                            <ScanInfoModal />
                          </Grid>
                          {/* <Grid item>
                          <Button
                            color="info"
                            sx={{ px: 2, minWidth: 0 }}
                            onClick={() => setModalShow(true)}
                          >
                            <HelpIcon />
                          </Button>
                        </Grid> */}
                        </Grid>

                        {imageURL && (
                          <Box display="flex" justifyContent="center">
                            <Box
                              component={NextImage ? NextImage : 'img'}
                              src={imageURL}
                              width="100%"
                              maxWidth={350}
                              height="auto"
                              maxHeight={1500} // so badly cropped images don't overflow
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
                  <DiscCard disc={prev} />
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
                  {validatedDisc && <DiscCard disc={validatedDisc} />}
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
                  onClick={() => {
                    disc && database.discs.set(prev.id, disc)
                    reset()
                  }}
                  disabled={!validatedDisc || !isValid}
                  color="primary"
                >
                  {t('editor.btnSave')}
                </Button>
              ) : (
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    if (!validatedDisc) return
                    database.discs.new(validatedDisc)
                    reset()
                  }}
                  disabled={!validatedDisc || !isValid}
                  color={prevEditType === 'duplicate' ? 'warning' : 'primary'}
                >
                  {t('editor.btnAdd')}
                </Button>
              )}
              {allowEmpty && (
                <Button
                  startIcon={<ReplayIcon />}
                  disabled={!disc}
                  onClick={() => {
                    canClearDisc() && reset()
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
                    database.discs.set(prev.id, validatedDisc)
                    reset()
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
                    database.discs.remove(removeId)
                    reset()
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
      </ModalWrapper>
    </Suspense>
  )
}

function DebugModal({ imgs }: { imgs: Record<string, string> }) {
  const [show, onOpen, onClose] = useBoolState()
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
