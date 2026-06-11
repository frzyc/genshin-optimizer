import {
  BootstrapTooltip,
  CardThemed,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { lightConeAsset } from '@genshin-optimizer/sr/assets'
import {
  type LocationKey,
  ascensionMaxLevel,
} from '@genshin-optimizer/sr/consts'
import type { Calculator } from '@genshin-optimizer/sr/formula'
import {
  lightConeTagMapNodeEntries,
  own,
  srCalculatorWithEntries,
} from '@genshin-optimizer/sr/formula'
import type { ILightCone } from '@genshin-optimizer/sr/srod'
import { getLightConeStat } from '@genshin-optimizer/sr/stats'
import { PathIcon } from '@genshin-optimizer/sr/svgicons'
import { DeleteForever, Edit, Lock, LockOpen } from '@mui/icons-material'
import {
  Box,
  Button,
  CardContent,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LocationAutocomplete, StatDisplay } from '../Character'
import { LocationName } from '../Components'
import { LightConeName } from './LightConeTrans'

export type LightConeCardProps = {
  lightCone: ILightCone
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onLockToggle?: () => void
  canEquip?: boolean
  setLocation?: (lk: LocationKey) => void
  extraButtons?: JSX.Element
}

export function LightConeCard({
  lightCone,
  onClick,
  onEdit,
  onDelete,
  onLockToggle,
  canEquip = false,
  setLocation,
  extraButtons,
}: LightConeCardProps) {
  const { t } = useTranslation(['lightCone', 'lightCones_gen', 'common_gen'])

  const { key, level, ascension, superimpose, location = '', lock } = lightCone
  const calc = useMemo(
    () =>
      srCalculatorWithEntries(
        lightConeTagMapNodeEntries(key, level, ascension, superimpose)
      ),
    [ascension, key, level, superimpose]
  )
  const lcStat = getLightConeStat(key)

  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          sx={{ width: '100%', height: '100%', minHeight: 350 }}
        />
      }
    >
      <CardThemed
        bgt="light"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Box
          className={`grad-${lcStat.rarity}star`}
          sx={{ position: 'relative', width: '100%' }}
        >
          {!onClick && !!onLockToggle && (
            <IconButton
              color="primary"
              onClick={onLockToggle}
              sx={{ position: 'absolute', right: 0, bottom: 0, zIndex: 2 }}
            >
              {lock ? <Lock /> : <LockOpen />}
            </IconButton>
          )}
          <Box sx={{ pt: 2, px: 2, position: 'relative', zIndex: 1 }}>
            <Box
              component="div"
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
            >
              <PathIcon
                iconProps={{ fontSize: 'inherit' }}
                pathKey={lcStat.path}
              />
              <Typography
                noWrap
                sx={{
                  textAlign: 'center',
                  backgroundColor: 'rgba(100,100,100,0.35)',
                  borderRadius: '1em',
                  px: 1,
                }}
              >
                <strong>
                  <LightConeName lcKey={key} />
                </strong>
              </Typography>
            </Box>
            <Typography component="span" variant="h5">
              {t('common_gen:lv')} {level}
            </Typography>
            <Typography component="span" variant="h5" color="text.secondary">
              /{ascensionMaxLevel[ascension]}
            </Typography>
            <Typography variant="h6">
              {t('lightCones_gen:superimpose')} {superimpose}
            </Typography>
            <StarsDisplay stars={lcStat.rarity} colored />
          </Box>
          <Box sx={{ height: '100%', position: 'absolute', right: 0, top: 0 }}>
            <Box
              component="img"
              alt="Light Cone Image"
              src={lightConeAsset(key, 'icon')}
              sx={{
                width: 'auto',
                height: '90%',
                float: 'right',
                marginBottom: '5%',
                marginTop: '5%',
                marginRight: '5%',
              }}
            />
          </Box>
        </Box>
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            pt: 1,
            pb: '0!important',
            width: '100%',
          }}
        >
          {(['hp', 'atk', 'def'] as const).map((stat) => (
            <StatRow key={stat} calc={calc} stat={stat} />
          ))}
        </CardContent>
        <Box
          sx={{
            p: 1,
            display: 'flex',
            gap: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {canEquip && setLocation ? (
              <LocationAutocomplete
                locKey={location}
                setLocKey={setLocation}
                getOptionDisabled={(character) => !character.key}
                disableClearable
              />
            ) : (
              <LocationName location={location} />
            )}
          </Box>
          <Box
            display="flex"
            gap={1}
            alignItems="stretch"
            height="100%"
            sx={{ '& .MuiButton-root': { minWidth: 0, height: '100%' } }}
          >
            {!!onEdit && (
              <BootstrapTooltip
                title={<Typography>{t('edit')}</Typography>}
                placement="top"
                arrow
              >
                <Button color="info" size="small" onClick={onEdit}>
                  <Edit />
                </Button>
              </BootstrapTooltip>
            )}
            {!!onDelete && (
              <BootstrapTooltip
                title={lock ? t('cantDeleteLock') : ''}
                placement="top"
              >
                <span>
                  <Button
                    color="error"
                    size="small"
                    onClick={onDelete}
                    disabled={!!location || lock}
                    sx={{ top: '1px' }}
                  >
                    <DeleteForever />
                  </Button>
                </span>
              </BootstrapTooltip>
            )}
            {extraButtons}
          </Box>
        </Box>
      </CardThemed>
    </Suspense>
  )
}
function StatRow({
  calc,
  stat,
}: {
  calc: Calculator
  stat: 'hp' | 'atk' | 'def'
}) {
  return (
    <Typography
      key={stat}
      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
    >
      <StatDisplay statKey={stat} />
      <span>
        {calc.compute(own.base[stat].with('sheet', 'lightCone')).val.toFixed()}
      </span>
    </Typography>
  )
}
