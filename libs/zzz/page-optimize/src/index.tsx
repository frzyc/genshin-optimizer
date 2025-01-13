import { CardThemed } from '@genshin-optimizer/common/ui'
import type { BaseStats, BuildResult } from '@genshin-optimizer/zzz/solver'
import { Box, CardContent } from '@mui/material'
import { useState } from 'react'
import BaseStatCard from './BaseStatCard'
import OptimizeWrapper from './Optimize'

export default function PageDiscs() {
  const [builds, setBuilds] = useState<BuildResult[]>([])
  const [baseStats, setBaseStats] = useState<BaseStats>({})
  return (
    <Box display="flex" flexDirection="column" gap={1} my={1}>
      <BaseStatCard baseStats={baseStats} setBaseStats={setBaseStats} />
      <OptimizeWrapper setResults={setBuilds} baseStats={baseStats} />
      <CardThemed>
        <CardContent>{JSON.stringify(builds)}</CardContent>
      </CardThemed>
    </Box>
  )
}
