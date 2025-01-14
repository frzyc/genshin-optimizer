import { CardThemed } from '@genshin-optimizer/common/ui'
import { getUnitStr, notEmpty, toPercent } from '@genshin-optimizer/common/util'
import { useDatabaseContext, useDisc } from '@genshin-optimizer/zzz/db-ui'
import type { BaseStats, BuildResult } from '@genshin-optimizer/zzz/solver'
import { convertDiscToStats, getSum } from '@genshin-optimizer/zzz/solver'
import { DiscCard } from '@genshin-optimizer/zzz/ui'
import { Box, CardContent, Typography } from '@mui/material'
import { useMemo } from 'react'

export function BuildsDisplay({
  builds,
  baseStats,
}: {
  builds: BuildResult[]
  baseStats: BaseStats
}) {
  return builds.map((b, i) => <Build build={b} baseStats={baseStats} key={i} />)
}

function Build({
  build,
  baseStats,
}: {
  build: BuildResult
  baseStats: BaseStats
}) {
  const { database } = useDatabaseContext()
  const sum = useMemo(() => {
    const sum = getSum(
      baseStats,
      Object.values(build.discIds)
        .map((d) => database.discs.get(d))
        .filter(notEmpty)
        .map(convertDiscToStats)
    )
    return sum
  }, [baseStats, build.discIds, database.discs])
  return (
    <CardThemed>
      <CardContent>
        {Object.entries(sum).map(([k, v]) => (
          <Typography>
            {k}: {toPercent(v, k)}
            {getUnitStr(k)}
          </Typography>
        ))}
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
  const disc = useDisc(discId)
  if (!disc) return
  return <DiscCard disc={disc} />
}
