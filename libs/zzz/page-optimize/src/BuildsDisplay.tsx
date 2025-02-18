import type { BuildResult } from '@genshin-optimizer/zzz/solver'
import type { Stats } from '@genshin-optimizer/zzz/zood'
import { Stack } from '@mui/material'
import { BuildDisplay } from './BuildDisplay'

export function BuildsDisplay({
  builds,
  stats,
}: {
  builds: BuildResult[]
  stats: Stats
}) {
  return (
    <Stack spacing={1}>
      {builds.map((b, i) => (
        <BuildDisplay
          index={i}
          discIds={b.discIds}
          result={b.value}
          baseStats={stats}
          key={`${i}_${b.value}`}
        />
      ))}
    </Stack>
  )
}
