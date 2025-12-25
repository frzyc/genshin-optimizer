import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import {
  CardThemed,
  ConditionalWrapper,
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
  lightConeTagMapNodeEntries,
  own,
  srCalculatorWithEntries,
} from '@genshin-optimizer/sr/formula'
import { getLightConeStat } from '@genshin-optimizer/sr/stats'
import { LightConeIcon, StatIcon } from '@genshin-optimizer/sr/svgicons'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import {
  Box,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from '@mui/material'
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
      <CardActionArea onClick={onClick} sx={{ height: '100%', width: '100%' }}>
        {children}
      </CardActionArea>
    ),
    [onClick]
  )

  const { key, level, location, ascension, superimpose } = lightCone
  const calc = useMemo(
    () =>
      srCalculatorWithEntries(
        lightConeTagMapNodeEntries(key, level, ascension, superimpose)
      ),
    [ascension, key, level, superimpose]
  )
  const { rarity } = getLightConeStat(key)
  return (
    <CardThemed
      bgt={bgt}
      sx={{
        height: COMPACT_ELE_HEIGHT,
        width: COMPACT_ELE_WIDTH,
      }}
    >
      <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
        <Box
          sx={(theme) => ({
            display: 'flex',
            height: '100%',
            width: '100%',
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
              component="img"
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
                      component="img"
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
            <Chip
              size="small"
              label={<strong>{` +${level}`}</strong>}
              sx={{
                position: 'absolute',
                top: 3,
                left: 3,
                backgroundColor: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(2px)',
              }}
            />
          </Box>
          {/* substats */}
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            sx={{ py: '3px', pr: '3px', minWidth: '5em' }}
          >
            {(['hp', 'atk', 'def'] as const).map((stat) => (
              <SubstatDisplay key={stat} calc={calc} stat={stat} />
            ))}
          </Box>
        </Box>
      </ConditionalWrapper>
    </CardThemed>
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
  onClick,
}: {
  bgt?: CardBackgroundColor
  onClick?: () => void
}) {
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        {children}
      </CardActionArea>
    ),
    [onClick]
  )
  return (
    <CardThemed
      bgt={bgt}
      sx={{
        height: COMPACT_ELE_HEIGHT,
        width: COMPACT_ELE_WIDTH,
      }}
    >
      <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
        <CardContent
          sx={{
            display: 'flex',
            height: COMPACT_ELE_HEIGHT,
            width: COMPACT_ELE_WIDTH,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LightConeIcon sx={{ height: '2em', width: 'auto', opacity: 0.7 }} />
        </CardContent>
      </ConditionalWrapper>
    </CardThemed>
  )
}
