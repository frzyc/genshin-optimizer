import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  DropdownButton,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { clamp, deepClone } from '@genshin-optimizer/common/util'
import type {
  RelicRarityKey,
  RelicSetKey,
  RelicSlotKey,
} from '@genshin-optimizer/sr/consts'
import {
  allRelicSlotKeys,
  relicSlotToMainStatKeys,
} from '@genshin-optimizer/sr/consts'
import type { ICachedRelic } from '@genshin-optimizer/sr/db'
import { cachedRelic } from '@genshin-optimizer/sr/db'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import type { IRelic, ISubstat } from '@genshin-optimizer/sr/srod'
import { SlotIcon } from '@genshin-optimizer/sr/svgicons'
import { getRelicMainStatDisplayVal } from '@genshin-optimizer/sr/util'
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
  ListItemIcon,
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
import { LocationAutocomplete } from '../../Character'
import { RelicCard } from '../RelicCard'
import { RelicMainStatDropdown } from '../RelicMainStatDropdown'
import { RelicRarityDropdown } from '../RelicRarityDropdown'
import { relicReducer } from './reducer'
import { RelicSetAutocomplete } from './RelicSetAutocomplete'
import SubstatInput from './SubstatInput'

// TODO: temporary until relic sheet is implemented
interface IRelicSheet {
  rarity: readonly RelicRarityKey[]
  // setEffects: Partial<Record<SetNum, SetEffectEntry>>
  setEffects: any
}
const tempRelicSheet: IRelicSheet = {
  rarity: [5, 4, 3, 2],
  setEffects: {},
}

