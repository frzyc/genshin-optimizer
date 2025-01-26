import { CardThemed, NumberInputLazy } from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type { StatKey } from '@genshin-optimizer/zzz/consts'
import {
  allAttributeDamageKeys,
  statKeyTextMap,
  unCondKeys,
} from '@genshin-optimizer/zzz/consts'
import type { BaseStats } from '@genshin-optimizer/zzz/solver'
import { Box, CardContent, Typography } from '@mui/material'
const baseKeys = ['charLvl', 'hp_base', 'atk_base', 'def_base'] as const
const statKeys: StatKey[] = [
  'hp',
  'atk',
  'def',
  'hp_',
  'atk_',
  'def_',
  'crit_',
  'crit_dmg_',
  ...allAttributeDamageKeys,
  'dmg_',
  'impact',
  'anomMas',
  'anomProf',
  'pen_',
  'pen',
] as const
const enemyKeys: StatKey[] = [
  'enemyDef',
  'enemyRes_',
  'enemyResRed_',
  'enemyResIgn_',
] as const
export default function BaseStatCard({
  baseStats,
  setBaseStats,
}: {
  baseStats: BaseStats
  setBaseStats: (baseStats: BaseStats) => void
}) {
  const input = (key: string) => (
    <NumberInputLazy
      key={key}
      sx={{ flexGrow: 1 }}
      value={baseStats[key] || 0}
      onChange={(v) =>
        setBaseStats({
          ...baseStats,
          [key]: v,
        })
      }
      float={getUnitStr(key) === '%'}
      inputProps={{ sx: { textAlign: 'right', minWidth: '5em' } }}
      InputProps={{
        startAdornment: statKeyTextMap[key] ?? key,
        endAdornment: getUnitStr(key),
      }}
    />
  )
  return (
    <CardThemed>
      <CardContent>
        <Typography>Character Base Stats</Typography>
        <Box sx={{ display: 'flex', gap: 1, pb: 2, flexWrap: 'wrap' }}>
          {baseKeys.map((key) => input(key))}
        </Box>
        <Typography>Character Stats</Typography>
        <Box sx={{ display: 'flex', gap: 1, pb: 2, flexWrap: 'wrap' }}>
          {statKeys.map((key) => input(key))}
        </Box>
        <Typography>Enemy Stats</Typography>
        <Box sx={{ display: 'flex', gap: 1, pb: 2, flexWrap: 'wrap' }}>
          {enemyKeys.map((key) => input(key))}
        </Box>
        <Typography>Combat Buffs(Conditonal)</Typography>
        <Box sx={{ display: 'flex', gap: 1, pb: 2, flexWrap: 'wrap' }}>
          {unCondKeys.map((key) => input(key))}
        </Box>
      </CardContent>
    </CardThemed>
  )
}
