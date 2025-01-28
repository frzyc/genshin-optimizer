import { CardThemed, NumberInputLazy } from '@genshin-optimizer/common/ui'
import { getUnitStr, isPercentStat } from '@genshin-optimizer/common/util'
import type { LocationKey, StatKey } from '@genshin-optimizer/zzz/consts'
import {
  allAttributeDamageKeys,
  statKeyTextMap,
  unCondKeys,
} from '@genshin-optimizer/zzz/consts'
import type { Stats } from '@genshin-optimizer/zzz/db'
import { Box, CardContent, Typography } from '@mui/material'
const baseKeys = ['hp_base', 'atk_base', 'def_base'] as const
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
  'enemyDefRed_',
  'enemyRes_',
  'enemyResRed_',
  'enemyResIgn_',
] as const
export default function BaseStatCard({
  locationKey,
  baseStats,
  setBaseStats,
}: {
  locationKey: LocationKey
  baseStats: Stats
  setBaseStats: (baseStats: Stats) => void
}) {
  const input = (key: string) => (
    <NumberInputLazy
      disabled={!locationKey}
      key={key}
      sx={{ flexGrow: 1 }}
      value={baseStats[key] || 0}
      onChange={(v) =>
        setBaseStats({
          ...baseStats,
          [key]: v,
        })
      }
      float={isPercentStat(key)}
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
        <Typography>BONUS Character Base Stats</Typography>
        <Box sx={{ display: 'flex', gap: 1, pb: 2, flexWrap: 'wrap' }}>
          {baseKeys.map((key) => input(key))}
        </Box>
        <Typography>BONUS Character Stats</Typography>
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