// TODO: relic sheets, errors, autocomplete, display text, i18n, ...
export type RelicEditorProps = {
  relicIdToEdit?: string
  cancelEdit: () => void
  allowEmpty?: boolean
  disableSet?: boolean
  fixedSlotKey?: RelicSlotKey
}
export function RelicEditor({
  relicIdToEdit = 'new',
  cancelEdit,
  fixedSlotKey,
  allowEmpty = false,
  disableSet = false,
}: RelicEditorProps) {
  const { t } = useTranslation('relic')
  const { t: tk } = useTranslation(['relics_gen', 'statKey_gen'])

  const { database } = useDatabaseContext()
  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()
  useEffect(
    () => database.relics.followAny(setDirtyDatabase),
    [database, setDirtyDatabase]
  )

  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    if (relicIdToEdit === 'new') {
      setShowEditor(true)
      dispatchRelic({ type: 'reset' })
    }
    const dbRelic =
      relicIdToEdit && dirtyDatabase && database.relics.get(relicIdToEdit)
    if (dbRelic) {
      setShowEditor(true)
      dispatchRelic({
        type: 'overwrite',
        relic: deepClone(dbRelic),
      })
    }
  }, [relicIdToEdit, database, dirtyDatabase])

  const [relic, dispatchRelic] = useReducer(relicReducer, undefined)
  const { relic: cRelic, errors } = useMemo(() => {
    if (!relic) return { relic: undefined, errors: [] }
    const validated = cachedRelic(relic, relicIdToEdit)
    return validated
  }, [relic, relicIdToEdit])

  const {
    prev,
    prevEditType,
  }: {
    prev: ICachedRelic | undefined
    prevEditType: 'edit' | 'duplicate' | 'upgrade' | ''
  } = useMemo(() => {
    const dbRelic =
      dirtyDatabase && relicIdToEdit && database.relics.get(relicIdToEdit)
    if (dbRelic) return { prev: dbRelic, prevEditType: 'edit' }
    if (relic === undefined) return { prev: undefined, prevEditType: '' }
    const { duplicated, upgraded } =
      dirtyDatabase && database.relics.findDups(relic)
    return {
      prev: duplicated[0] ?? upgraded[0],
      prevEditType: duplicated.length !== 0 ? 'duplicate' : 'upgrade',
    }
  }, [relic, relicIdToEdit, database, dirtyDatabase])

  const disableEditSlot =
    (!['new', ''].includes(relicIdToEdit) && !!relic?.location) || // Disable slot for equipped relic
    !!fixedSlotKey || // Disable slot if its fixed
    // Disable editing slot of existing relics
    // TODO: disable slot only for relics that are in a build?
    (!!relicIdToEdit && relicIdToEdit !== 'new')

  const { rarity = 5, level = 0 } = relic ?? {}
  const slotKey = useMemo(() => {
    return relic?.slotKey ?? fixedSlotKey ?? 'head'
  }, [fixedSlotKey, relic])
  const sheet: IRelicSheet | undefined = relic ? tempRelicSheet : undefined

  const update = useCallback(
    (newValue: Partial<IRelic>) => {
      // const newSheet = newValue.setKey ? getArtSheet(newValue.setKey) : sheet!
      const newSheet = newValue.setKey ? tempRelicSheet : sheet!

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
          relic?.rarity,
          newSheet.rarity,
          Math.max(...newSheet.rarity) as RelicRarityKey
        )
        newValue.slotKey = pick(relic?.slotKey, ['head', 'hands'])
      }
      if (newValue.rarity) newValue.level = relic?.level ?? 0
      if (newValue.level)
        newValue.level = clamp(
          newValue.level,
          0,
          3 * (newValue.rarity ?? relic!.rarity)
        )
      if (newValue.slotKey)
        newValue.mainStatKey = pick(
          relic?.mainStatKey,
          relicSlotToMainStatKeys[newValue.slotKey]
        )

      if (newValue.mainStatKey) {
        newValue.substats = [0, 1, 2, 3].map((i) =>
          relic && relic.substats[i].key !== newValue.mainStatKey
            ? relic!.substats[i]
            : { key: '', value: 0 }
        )
      }
      dispatchRelic({ type: 'update', relic: newValue })
    },
    [relic, sheet, dispatchRelic]
  )

  const reset = useCallback(() => {
    cancelEdit?.()
    dispatchRelic({ type: 'reset' })
  }, [cancelEdit, dispatchRelic])

  const setSubstat = useCallback(
    (index: number, substat: ISubstat) =>
      dispatchRelic({ type: 'substat', index, substat }),
    []
  )
  const isValid = !errors.length
  const onClose = useCallback(
    (e: MouseEvent) => {
      if (
        !relicIdToEdit &&
        relic &&
        !window.confirm(t('editor.clearPrompt') as string)
      ) {
        e?.preventDefault()
        return
      }
      setShowEditor(false)
      reset()
    },
    [t, relicIdToEdit, relic, setShowEditor, reset]
  )

  const theme = useTheme()
  const grmd = useMediaQuery(theme.breakpoints.up('md'))
  const removeId = (relicIdToEdit !== 'new' && relicIdToEdit) || prev?.id
  const canClearRelic = (): boolean =>
    window.confirm(t('editor.clearPrompt') as string)

  return (
    <Suspense fallback={false}>
      <ModalWrapper open={showEditor} onClose={onClose}>
        <CardThemed bgt="dark">
          <CardHeader
            title="Relic Editor"
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
                  <RelicSetAutocomplete
                    disabled={disableSet}
                    size="small"
                    relicSetKey={relic?.setKey ?? ''}
                    setRelicSetKey={(key) =>
                      update({ setKey: key as RelicSetKey })
                    }
                    sx={{ flexGrow: 1 }}
                    label={relic?.setKey ? '' : t('editor.unknownSetName')}
                  />
                  <RelicRarityDropdown
                    rarity={relic ? rarity : undefined}
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
                      disabled={!sheet || level === rarity * 3}
                    >
                      +
                    </Button>
                  </ButtonGroup>
                </Box>

                {/* slot */}
                <Box component="div" display="flex">
                  <DropdownButton
                    startIcon={
                      relic?.slotKey ? (
                        <SlotIcon slotKey={relic.slotKey} />
                      ) : undefined
                    }
                    title={relic ? tk(relic.slotKey) : t('slot')}
                    value={slotKey}
                    disabled={disableEditSlot || !sheet}
                    color={relic ? 'success' : 'primary'}
                  >
                    {allRelicSlotKeys.map((sk) => (
                      <MenuItem
                        key={sk}
                        selected={slotKey === sk}
                        disabled={slotKey === sk}
                        onClick={() => update({ slotKey: sk })}
                      >
                        <ListItemIcon>
                          <SlotIcon slotKey={sk} />
                        </ListItemIcon>
                        {tk(sk)}
                      </MenuItem>
                    ))}
                  </DropdownButton>
                  <CardThemed bgt="light" sx={{ p: 1, ml: 1, flexGrow: 1 }}>
                    <Suspense fallback={<Skeleton width="60%" />}>
                      <Typography color="text.secondary">
                        {tk(`relics_gen:${slotKey}`)}
                      </Typography>
                    </Suspense>
                  </CardThemed>
                </Box>

                {/* main stat */}
                <Box component="div" display="flex" gap={1}>
                  <RelicMainStatDropdown
                    slotKey={slotKey}
                    statKey={relic?.mainStatKey}
                    setStatKey={(mainStatKey) => update({ mainStatKey })}
                    defText={t('mainStat')}
                    dropdownButtonProps={{
                      disabled: !sheet,
                      color: relic ? 'success' : 'primary',
                    }}
                  />
                  <CardThemed bgt="light" sx={{ p: 1, flexGrow: 1 }}>
                    <Typography color="text.secondary">
                      {relic
                        ? getRelicMainStatDisplayVal(
                            rarity,
                            relic.mainStatKey,
                            level
                          )
                        : t('mainStat')}
                    </Typography>
                  </CardThemed>
                  <Button
                    onClick={() => update({ lock: !relic?.lock })}
                    color={relic?.lock ? 'success' : 'primary'}
                    disabled={!relic}
                  >
                    {relic?.lock ? <LockIcon /> : <LockOpenIcon />}
                  </Button>
                </Box>
                <LocationAutocomplete
                  locKey={cRelic?.location ?? ''}
                  setLocKey={(charKey) => update({ location: charKey })}
                />
              </Grid>

              {/* right column */}
              <Grid item xs={1} display="flex" flexDirection="column" gap={1}>
                {/* substat selections */}
                {[0, 1, 2, 3].map((index) => (
                  <SubstatInput
                    key={index}
                    index={index}
                    relic={cRelic}
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
                          ? t('editor.dupeRelic')
                          : t('editor.updateRelic')
                        : t('editor.beforeEdit')}
                    </Typography>
                    <RelicCard relic={prev} />
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
                    {cRelic && <RelicCard relic={cRelic} />}
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
                    relic && database.relics.set(prev!.id, relic)
                    if (!allowEmpty) {
                      setShowEditor(false)
                      cancelEdit()
                    }
                    reset()
                  }}
                  disabled={!relic || !isValid}
                  color="primary"
                >
                  {t('editor.btnSave')}
                </Button>
              ) : (
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    database.relics.new(relic!)
                    if (!allowEmpty) {
                      setShowEditor(false)
                      cancelEdit()
                    }
                    reset()
                  }}
                  disabled={!relic || !isValid}
                  color={prevEditType === 'duplicate' ? 'warning' : 'primary'}
                >
                  {t('editor.btnAdd')}
                </Button>
              )}
              {allowEmpty && (
                <Button
                  startIcon={<ReplayIcon />}
                  disabled={!relic}
                  onClick={() => {
                    canClearRelic() && reset()
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
                    relic && database.relics.set(prev.id, relic)
                    reset()
                    if (!allowEmpty) setShowEditor(false)
                  }}
                  disabled={!relic || !isValid}
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
                    database.relics.remove(removeId)
                    reset()
                    if (!allowEmpty) setShowEditor(false)
                  }}
                  disabled={!relic || !isValid}
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
