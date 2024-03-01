import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { CardThemed, DropdownButton } from '@genshin-optimizer/common/ui'
import { clamp, deepClone } from '@genshin-optimizer/common/util'
import type { LightConeKey, SuperimposeKey } from '@genshin-optimizer/sr/consts'
import {
  allLightConeKeys,
  allSuperimposeKeys,
  lightConeMaxLevel,
} from '@genshin-optimizer/sr/consts'
import type { ILightCone } from '@genshin-optimizer/sr/srod'
import { ascensionMaxLevel, milestoneLevels } from '@genshin-optimizer/sr/util'
import { Add } from '@mui/icons-material'
import {
  Button,
  CardContent,
  CardHeader,
  Container,
  Grid,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { useCallback, useEffect, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { LocationAutocomplete } from '../../Character'
import { useDatabaseContext } from '../../Context'
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
}

export function LightConeEditor({
  lightConeIdToEdit = 'new',
}: LightConeEditorProps) {
  const { t } = useTranslation('lightCone')
  const { database } = useDatabaseContext()
  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()

  useEffect(
    () => database.lightCones.followAny(setDirtyDatabase),
    [database, setDirtyDatabase]
  )

  useEffect(() => {
    if (lightConeIdToEdit === 'new') {
      dispatchLightCone({ type: 'reset' })
    }
    const dbLightCone =
      lightConeIdToEdit &&
      dirtyDatabase &&
      database.lightCones.get(lightConeIdToEdit)
    if (dbLightCone) {
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

        // for some reason, location property not being added (undefined) if no character location is set, so force init
        newValue.location = newValue.location ?? ''
      }
      if (newValue.level) {
        newValue.level = clamp(newValue.level, 0, lightConeMaxLevel)
      }

      dispatchLightCone({ type: 'update', lightCone: newValue })
    },
    [lightCone, sheet, dispatchLightCone]
  )

  const reset = useCallback(() => {
    dispatchLightCone({ type: 'reset' })
  }, [])

  useEffect(() => {
    if (lightConeIdToEdit === 'new') {
      dispatchLightCone({ type: 'reset' })
    }
  }, [lightConeIdToEdit])

  return (
    <Container>
      <CardThemed bgt="dark">
        <CardHeader title="Light Cone Editor" />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Grid container spacing={1} columns={{ xs: 1, md: 2 }}>
            {/* name */}
            <Grid item xs={1} md={true} display="flex">
              <Select
                value={lightCone?.key || ''}
                sx={{ flexGrow: 1 }}
                onChange={(e) =>
                  update({ key: e.target.value as LightConeKey })
                }
              >
                {allLightConeKeys.map((lc) => (
                  <MenuItem key={lc} value={lc}>
                    {lc}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* superimpose */}
            <Grid item xs={true} md="auto" display="flex">
              <DropdownButton
                title={
                  lightCone?.superimpose
                    ? `Superimposition ${lightCone?.superimpose}`
                    : 'Superimposition 1'
                }
                color="primary"
                fullWidth={true}
              >
                {allSuperimposeKeys.map((sk) => (
                  <MenuItem
                    key={sk}
                    selected={lightCone?.superimpose === sk}
                    disabled={lightCone?.superimpose === sk}
                    onClick={() => {
                      update({ superimpose: sk })
                    }}
                  >
                    Superimposition {sk}
                  </MenuItem>
                ))}
              </DropdownButton>
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
              <DropdownButton
                title={
                  lightCone?.level && lightCone?.ascension
                    ? `Lv. ${lightCone?.level}/${
                        ascensionMaxLevel[lightCone?.ascension]
                      }`
                    : 'Select Level'
                }
                color="primary"
                fullWidth={true}
              >
                {milestoneLevels.map(([lv, as]) => (
                  <MenuItem
                    key={`${lv}/${as}`}
                    selected={
                      lightCone?.level === lv && lightCone?.ascension === as
                    }
                    disabled={
                      lightCone?.level === lv && lightCone?.ascension === as
                    }
                    onClick={() => {
                      update({ level: lv, ascension: as })
                    }}
                  >
                    {lv === ascensionMaxLevel[as]
                      ? `Lv. ${lv}`
                      : `Lv. ${lv}/${ascensionMaxLevel[as]}`}
                  </MenuItem>
                ))}
              </DropdownButton>
            </Grid>

            {/* ascension */}
            <Grid item xs={1} display="flex" gap={1}>
              <TextField
                type="number"
                label="Ascension"
                variant="outlined"
                sx={{ flexShrink: 1, flexGrow: 1 }}
                size="medium"
                inputProps={{ readOnly: true }}
                value={lightCone?.ascension || 0}
                disabled={!sheet}
              />
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
          <Grid>
            <Button
              startIcon={<Add />}
              onClick={() => {
                database.lightCones.new(lightCone!)
                reset()
              }}
              disabled={!lightCone}
              color="primary"
            >
              {t`editor.btnAdd`}
            </Button>
          </Grid>
        </CardContent>
      </CardThemed>
    </Container>
  )
}
