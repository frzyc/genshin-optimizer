import type { BaseStats, BuildResult } from '@genshin-optimizer/zzz/solver'
import { Box } from '@mui/material'
import { useState } from 'react'
import BaseStatCard from './BaseStatCard'
import { BuildsDisplay } from './BuildsDisplay'
import OptimizeWrapper from './Optimize'

export default function PageDiscs() {
  const [builds, setBuilds] = useState<BuildResult[]>([])
  // base stats are in percent for displayability
  const [baseStats, setBaseStats] = useState<BaseStats>({
    crit_: 5,
    crit_dmg_: 50,
  })
  return (
    <Box display="flex" flexDirection="column" gap={1} my={1}>
      <BaseStatCard baseStats={baseStats} setBaseStats={setBaseStats} />
      <OptimizeWrapper setResults={setBuilds} baseStats={baseStats} />
      <BuildsDisplay builds={builds} baseStats={baseStats} />
    </Box>
  )
}
