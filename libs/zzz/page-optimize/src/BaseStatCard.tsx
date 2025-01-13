import { CardThemed, NumberInputLazy } from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type { StatKey } from '@genshin-optimizer/zzz/consts'
import { allAttributeDamageKeys } from '@genshin-optimizer/zzz/consts'
import type { BaseStats } from '@genshin-optimizer/zzz/solver'
import { CardContent, Stack } from '@mui/material'
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
] as const
export default function BaseStatCard({
  baseStats,
  setBaseStats,
}: {
  baseStats: BaseStats
  setBaseStats: (baseStats: BaseStats) => void
}) {
  return (
    <CardThemed>
      <CardContent>
        <Stack spacing={1}>
          {[...baseKeys, ...statKeys].map((key) => (
            <NumberInputLazy
              key={key}
              value={baseStats[key] || 0}
              onChange={(v) =>
                setBaseStats({
                  ...baseStats,
                  [key]: v,
                })
              }
              inputProps={{ sx: { textAlign: 'right' } }}
              InputProps={{
                startAdornment: key,
                endAdornment: getUnitStr(key),
              }}
            />
          ))}
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
