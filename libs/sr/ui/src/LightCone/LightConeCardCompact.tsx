import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import {
  CardThemed,
  ConditionalWrapper,
  NextImage,
} from '@genshin-optimizer/common/ui'
import {
  characterAsset,
  characterKeyToGenderedKey,
  lightConeAsset,
} from '@genshin-optimizer/sr/assets'
import type { ICachedLightCone } from '@genshin-optimizer/sr/db'
import { useLightCone } from '@genshin-optimizer/sr/db-ui'
import type { Calculator } from '@genshin-optimizer/sr/formula'
import {
  lightConeData,
  own,
  srCalculatorWithEntries,
} from '@genshin-optimizer/sr/formula'
import { getLightConeStat } from '@genshin-optimizer/sr/stats'
import { LightConeIcon, StatIcon } from '@genshin-optimizer/sr/svgicons'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import { Box, CardActionArea, Chip, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { COMPACT_ELE_HEIGHT, COMPACT_ELE_WIDTH } from '../compactConst'

export function LightConeCardCompact({
  lightConeId,
  bgt,
  onClick,
}: {
  lightConeId?: string
  bgt?: CardBackgroundColor
  onClick?: () => void
}) {
  const lightCone = useLightCone(lightConeId)
  if (!lightCone) return <LightConeCardCompactEmpty bgt={bgt} />
  return (
    <LightConeCardCompactObj
      bgt={bgt}
      lightCone={lightCone}
      onClick={onClick}
    />
  )
}
export function LightConeCardCompactObj({
  lightCone,
  showLocation = false,
  bgt,
  onClick,
}: {
  lightCone: ICachedLightCone
  onClick?: () => void
  bgt?: CardBackgroundColor
  showLocation?: boolean
}) {
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        {children}
      </CardActionArea>
    ),
    [onClick]
  )

  const { key, level, location } = lightCone
  const calc = useMemo(
    () => srCalculatorWithEntries(lightConeData(lightCone)),
    [lightCone]
  )
  const { rarity } = getLightConeStat(key)
  return (
    <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
      <CardThemed
        bgt={bgt}
        sx={(theme) => ({
          display: 'flex',
          maxHeight: COMPACT_ELE_HEIGHT,
          maxWidth: COMPACT_ELE_WIDTH,
          borderLeft: '5px solid',
          borderImage: `${theme.palette[`grad${rarity}`].gradient} 1`,
        })}
      >
        <Box
          sx={{
            position: 'relative',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            component={NextImage ? NextImage : 'img'}
            src={lightConeAsset(key, 'cover')}
            sx={{ m: -1, maxHeight: '100%', maxWidth: '100%' }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              p: 0.5,
              opacity: 0.85,
              display: 'flex',
              justifyContent: 'space-between',
              pointerEvents: 'none',
            }}
          >
            <Chip
              size="small"
              label={<strong>{` +${level}`}</strong>}
              sx={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            />
            {showLocation && (
              <Box
                sx={{
                  position: 'absolute',
                  display: 'flex',
                  top: 0,
                  right: 0,
                }}
              >
                {location ? (
                  <Box
                    component={NextImage ? NextImage : 'img'}
                    sx={{
                      borderRadius: '50%',
                      width: '2em',
                      height: '2em',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                    }}
                    src={characterAsset(
                      characterKeyToGenderedKey(location),
                      'icon'
                    )}
                  />
                ) : (
                  <BusinessCenterIcon />
                )}
              </Box>
            )}
          </Box>
        </Box>
        {/* substats */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          sx={{ py: '3px', pr: '3px' }}
        >
          {(['hp', 'atk', 'def'] as const).map((stat) => (
            <SubstatDisplay key={stat} calc={calc} stat={stat} />
          ))}
        </Box>
      </CardThemed>
    </ConditionalWrapper>
  )
}
function SubstatDisplay({
  calc,
  stat,
}: {
  calc: Calculator
  stat: 'hp' | 'atk' | 'def'
}) {
  // const numRolls = stat.rolls?.length ?? 0
  // const rollColor = `roll${clamp(numRolls, 1, 6)}`
  return (
    <Box display="flex" gap={1} alignContent="center">
      <Typography
        sx={{ flexGrow: 1, display: 'flex', gap: 0.5, alignItems: 'center' }}
        // color={(numRolls ? `${rollColor}.main` : 'error.main') as any}
        component="span"
      >
        <Box lineHeight={0}>
          <StatIcon statKey={stat} iconProps={{ fontSize: 'inherit' }} />
        </Box>
        <span>
          {calc
            .compute(own.base[stat].with('sheet', 'lightCone'))
            .val.toFixed()}
        </span>
      </Typography>
    </Box>
  )
}
export function LightConeCardCompactEmpty({
  bgt,
}: {
  bgt?: CardBackgroundColor
}) {
  return (
    <CardThemed
      bgt={bgt}
      sx={{
        display: 'flex',
        height: COMPACT_ELE_HEIGHT,
        width: COMPACT_ELE_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LightConeIcon sx={{ height: '2em', width: 'auto', opacity: 0.7 }} />
    </CardThemed>
  )
}
