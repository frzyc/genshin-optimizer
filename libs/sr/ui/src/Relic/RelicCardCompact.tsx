import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import {
  CardThemed,
  ConditionalWrapper,
  NextImage,
} from '@genshin-optimizer/common/ui'
import { getUnitStr, toPercent } from '@genshin-optimizer/common/util'
import {
  characterAsset,
  characterKeyToGenderedKey,
  relicAsset,
} from '@genshin-optimizer/sr/assets'
import type { RelicSlotKey } from '@genshin-optimizer/sr/consts'
import type { ICachedRelic, ICachedSubstat } from '@genshin-optimizer/sr/db'
import { useRelic } from '@genshin-optimizer/sr/db-ui'
import { SlotIcon, StatIcon } from '@genshin-optimizer/sr/svgicons'
import {
  getRelicMainStatDisplayVal,
  statToFixed,
} from '@genshin-optimizer/sr/util'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import { Box, CardActionArea, Chip, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useCallback } from 'react'

const ELE_HEIGHT = '7em' as const
const ELE_WIDTH = '12em' as const

export function RelicCardCompact({
  relicId,
  slotKey,
  bgt,
  onClick,
  showLocation = false,
}: {
  relicId?: string
  slotKey: RelicSlotKey
  bgt?: CardBackgroundColor
  onClick?: () => void
  showLocation?: boolean
}) {
  const relic = useRelic(relicId)
  if (!relic) return <RelicCardCompactEmpty bgt={bgt} slotKey={slotKey} />
  return (
    <RelicCardCompactObj
      bgt={bgt}
      relic={relic}
      onClick={onClick}
      showLocation={showLocation}
    />
  )
}
export function RelicCardCompactObj({
  relic,
  showLocation = false,
  bgt,
  onClick,
}: {
  relic: ICachedRelic
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

  const { slotKey, rarity, level, mainStatKey, substats, location, setKey } =
    relic

  return (
    <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
      <CardThemed
        bgt={bgt}
        sx={(theme) => ({
          display: 'flex',
          height: ELE_HEIGHT,
          width: ELE_WIDTH,
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
            src={relicAsset(setKey, slotKey)}
            sx={{
              m: -1,
              maxHeight: '100%',
              maxWidth: '100%',
              maskImage:
                'linear-gradient( to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0))',
            }}
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
                  top: '3px',
                  right: '3px',
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
          {/* mainstats */}
          <Typography
            sx={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)',
              bottom: '3px',
              px: 0.5,
              borderRadius: '1em',
              backdropFilter: 'blur(2px)',
            }}
          >
            <StatIcon
              statKey={mainStatKey}
              iconProps={{ style: { padding: '4px' } }}
            />
            <span>
              {getRelicMainStatDisplayVal(rarity, mainStatKey, level)}
              {getUnitStr(mainStatKey)}
            </span>
          </Typography>
        </Box>
        {/* substats */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          sx={{ py: '3px', pr: '3px' }}
        >
          {substats.map((stat: ICachedSubstat, i: number) => (
            <SubstatDisplay key={i + stat.key} stat={stat} />
          ))}
        </Box>
      </CardThemed>
    </ConditionalWrapper>
  )
}
function SubstatDisplay({ stat }: { stat: ICachedSubstat }) {
  const { value, key: statKey } = stat
  if (!value || !statKey) return null

  // const numRolls = stat.rolls?.length ?? 0
  // const rollColor = `roll${clamp(numRolls, 1, 6)}`
  const statUnit = getUnitStr(stat.key)
  return (
    <Box display="flex" gap={1} alignContent="center">
      <Typography
        sx={{ flexGrow: 1, display: 'flex', gap: 0.5, alignItems: 'center' }}
        // color={(numRolls ? `${rollColor}.main` : 'error.main') as any}
        component="span"
      >
        <Box lineHeight={0}>
          <StatIcon statKey={statKey} iconProps={{ fontSize: 'inherit' }} />
        </Box>
        <span>{`${toPercent(value, statKey).toFixed(
          statToFixed(statKey)
        )}${statUnit}`}</span>
      </Typography>
    </Box>
  )
}
export function RelicCardCompactEmpty({
  slotKey,
  bgt,
}: {
  slotKey: RelicSlotKey
  bgt?: CardBackgroundColor
}) {
  return (
    <CardThemed
      bgt={bgt}
      sx={{
        display: 'flex',
        height: ELE_HEIGHT,
        width: ELE_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SlotIcon
        slotKey={slotKey}
        iconProps={{ sx: { height: '2em', width: 'auto', opacity: 0.7 } }}
      />
    </CardThemed>
  )
}
