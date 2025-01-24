import { CardThemed, SqBadge } from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  notEmpty,
  objMap,
  toDecimal,
  valueString,
} from '@genshin-optimizer/common/util'
import type { LocationKey } from '@genshin-optimizer/zzz/consts'
import { statKeyTextMap } from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext, useDisc } from '@genshin-optimizer/zzz/db-ui'
import type { BaseStats, BuildResult } from '@genshin-optimizer/zzz/solver'
import { convertDiscToStats, getSum } from '@genshin-optimizer/zzz/solver'
import { DiscCard } from '@genshin-optimizer/zzz/ui'
import { Box, Button, CardContent, Stack, Typography } from '@mui/material'
import { useCallback, useMemo } from 'react'

export function BuildsDisplay({
  location,
  builds,
  baseStats,
}: {
  location: LocationKey
  builds: BuildResult[]
  baseStats: BaseStats
}) {
  return (
    <Stack spacing={1}>
      {builds.map((b, i) => (
        <Build
          locationKey={location}
          index={i}
          build={b}
          baseStats={baseStats}
          key={`${i}_${b.value}`}
        />
      ))}
    </Stack>
  )
}

function Build({
  locationKey,
  index,
  build,
  baseStats,
}: {
  locationKey: LocationKey
  index: number
  build: BuildResult
  baseStats: BaseStats
}) {
  const { database } = useDatabaseContext()
  const sum = useMemo(() => {
    const sum = getSum(
      objMap(baseStats, (v, k) => toDecimal(v, k)),
      Object.values(build.discIds)
        .map((d) => database.discs.get(d))
        .filter(notEmpty)
        .map(convertDiscToStats)
    )
    return sum
  }, [baseStats, build.discIds, database.discs])
  const onEquip = useCallback(() => {
    Object.values(build.discIds).forEach((dId) => {
      database.discs.set(dId, { location: locationKey })
    })
  }, [database.discs, locationKey, build.discIds])
  return (
    <CardThemed>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography>
            <SqBadge>{index + 1}</SqBadge>
          </Typography>
          <Typography sx={{ flexGrow: 1 }}>
            Calculated Value: <strong>{valueString(build.value)}</strong>
          </Typography>

          <Button size="small" disabled={!locationKey} onClick={onEquip}>
            Equip to {locationKey}
          </Button>
        </Box>
        <Box sx={{ columnCount: 2 }}>
          {Object.entries(sum)
            .filter(([k]) => !k.endsWith('_base'))
            .map(([k, v]) => (
              <Typography key={k}>
                {statKeyTextMap[k] ?? k}: {valueString(v, getUnitStr(k))}
              </Typography>
            ))}
        </Box>
        <Box display="flex" gap={1}>
          {Object.values(build.discIds).map((dId) => (
            <DiscCardWrapper discId={dId} key={dId} />
          ))}
        </Box>
      </CardContent>
    </CardThemed>
  )
}
export function DiscCardWrapper({ discId }: { discId: string }) {
  const { database } = useDatabaseContext()
  const disc = useDisc(discId)
  if (!disc) return
  return (
    <DiscCard
      disc={disc}
      setLocation={(location) => database.discs.set(discId, { location })}
    />
  )
}
