import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import {
  CardThemed,
  DropdownButton,
  GeneralAutocomplete,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { clamp, deepClone } from '@genshin-optimizer/common/util'
import type {
  AscensionKey,
  LightConeKey,
  SuperimposeKey,
} from '@genshin-optimizer/sr/consts'
import {
  allLightConeKeys,
  allSuperimposeKeys,
  lightConeMaxLevel,
} from '@genshin-optimizer/sr/consts'
import type { ICachedLightCone } from '@genshin-optimizer/sr/db'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import type { ILightCone } from '@genshin-optimizer/sr/srod'
import { ascensionMaxLevel, milestoneLevels } from '@genshin-optimizer/sr/util'
import { Add, Close, DeleteForever, Update } from '@mui/icons-material'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  MenuItem,
  Skeleton,
  Typography,
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
import { lightConeReducer } from './reducer'

// TODO: temporary until light cone sheet is implemented
interface ILightConeSheet {
  superimpose: readonly SuperimposeKey[]
}

const tempLightConeSheet: ILightConeSheet = {
  superimpose: [1, 2, 3, 4, 5],
}

// TODO: light cone sheets, errors, autocomplete, display text, i18n, ...
export type LightConeEditorProps = {
  lightConeIdToEdit?: string
  cancelEdit: () => void
}

export function LightConeEditor({
  lightConeIdToEdit = 'new',
  cancelEdit,
}: LightConeEditorProps) {
  const { t } = useTranslation(['lightCone', 'common'])
  const { database } = useDatabaseContext()
  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()

  useEffect(
    () => database.lightCones.followAny(setDirtyDatabase),
    [database, setDirtyDatabase]
  )

  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    if (lightConeIdToEdit === 'new') {
      setShowEditor(true)
      dispatchLightCone({ type: 'reset' })
    }
    const dbLightCone =
      lightConeIdToEdit &&
      dirtyDatabase &&
      database.lightCones.get(lightConeIdToEdit)
    if (dbLightCone) {
      setShowEditor(true)
      dispatchLightCone({
        type: 'overwrite',
        lightCone: deepClone(dbLightCone),
      })
    }
  }, [lightConeIdToEdit, database, dirtyDatabase])

  const [lightCone, dispatchLightCone] = useReducer(lightConeReducer, undefined)
  const sheet: ILightConeSheet | undefined = lightCone
    ? tempLightConeSheet
    : undefined

  const {
    prev,
    prevEditType,
  }: {
    prev: ICachedLightCone | undefined
    prevEditType: 'edit' | ''
  } = useMemo(() => {
    const dbLightCone =
      dirtyDatabase &&
      lightConeIdToEdit &&
      database.lightCones.get(lightConeIdToEdit)
    if (dbLightCone) return { prev: dbLightCone, prevEditType: 'edit' }
    return { prev: undefined, prevEditType: '' }
  }, [lightConeIdToEdit, database, dirtyDatabase])

  const update = useCallback(
    (newValue: Partial<ILightCone>) => {
      // const newSheet = newValue.key ? getLightConeSheet(newValue.key) : sheet!
      const newSheet = newValue.key ? tempLightConeSheet : sheet!

      function pick<T>(
        value: T | undefined,
        available: readonly T[],
        prefer?: T
      ): T {
        return value && available.includes(value)
          ? value
          : prefer ?? available[0]
      }

      if (newValue.key) {
        newValue.superimpose = pick(
          lightCone?.superimpose,
          newSheet.superimpose,
          Math.min(...newSheet.superimpose) as SuperimposeKey
        )
      }
      if (newValue.level) {
        newValue.level = clamp(newValue.level, 0, lightConeMaxLevel)
      }

      dispatchLightCone({ type: 'update', lightCone: newValue })
    },
    [lightCone, sheet, dispatchLightCone]
  )

  const reset = useCallback(() => {
    cancelEdit?.()
    dispatchLightCone({ type: 'reset' })
  }, [cancelEdit, dispatchLightCone])

  const onClose = useCallback(
    (e: MouseEvent) => {
      if (
        !lightConeIdToEdit &&
        lightCone &&
        !window.confirm(t('editor.clearPrompt') as string)
      ) {
        e?.preventDefault()
        return
      }
      setShowEditor(false)
      reset()
    },
    [t, lightConeIdToEdit, lightCone, setShowEditor, reset]
  )

  const removeId =
    (lightConeIdToEdit !== 'new' && lightConeIdToEdit) || prev?.id

  return (
    <Suspense fallback={false}>
      <ModalWrapper open={showEditor} onClose={onClose}>
        <CardThemed bgt="dark">
          <CardHeader
            title="Light Cone Editor"
            action={
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            }
          />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Grid container spacing={1} columns={{ xs: 1, md: 2 }}>
              {/* name */}
              <Grid item xs={1} md={true} display="flex" flexDirection="column">
                <LightConeAutocomplete
                  lcKey={lightCone?.key ?? ''}
                  setLCKey={(lcKey) => update({ key: lcKey as LightConeKey })}
                  label={lightCone?.key ? '' : t('editor.unknownLightCone')}
                />
              </Grid>

              {/* superimpose */}
              <Grid item xs={true} md="auto" display="flex">
                <SuperimpositionDropdown
                  superimpose={lightCone?.superimpose ?? 1}
                  setSuperimposition={(sk: SuperimposeKey) =>
                    update({ superimpose: sk })
                  }
                  disabled={!lightCone}
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={1}
              columns={{ xs: 1, md: 4 }}
              marginBottom={1}
            >
              {/* level */}
              <Grid item xs={1} display="flex" flexDirection="row" gap={1}>
                <LevelDropdown
                  level={lightCone?.level}
                  ascension={lightCone?.ascension}
                  setLevelAscension={(lv, as) => {
                    update({ level: lv, ascension: as })
                  }}
                  disabled={!lightCone}
                />
              </Grid>

              {/* ascension */}
              <Grid item xs={1} display="flex" gap={1}>
                <CardThemed
                  bgt="light"
                  sx={{ p: 1, flexGrow: 1, alignContent: 'center' }}
                >
                  <Suspense fallback={<Skeleton width="60%" />}>
                    <Typography color="text.secondary" align="center">
                      {t('editor.ascension')} {lightCone?.ascension || 0}
                    </Typography>
                  </Suspense>
                </CardThemed>
              </Grid>

              {/* character location */}
              <Grid
                item
                xs={1}
                md={2}
                display="flex"
                flexDirection="column"
                gap={1}
              >
                <LocationAutocomplete
                  locKey={lightCone?.location ?? ''}
                  setLocKey={(charKey) => update({ location: charKey })}
                />
              </Grid>
            </Grid>
            <Box display="flex" gap={2}>
              {prevEditType === 'edit' ? (
                <Button
                  startIcon={<Add />}
                  onClick={() => {
                    lightCone && database.lightCones.set(prev!.id, lightCone)
                    reset()
                  }}
                  disabled={!lightCone}
                  color="primary"
                >
                  {t('editor.btnSave')}
                </Button>
              ) : (
                <Button
                  startIcon={<Add />}
                  onClick={() => {
                    database.lightCones.new(lightCone!)
                    reset()
                  }}
                  disabled={!lightCone}
                  color="primary"
                >
                  {t('editor.btnAdd')}
                </Button>
              )}
              {prev && prevEditType !== 'edit' && (
                <Button
                  startIcon={<Update />}
                  onClick={() => {
                    lightCone && database.lightCones.set(prev.id, lightCone)
                    reset()
                  }}
                  disabled={!lightCone}
                  color="success"
                >
                  {t('editor.btnUpdate')}
                </Button>
              )}
              {!!removeId && (
                <Button
                  startIcon={<DeleteForever />}
                  onClick={() => {
                    if (!window.confirm(t('editor.confirmDelete'))) return
                    database.lightCones.remove(removeId)
                    reset()
                  }}
                  disabled={!lightCone}
                  color="error"
                  sx={{ top: '2px' }}
                >
                  {t('common:delete')}
                </Button>
              )}
            </Box>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </Suspense>
  )
}

