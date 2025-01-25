import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { FormulaKey } from '@genshin-optimizer/zzz/solver'
import { allFormulaKeys } from '@genshin-optimizer/zzz/solver'
import { MenuItem } from '@mui/material'

export function OptimizeTargetSelector({
  formulaKey,
  setFormulaKey,
}: {
  formulaKey: FormulaKey
  setFormulaKey: (key: FormulaKey) => void
}) {
  return (
    <DropdownButton
      fullWidth
      title={
        <span>
          Optimize Target: <strong>{formulaKeyTextMap[formulaKey]}</strong>
        </span>
      }
      sx={{ flexGrow: 1 }}
    >
      {allFormulaKeys.map((fk) => (
        <MenuItem key={fk} onClick={() => setFormulaKey(fk)}>
          {formulaKeyTextMap[fk]}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
const formulaKeyTextMap: Record<FormulaKey, string> = {
  initial_atk: 'Initial ATK',
  electric_dmg_: 'Electrical Damage',
  fire_dmg_: 'Fire Damage',
  ice_dmg_: 'Ice Damage',
  physical_dmg_: 'Physical Damage',
  ether_dmg_: 'Ether Damage',
  burn: 'Burn Anomaly',
  shock: 'Shock Anomaly',
  corruption: 'Corruption Anomaly',
  shatter: 'Shatter Anomaly',
  assault: 'Assault Anomaly',
}
