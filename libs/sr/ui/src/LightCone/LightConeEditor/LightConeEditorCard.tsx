import { CardThemed, DropdownButton } from '@genshin-optimizer/common/ui'
import type {
  AscensionKey,
  LightConeKey,
  SuperimposeKey,
} from '@genshin-optimizer/sr/consts'
import { allSuperimposeKeys } from '@genshin-optimizer/sr/consts'
import type { ILightCone } from '@genshin-optimizer/sr/srod'
import { ascensionMaxLevel, milestoneLevels } from '@genshin-optimizer/sr/util'
import CloseIcon from '@mui/icons-material/Close'
import {
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  MenuItem,
  Skeleton,
  Typography,
} from '@mui/material'
import type { MouseEvent, ReactNode } from 'react'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { LocationAutocomplete } from '../../Character'
import LightConeAutocomplete from '../LightConeAutocomplete'

export function LightConeEditorCard({
  onClose,
  lightCone,
  setLightCone,
  footer,
  hideLocation = false,
}: {
  onClose: (e: MouseEvent) => void
  lightCone: Partial<ILightCone>
  setLightCone: (lightConeData: Partial<ILightCone>) => void
  footer?: ReactNode
  hideLocation?: boolean
}) {
  const { t } = useTranslation(['lightCone', 'common'])

  return (
    <CardThemed bgt="dark">
      <CardHeader
        title="Light Cone Editor"
        action={
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Grid container spacing={1} columns={{ xs: 1, md: 2 }}>
          {/* name */}
          <Grid item xs={1} md={true} display="flex" flexDirection="column">
            <LightConeAutocomplete
              lcKey={lightCone?.key ?? ''}
              setLCKey={(lcKey) => setLightCone({ key: lcKey as LightConeKey })}
              label={lightCone?.key ? '' : t('editor.unknownLightCone')}
            />
          </Grid>

          {/* superimpose */}
          <Grid item xs={true} md="auto" display="flex">
            <SuperimpositionDropdown
              superimpose={lightCone?.superimpose ?? 1}
              setSuperimposition={(sk: SuperimposeKey) =>
                setLightCone({ superimpose: sk })
              }
              disabled={!lightCone?.key}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} columns={{ xs: 1, md: 4 }} marginBottom={1}>
          {/* level */}
          <Grid item xs={1} display="flex" flexDirection="row" gap={1}>
            <LevelDropdown
              level={lightCone?.level}
              ascension={lightCone?.ascension}
              setLevelAscension={(lv, as) => {
                setLightCone({ level: lv, ascension: as })
              }}
              disabled={!lightCone?.key}
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
          {!hideLocation && (
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
                setLocKey={(charKey) => setLightCone({ location: charKey })}
              />
            </Grid>
          )}
        </Grid>
        {footer}
      </CardContent>
    </CardThemed>
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
  const { t } = useTranslation('lightCone_gen')
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
  const { t } = useTranslation(['common_gen', 'common'])

  return (
    <DropdownButton
      title={
        level
          ? `${t('lv')} ${level}/${ascensionMaxLevel[ascension!]}`
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
            ? `${t('lv')} ${lv}`
            : `${t('lv')} ${lv}/${ascensionMaxLevel[as]}`}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
