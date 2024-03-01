import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { CardThemed, DropdownButton } from '@genshin-optimizer/common/ui'
import { clamp, deepClone } from '@genshin-optimizer/common/util'
import type {
  LightConeKey,
  AscensionKey,
  SuperimposeKey,
} from '@genshin-optimizer/sr/consts'
import {
  allLightConeKeys,
  allSuperimposeKeys,
  allAscensionKeys,
  lightConeMaxLevel,
} from '@genshin-optimizer/sr/consts'
import type { ILightCone } from '@genshin-optimizer/sr/srod'
import { Add } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CardContent,
  CardHeader,
  Container,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import { Suspense, useCallback, useEffect, useMemo, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { LocationAutocomplete } from '../../Character'
import { useDatabaseContext } from '../../Context'
import { lightConeReducer } from './reducer'

// TODO: temporary until light cone sheet is implemented
// interface ILightConeSheet {
//   superimpose: readonly SuperimposeKey[]
// }
// const tempLightConeSheet: ILightConeSheet = {
//   superimpose: [5, 4, 3, 2, 1]
// }

// TODO: light cone sheets, errors, autocomplete, display text, i18n, ...
// export type LightConeEditorProps = {
//   lightConeIdToEdit?: string
// }

export function LightConeEditor({ lightConeIdToEdit = 'new' }: LightConeEditorProps) {
  const { t } = useTranslation('lightCone')
  const { database } = useDatabaseContext()
  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()
  useEffect(
    () => database.lightCones.followAny(setDirtyDatabase),
    [database, setDirtyDatabase]
  )

  // useEffect(() => {
  //   if (lightConeIdToEdit === 'new') {
  //     dispatchLightCone({ type: 'reset' })
  //   }
  //   const dbLightCone =
  //     lightConeIdToEdit && dirtyDatabase && database.lightCones.get(lightConeIdToEdit)
  //   if (dbLightCone) {
  //     dispatchLightCone({
  //       type: 'overwrite',
  //       lightCone: deepClone(dbLightCone),
  //     })
  //   }
  // }, [lightConeIdToEdit, database, dirtyDatabase])

  const [lightCone, dispatchLightCone] = useReducer(lightConeReducer, undefined)
  // // const { lightCone: cLightCone, errors } = useMemo(() => {
  // //   if (!lightCone) return { lightCone: undefined, errors: [] }
  // //   const validated = database.lightCones.validate(lightCone, lightConeIdToEdit)
  // //   return validated
  // // }, [lightCone, lightConeIdToEdit])
  // const { level = 1, superimpose = 1 } = lightCone ?? {}
  // const sheet: ILightConeSheet | undefined = lightCone ? tempLightConeSheet : undefined

  // const update = useCallback(
  //   (newValue: Partial<ILightCone>) => {
  //     const newSheet = newValue.key ? tempLightConeSheet : sheet!

  //     function pick<T>(
  //       value: T | undefined,
  //       available: readonly T[],
  //       prefer?: T
  //     ): T {
  //       return value && available.includes(value)
  //         ? value
  //         : prefer ?? available[0]
  //     }

  //     if (newValue.key) {
  //       newValue.superimpose = pick(
  //         lightCone?.superimpose,
  //         newSheet.superimpose,
  //         Math.max(...newSheet.superimpose) as SuperimposeKey
  //       )
  //     }
  //     if (newValue.ascension) newValue.level = lightCone?.level ?? 0
  //     if (newValue.level) {
  //       newValue.level = clamp(
  //         newValue.level,
  //         0,
  //         lightConeMaxLevel
  //       )
  //       newValue.ascension = validateLevelAsc(newValue.level, newValue.ascension)
  //     }
  //     dispatchLightCone({ type: 'update', lightCone: newValue })
  //   },
  //   [lightCone, sheet, dispatchLightCone]
  // )
  // const reset = useCallback(() => {
  //   dispatchLightCone({ type: 'reset' })
  // }, [])

  // // const isValid = !errors.length

  // useEffect(() => {
  //   if (lightConeIdToEdit === 'new') {
  //     dispatchLightCone({ type: 'reset' })
  //   }
  // }, [lightConeIdToEdit])

  return (
    <Container>
      <CardThemed bgt="dark">
        <CardHeader title="Light Cone Editor" />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Grid container spacing={1} columns={{ xs: 1, md: 2 }} marginBottom={1}>
            {/* name */}
            <Grid item xs={1} md={true} display="flex">
              <Select
                value={lightCone?.key || ''}
                sx={{ flexGrow: 1 }}
                // onChange={(e) =>
                //   update({ key: e.target.value as LightConeKey })
                // }
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
                title={<b>{lightCone?.superimpose ? `Superimposition ${lightCone?.superimpose}` : 'Superimposition 0'}</b>}
                color="primary"
                fullWidth={true}
              >
                {allSuperimposeKeys.map((sk) => (
                  <MenuItem
                    key={sk}
                    selected={lightCone?.superimpose === sk}
                    disabled={lightCone?.superimpose === sk}
                    // onClick={() => update({ superimpose: sk })}
                  >
                    Superimposition {sk}
                  </MenuItem>
                ))}
              </DropdownButton>
            </Grid>
          </Grid>
          <Grid container spacing={1} columns={{ xs: 1, md: 4 }}marginBottom={1}>
            {/* level */}
            <Grid item xs={1} display="flex" flexDirection="row" gap={1}>
              <TextField
                type="number"
                label="Level"
                variant="outlined"
                sx={{ flexShrink: 1, flexGrow: 1 }}
                size="medium"
                inputProps={{ min: 1, max: 80 }}
                value={lightCone?.level || 1}
                // disabled={!sheet}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  // update({ level: value })
                  }
                }
              />
            </Grid>

            {/* ascension */}
            <Grid item xs={1} display="flex" gap={1}>
              <TextField
                type="number"
                label="Ascension"
                variant="outlined"
                sx={{ flexShrink: 1, flexGrow: 1 }}
                size="medium"
                inputProps={{ min: 0, max: 6 }}
                value={lightCone?.ascension || 0}
                // disabled={!sheet}
                // onChange={(e) =>
                //   update({ ascension: parseInt(e.target.value) as AscensionKey })
                // }
              />
            </Grid>

            {/* character location */}
            <Grid item xs={2} display="flex" flexDirection="column" gap={1}>
              <LocationAutocomplete
                locKey={lightCone?.location ?? ''}
                setLocKey={(charKey) => charKey}
              />
            </Grid>
          </Grid>

          {/* Error alert */}
          {/* {!isValid && (
            <Alert variant="filled" severity="error">
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </Alert>
          )} */}
          <Grid>
            <Button
              startIcon={<Add />}
              onClick={() => {
                database.lightCones.new(lightCone!)
                // reset()
              }}
              // disabled={!lightCone || !isValid}
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
