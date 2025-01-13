import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  DropdownButton,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import {
  clamp,
  deepClone,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import type {
  DiscRarityKey,
  DiscSetKey,
  DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allDiscSlotKeys,
  discMaxLevel,
  discSlotToMainStatKeys,
  getDiscMainStatVal,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc, IDisc, ISubstat } from '@genshin-optimizer/zzz/db'
import { cachedDisc } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
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
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { MouseEvent } from 'react'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { DiscCard } from '../DiscCard'
import { DiscMainStatDropdown } from '../DiscMainStatDropdown'
import { DiscRarityDropdown } from '../DiscRarityDropdown'
import { DiscSetAutocomplete } from '../DiscSetAutocomplete'
import { discReducer } from './reducer'
import SubstatInput from './SubstatInput'

// TODO: temporary until disc sheet is implemented
interface IDiscSheet {
  rarity: readonly DiscRarityKey[]
  // setEffects: Partial<Record<SetNum, SetEffectEntry>>
  setEffects: any
}
const tempDiscSheet: IDiscSheet = {
  rarity: ['S', 'A', 'B'],
  setEffects: {},
}

// TODO: disc sheets, errors, autocomplete, display text, i18n, ...
export type DiscEditorProps = {
  discIdToEdit?: string
  cancelEdit: () => void
  allowEmpty?: boolean
  disableSet?: boolean
  fixedSlotKey?: DiscSlotKey
}
export function DiscEditor({
  discIdToEdit = 'new',
  cancelEdit,
  fixedSlotKey,
  allowEmpty = false,
  disableSet = false,
}: DiscEditorProps) {
  const { t } = useTranslation('disc')
  const { t: tk } = useTranslation(['discs_gen', 'statKey_gen'])

  const { database } = useDatabaseContext()
  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()
  useEffect(
    () => database.discs.followAny(setDirtyDatabase),
    [database, setDirtyDatabase]
  )

  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    if (discIdToEdit === 'new') {
      setShowEditor(true)
      dispatchDisc({ type: 'reset' })
    }
    const dbDisc =
      discIdToEdit && dirtyDatabase && database.discs.get(discIdToEdit)
    if (dbDisc) {
      setShowEditor(true)
      dispatchDisc({
        type: 'overwrite',
        disc: deepClone(dbDisc),
      })
    }
  }, [discIdToEdit, database, dirtyDatabase])

  const [disc, dispatchDisc] = useReducer(discReducer, undefined)
  const { disc: cDisc, errors } = useMemo(() => {
    if (!disc) return { disc: undefined, errors: [] }
    const validated = cachedDisc(disc, discIdToEdit)
    return validated
  }, [disc, discIdToEdit])

  const {
    prev,
    prevEditType,
  }: {
    prev: ICachedDisc | undefined
    prevEditType: 'edit' | 'duplicate' | 'upgrade' | ''
  } = useMemo(() => {
    const dbDisc =
      dirtyDatabase && discIdToEdit && database.discs.get(discIdToEdit)
    if (dbDisc) return { prev: dbDisc, prevEditType: 'edit' }
    if (disc === undefined) return { prev: undefined, prevEditType: '' }
    const { duplicated, upgraded } =
      dirtyDatabase && database.discs.findDups(disc)
    return {
      prev: duplicated[0] ?? upgraded[0],
      prevEditType: duplicated.length !== 0 ? 'duplicate' : 'upgrade',
    }
  }, [disc, discIdToEdit, database, dirtyDatabase])

  const disableEditSlot =
    (!['new', ''].includes(discIdToEdit) && !!disc?.location) || // Disable slot for equipped disc
    !!fixedSlotKey || // Disable slot if its fixed
    // Disable editing slot of existing discs
    // TODO: disable slot only for discs that are in a build?
    (!!discIdToEdit && discIdToEdit !== 'new')

  const { rarity = 'S', level = 0 } = disc ?? {}
  const slotKey = useMemo(() => {
    return disc?.slotKey ?? fixedSlotKey ?? '1'
  }, [fixedSlotKey, disc])
  const sheet: IDiscSheet | undefined = disc ? tempDiscSheet : undefined

  const update = useCallback(
    (newValue: Partial<IDisc>) => {
      // const newSheet = newValue.setKey ? getArtSheet(newValue.setKey) : sheet!
      const newSheet = newValue.setKey ? tempDiscSheet : sheet!

      function pick<T>(
        value: T | undefined,
        available: readonly T[],
        prefer?: T
      ): T {
        return value && available.includes(value)
          ? value
          : prefer ?? available[0]
      }

      if (newValue.setKey)
        newValue.rarity = pick(disc?.rarity, newSheet.rarity, 'S')

      if (newValue.rarity) newValue.level = disc?.level ?? 0
      if (newValue.level)
        newValue.level = clamp(
          newValue.level,
          0,
          discMaxLevel[newValue.rarity ?? disc!.rarity]
        )
      if (newValue.slotKey)
        newValue.mainStatKey = pick(
          disc?.mainStatKey,
          discSlotToMainStatKeys[newValue.slotKey]
        )

      if (newValue.mainStatKey)
        newValue.substats = (disc?.substats ?? []).filter(
          ({ key }) => key !== newValue.mainStatKey
        )

      dispatchDisc({ type: 'update', disc: newValue })
    },
    [disc, sheet, dispatchDisc]
  )

  const reset = useCallback(() => {
    cancelEdit?.()
    dispatchDisc({ type: 'reset' })
  }, [cancelEdit, dispatchDisc])

  const setSubstat = useCallback(
    (index: number, substat?: ISubstat) =>
      dispatchDisc({ type: 'substat', index, substat }),
    []
  )
  const isValid = !errors.length
  const onClose = useCallback(
    (e: MouseEvent) => {
      if (
        !discIdToEdit &&
        disc &&
        !window.confirm(t('editor.clearPrompt') as string)
      ) {
        e?.preventDefault()
        return
      }
      setShowEditor(false)
      reset()
    },
    [t, discIdToEdit, disc, setShowEditor, reset]
  )

  const theme = useTheme()
  const grmd = useMediaQuery(theme.breakpoints.up('md'))
  const removeId = (discIdToEdit !== 'new' && discIdToEdit) || prev?.id
  const canClearDisc = (): boolean =>
    window.confirm(t('editor.clearPrompt') as string)

  return (
    <Suspense fallback={false}>
      <ModalWrapper open={showEditor} onClose={onClose}>
        <CardThemed bgt="dark">
          <CardHeader
            title="Disc Editor"
            action={
              <IconButton onClick={onClose}>
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
                    disabled={disableSet}
                    size="small"
                    discSetKey={disc?.setKey ?? ''}
                    setDiscSetKey={(key) =>
                      update({ setKey: key as DiscSetKey })
                    }
                    sx={{ flexGrow: 1 }}
                    label={disc?.setKey ? '' : t('editor.unknownSetName')}
                  />
                  <DiscRarityDropdown
                    rarity={disc ? rarity : undefined}
                    onRarityChange={(rarity) => update({ rarity })}
                    filter={(r) => !!sheet?.rarity?.includes?.(r)}
                    disabled={!sheet}
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
                    disabled={!sheet}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0
                      update({ level: value })
                    }}
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
                          .map((i) => 3 * i)
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
                      disabled={!sheet || level === discMaxLevel[rarity]}
                    >
                      +
                    </Button>
                  </ButtonGroup>
                </Box>

                {/* slot */}
                <Box component="div" display="flex">
                  <DropdownButton
                    // startIcon={
                    //   disc?.slotKey ? (
                    //     <SlotIcon slotKey={disc.slotKey} />
                    //   ) : undefined
                    // }
                    title={disc ? tk(disc.slotKey) : t('slot')}
                    value={slotKey}
                    disabled={disableEditSlot || !sheet}
                    color={disc ? 'success' : 'primary'}
                  >
                    {allDiscSlotKeys.map((sk) => (
                      <MenuItem
                        key={sk}
                        selected={slotKey === sk}
                        disabled={slotKey === sk}
                        onClick={() => update({ slotKey: sk })}
                      >
                        {/* <ListItemIcon>
                          <SlotIcon slotKey={sk} />
                        </ListItemIcon> */}
                        {tk(sk)}
                      </MenuItem>
                    ))}
                  </DropdownButton>
                  <CardThemed bgt="light" sx={{ p: 1, ml: 1, flexGrow: 1 }}>
                    <Suspense fallback={<Skeleton width="60%" />}>
                      <Typography color="text.secondary">
                        {tk(`discs_gen:${slotKey}`)}
                      </Typography>
                    </Suspense>
                  </CardThemed>
                </Box>

                {/* main stat */}
                <Box component="div" display="flex" gap={1}>
                  <DiscMainStatDropdown
                    slotKey={slotKey}
                    statKey={disc?.mainStatKey}
                    setStatKey={(mainStatKey) => update({ mainStatKey })}
                    defText={t('mainStat')}
                    dropdownButtonProps={{
                      disabled: !sheet,
                      color: disc ? 'success' : 'primary',
                    }}
                  />
                  <CardThemed bgt="light" sx={{ p: 1, flexGrow: 1 }}>
                    <Typography color="text.secondary">
                      {disc
                        ? toPercent(
                            getDiscMainStatVal(rarity, disc.mainStatKey, level),
                            disc.mainStatKey
                          ).toFixed(statKeyToFixed(disc.mainStatKey))
                        : t('mainStat')}
                    </Typography>
                  </CardThemed>
                  <Button
                    onClick={() => update({ lock: !disc?.lock })}
                    color={disc?.lock ? 'success' : 'primary'}
                    disabled={!disc}
                  >
                    {disc?.lock ? <LockIcon /> : <LockOpenIcon />}
                  </Button>
                </Box>
                {/* <LocationAutocomplete
                  locKey={cDisc?.location ?? ''}
                  setLocKey={(charKey) => update({ location: charKey })}
                /> */}
              </Grid>

              {/* right column */}
              <Grid item xs={1} display="flex" flexDirection="column" gap={1}>
                {/* substat selections */}
                {[0, 1, 2, 3].map((index) => (
                  <SubstatInput
                    key={index}
                    index={index}
                    disc={cDisc}
                    setSubstat={setSubstat}
                  />
                ))}
              </Grid>
            </Grid>

            {/* Duplicate/Updated/Edit UI */}
            {prev && (
              <Grid
                container
                sx={{ justifyContent: 'space-around' }}
                spacing={1}
              >
                <Grid item xs={12} md={5.5} lg={4}>
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
                    <DiscCard disc={prev} />
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
                      <ChevronRightIcon sx={{ fontSize: 40 }} />
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
                    {cDisc && <DiscCard disc={cDisc} />}
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
              {prevEditType === 'edit' ? (
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    disc && database.discs.set(prev!.id, disc)
                    if (!allowEmpty) {
                      setShowEditor(false)
                      cancelEdit()
                    }
                    reset()
                  }}
                  disabled={!disc || !isValid}
                  color="primary"
                >
                  {t('editor.btnSave')}
                </Button>
              ) : (
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    database.discs.new(disc!)
                    if (!allowEmpty) {
                      setShowEditor(false)
                      cancelEdit()
                    }
                    reset()
                  }}
                  disabled={!disc || !isValid}
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
                    disc && database.discs.set(prev.id, disc)
                    reset()
                    if (!allowEmpty) setShowEditor(false)
                  }}
                  disabled={!disc || !isValid}
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
                    if (!allowEmpty) setShowEditor(false)
                  }}
                  disabled={!disc || !isValid}
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
