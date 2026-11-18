import {
  BootstrapTooltip,
  ImgIcon,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { discDefIcon, wengineAsset } from '@genshin-optimizer/zzz/assets'
import { type DiscSetKey, elementalData } from '@genshin-optimizer/zzz/consts'
import type { DiscIds } from '@genshin-optimizer/zzz/db'
import { useDiscs, useWengine } from '@genshin-optimizer/zzz/db-ui'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { DiscSetName, StatDisplay } from '@genshin-optimizer/zzz/ui'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const ICON_EM = 1.75
const MAIN_SLOTS = ['4', '5', '6'] as const

export function CompactBuildEquipGrid({
  wengineId,
  discIds,
}: {
  wengineId: string | undefined
  discIds: DiscIds | undefined
}) {
  const { t } = useTranslation('sheet')
  const { t: tk } = useTranslation('statKey_gen')
  const discs = useDiscs(discIds)
  const wengine = useWengine(wengineId || undefined)
  const setCounts = useMemo(() => {
    const counts = new Map<DiscSetKey, number>()
    for (const disc of Object.values(discs)) {
      const setKey = disc?.setKey
      if (!setKey) continue
      counts.set(setKey, (counts.get(setKey) ?? 0) + 1)
    }
    return [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    )
  }, [discs])

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.75,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        alignItems: 'center',
      }}
    >
      {wengine ? (
        <ImgIcon size={ICON_EM} src={wengineAsset(wengine.key, 'icon')} />
      ) : (
        <EmptySlot />
      )}
      {setCounts.map(([setKey, count]) => (
        <BootstrapTooltip key={setKey} title={<DiscSetName setKey={setKey} />}>
          <Box
            sx={{
              position: 'relative',
              width: '1.75em',
              height: '1.75em',
              flexShrink: 0,
            }}
          >
            <ImgIcon size={ICON_EM} src={discDefIcon(setKey)} />
            <SqBadge
              color={count >= 4 ? 'success' : 'secondary'}
              sx={{
                position: 'absolute',
                top: -6,
                right: -8,
                minWidth: 16,
                px: '3px',
                py: '2px',
                fontSize: '0.65rem',
                fontWeight: 700,
              }}
            >
              {count}
            </SqBadge>
          </Box>
        </BootstrapTooltip>
      ))}
      <Box
        sx={{
          width: '1px',
          alignSelf: 'stretch',
          bgcolor: 'divider',
          mx: 0.25,
        }}
      />
      {MAIN_SLOTS.map((slot) => {
        const statKey = discs[slot]?.mainStatKey
        return (
          <BootstrapTooltip
            key={slot}
            title={
              statKey ? <StatDisplay statKey={statKey} /> : <span>{slot}</span>
            }
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                flexShrink: 0,
              }}
            >
              {statKey ? (
                <>
                  <StatIcon
                    statKey={statKey}
                    iconProps={{ fontSize: 'small' }}
                  />
                  <Typography variant="caption" noWrap>
                    {mainStatLabel(statKey, tk, t)}
                  </Typography>
                </>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  —
                </Typography>
              )}
            </Box>
          </BootstrapTooltip>
        )
      })}
    </Box>
  )
}

function mainStatLabel(
  statKey: string,
  tk: (key: string) => string,
  t: (key: string) => string
): string {
  const elemental = statKey.match(/^(.*)_dmg_$/)?.[1]
  if (elemental && elemental in elementalData) {
    return `${t(`attributes.${elemental}`)}%`
  }
  const name = tk(statKey)
  if (statKey.endsWith('_') && !name.includes(' ')) return `${name}%`
  return name
}

function EmptySlot() {
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: 1,
        borderStyle: 'dashed',
        borderColor: 'divider',
        flexShrink: 0,
      }}
    />
  )
}
