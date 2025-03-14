import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import {
  CardThemed,
  ConditionalWrapper,
  NextImage,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { getUnitStr, toPercent } from '@genshin-optimizer/common/util'
import {
  characterAsset,
  characterKeyToGenderedKey,
  relicAsset,
} from '@genshin-optimizer/sr/assets'
import type {
  RelicSetKey,
  RelicSlotKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import type {
  IBuildTc,
  ICachedRelic,
  ICachedSubstat,
} from '@genshin-optimizer/sr/db'
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
import { COMPACT_ELE_HEIGHT, COMPACT_ELE_WIDTH } from '../compactConst'
import { RelicSetName } from './RelicTrans'

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
      <CardActionArea onClick={onClick} sx={{ height: '100%', width: '100%' }}>
        {children}
      </CardActionArea>
    ),
    [onClick],
  )

  const { slotKey, rarity, level, mainStatKey, substats, location, setKey } =
    relic

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
                        'icon',
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
        </Box>
      </ConditionalWrapper>
    </CardThemed>
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
          statToFixed(statKey),
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
        height: COMPACT_ELE_HEIGHT,
        width: COMPACT_ELE_WIDTH,
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

export function RelicSubCard({
  relic,
  keys,
  bgt,
  onClick,
}: {
  relic: IBuildTc['relic']
  keys: RelicSubStatKey[]
  bgt?: CardBackgroundColor
  onClick?: () => void
}) {
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea onClick={onClick} sx={{ height: '100%', width: '100%' }}>
        {children}
      </CardActionArea>
    ),
    [onClick],
  )
  return (
    <CardThemed
      bgt={bgt}
      sx={{
        height: COMPACT_ELE_HEIGHT,
        width: COMPACT_ELE_HEIGHT,
      }}
    >
      <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            p: 1,
          }}
        >
          {keys.map((key) => (
            <Typography
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                whiteSpace: 'nowrap',
              }}
            >
              <StatIcon statKey={key} />
              <span>
                {(relic.substats.stats[key] ?? 0).toFixed(statToFixed(key))}
                {getUnitStr(key)}
              </span>
            </Typography>
          ))}
        </Box>
      </ConditionalWrapper>
    </CardThemed>
  )
}
export function RelicSetCardCompact({
  sets,
  bgt,
  onClick,
}: {
  sets: Partial<Record<RelicSetKey, 2 | 4>>
  bgt?: CardBackgroundColor
  onClick?: () => void
}) {
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea onClick={onClick} sx={{ height: '100%', width: '100%' }}>
        {children}
      </CardActionArea>
    ),
    [onClick],
  )
  return (
    <CardThemed
      bgt={bgt}
      sx={{
        width: COMPACT_ELE_WIDTH,
        height: COMPACT_ELE_HEIGHT,
      }}
    >
      <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
        <Box
          sx={{
            height: '100%',
            width: '100%',
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* TODO: translate */}
          {!Object.keys(sets).length && <Typography>No Relic sets</Typography>}
          {Object.entries(sets).map(([key, count]) => (
            <Typography key={key}>
              <SqBadge>{count}</SqBadge> <RelicSetName setKey={key} />
            </Typography>
          ))}
        </Box>
      </ConditionalWrapper>
    </CardThemed>
  )
}

export function RelicMainsCardCompact({
  slots,
  bgt,
  onClick,
}: {
  slots: IBuildTc['relic']['slots']
  bgt?: CardBackgroundColor
  onClick?: () => void
}) {
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea onClick={onClick} sx={{ height: '100%', width: '100%' }}>
        {children}
      </CardActionArea>
    ),
    [onClick],
  )
  return (
    <CardThemed
      bgt={bgt}
      sx={{
        width: COMPACT_ELE_WIDTH,
        height: COMPACT_ELE_HEIGHT,
      }}
    >
      <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
        <Box
          sx={{
            height: '100%',
            width: '100%',
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(slots).map(([slotKey, { level, statKey }]) => (
            <Typography key={slotKey}>
              <SlotIcon slotKey={slotKey} iconProps={iconInlineProps} />{' '}
              <StatIcon statKey={statKey} iconProps={iconInlineProps} />+{level}
            </Typography>
          ))}
        </Box>
      </ConditionalWrapper>
    </CardThemed>
  )
}