type LightConeAutocompleteProps = {
  lcKey: LightConeKey | ''
  setLCKey: (key: LightConeKey | '') => void
  label?: string
}

export default function LightConeAutocomplete({
  lcKey,
  setLCKey,
  label = '',
}: LightConeAutocompleteProps) {
  const { t } = useTranslation(['lightCone', 'lightConeNames_gen'])
  label = label ? label : t('editor.lightConeName')

  const options = useMemo(
    () =>
      allLightConeKeys.map(
        (key): GeneralAutocompleteOption<LightConeKey | ''> => ({
          key,
          label: t(`lightConeNames_gen:${key}`),
        })
      ),
    [t]
  )

  const onChange = useCallback(
    (k: LightConeKey | '' | null) => setLCKey(k ?? ''),
    [setLCKey]
  )
  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocomplete
        options={options}
        valueKey={lcKey}
        onChange={onChange}
        toImg={() => <> </>} // TODO
        label={label}
      />
    </Suspense>
  )
}

type SuperimpositionDropdownProps = {
  superimpose: SuperimposeKey | undefined
  setSuperimposition: (superimpose: SuperimposeKey) => void
  disabled?: boolean
}

function SuperimpositionDropdown({
  superimpose,
  setSuperimposition,
  disabled = false,
}: SuperimpositionDropdownProps) {
  const { t } = useTranslation('sheet_gen')
  return (
    <DropdownButton
      title={`${t('superimpose')} ${superimpose}`}
      color="primary"
      disabled={disabled}
      fullWidth={true}
    >
      {allSuperimposeKeys.map((sk) => (
        <MenuItem
          key={sk}
          selected={superimpose === sk}
          disabled={superimpose === sk}
          onClick={() => setSuperimposition(sk)}
        >
          {t('superimpose')} {sk}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}

type LevelDropdownProps = {
  level: number | undefined
  ascension: AscensionKey | undefined
  setLevelAscension: (
    level: number | undefined,
    ascension: AscensionKey | undefined
  ) => void
  disabled?: boolean
}

function LevelDropdown({
  level,
  ascension,
  setLevelAscension,
  disabled = false,
}: LevelDropdownProps) {
  const { t } = useTranslation(['sheet_gen', 'common'])

  return (
    <DropdownButton
      title={
        level
          ? `${t('lvl')} ${level}/${ascensionMaxLevel[ascension!]}`
          : t('common:selectlevel')
      }
      color="primary"
      disabled={disabled}
      fullWidth={true}
    >
      {milestoneLevels.map(([lv, as]) => (
        <MenuItem
          key={`${lv}/${as}`}
          selected={level === lv && ascension === as}
          disabled={level === lv && ascension === as}
          onClick={() => setLevelAscension(lv, as)}
        >
          {lv === ascensionMaxLevel[as]
            ? `${t('lvl')} ${lv}`
            : `${t('lvl')} ${lv}/${ascensionMaxLevel[as]}`}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
