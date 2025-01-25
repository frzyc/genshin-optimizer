import { CardThemed } from '@genshin-optimizer/common/ui'
import type { LocationKey } from '@genshin-optimizer/zzz/consts'
import {
  allFormulaKeys,
  type BaseStats,
  type BuildResult,
  type FormulaKey,
} from '@genshin-optimizer/zzz/solver'
import { LocationAutocomplete } from '@genshin-optimizer/zzz/ui'
import { Box, CardContent, Typography } from '@mui/material'
import { useState } from 'react'
import BaseStatCard from './BaseStatCard'
import { BuildsDisplay } from './BuildsDisplay'
import OptimizeWrapper from './Optimize'
import { OptimizeTargetSelector } from './OptimizeTargetSelector'

export default function PageOptimize() {
  const [builds, setBuilds] = useState<BuildResult[]>([])
  const [locationKey, setLocationKey] = useState<LocationKey>('')
  // base stats are in percent for displayability
  const [baseStats, setBaseStats] = useState<BaseStats>({
    charLvl: 60,
    enemyDef: 953, // default enemy DEF
    crit_: 5,
    crit_dmg_: 50,
  })
  const [formulaKey, setFormulaKey] = useState<FormulaKey>(allFormulaKeys[0])
  return (
    <Box display="flex" flexDirection="column" gap={1} my={1}>
      <CardThemed>
        <CardContent>
          <Typography variant="h6">Character</Typography>
          <LocationAutocomplete
            locKey={locationKey}
            setLocKey={setLocationKey}
            sx={{ mb: 1 }}
          />
          <OptimizeTargetSelector
            formulaKey={formulaKey}
            setFormulaKey={setFormulaKey}
          />
        </CardContent>
      </CardThemed>
      <BaseStatCard baseStats={baseStats} setBaseStats={setBaseStats} />
      <OptimizeWrapper
        setResults={setBuilds}
        baseStats={baseStats}
        location={locationKey}
        formulaKey={formulaKey}
      />
      <BuildsDisplay
        builds={builds}
        baseStats={baseStats}
        location={locationKey}
      />
    </Box>
  )
}
