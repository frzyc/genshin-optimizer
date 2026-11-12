import {
  BootstrapTooltip,
  ImgIcon,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { artifactDefIcon, weaponAsset } from '@genshin-optimizer/gi/assets'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  ElementWithPhyKey,
} from '@genshin-optimizer/gi/consts'
import { useArtifacts, useWeapon } from '@genshin-optimizer/gi/db-ui'
import { elementalData, KeyMap } from '@genshin-optimizer/gi/keymap'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import {
  ArtifactSetName,
  StatWithUnit,
  WeaponName,
} from '@genshin-optimizer/gi/ui'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'

const DEFAULT_ICON_PX = 24
const MAIN_SLOTS = ['sands', 'goblet', 'circlet'] as const

export function CompactBuildEquipGrid({
  weaponId,
  artIds,
  iconPx = DEFAULT_ICON_PX,
}: {
  weaponId: string | undefined
  artIds: Partial<Record<ArtifactSlotKey, string | undefined>>
  /** Pixel size of the weapon and set icons. Artifact art is scaled up inside the slot. */
  iconPx?: number
}) {
  const artifacts = useArtifacts({
    flower: artIds.flower,
    plume: artIds.plume,
    sands: artIds.sands,
    goblet: artIds.goblet,
    circlet: artIds.circlet,
  })
  const weapon = useWeapon(weaponId || undefined)
  const setCounts = useMemo(() => {
    const counts = new Map<ArtifactSetKey, number>()
    for (const art of Object.values(artifacts)) {
      const setKey = art?.setKey
      if (!setKey) continue
      counts.set(setKey, (counts.get(setKey) ?? 0) + 1)
    }
    return [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    )
  }, [artifacts])

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.75,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        alignItems: 'center',
      }}
    >
      {weapon ? (
        <BootstrapTooltip title={<WeaponName weaponKey={weapon.key} />}>
          <Box sx={{ fontSize: iconPx, lineHeight: 0, flexShrink: 0 }}>
            <ImgIcon
              size={1}
              src={weaponAsset(weapon.key, weapon.ascension >= 2)}
            />
          </Box>
        </BootstrapTooltip>
      ) : (
        <EmptySlot iconPx={iconPx} />
      )}
      {setCounts.map(([setKey, count]) => (
        <BootstrapTooltip
          key={setKey}
          title={<ArtifactSetName setKey={setKey} />}
        >
          <Box
            sx={{
              position: 'relative',
              width: iconPx,
              height: iconPx,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                alt=""
                src={artifactDefIcon(setKey)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transform: 'scale(1.45)',
                  display: 'block',
                }}
              />
            </Box>
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
        const statKey = artifacts[slot]?.mainStatKey
        return (
          <BootstrapTooltip
            key={slot}
            title={
              statKey ? <StatWithUnit statKey={statKey} /> : <span>{slot}</span>
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
                    {mainStatLabel(statKey)}
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

function mainStatLabel(statKey: string): string {
  const elemental = statKey.match(/^(.*)_dmg_$/)?.[1]
  if (elemental && elemental in elementalData) {
    return `${elementalData[elemental as ElementWithPhyKey].name}%`
  }
  const name = KeyMap.get(statKey)
  if (statKey.endsWith('_') && !name.includes(' ')) return `${name}%`
  return name
}

function EmptySlot({ iconPx }: { iconPx: number }) {
  return (
    <Box
      sx={{
        width: iconPx,
        height: iconPx,
        borderRadius: '50%',
        border: 1,
        borderStyle: 'dashed',
        borderColor: 'divider',
        flexShrink: 0,
      }}
    />
  )
}
