import type { FormulaRef } from '@genshin-optimizer/gi/formula'
import { OptTargetSelectedLabel } from '@genshin-optimizer/gi/formula-ui'
import { ListItemText, MenuItem } from '@mui/material'

export function OptTargetFieldMenuItem({
  formulaRef,
  selected,
  onSelect,
}: {
  formulaRef: FormulaRef
  selected: boolean
  onSelect: () => void
}) {
  return (
    <MenuItem selected={selected} onClick={onSelect}>
      <ListItemText>
        <OptTargetSelectedLabel formulaRef={formulaRef} />
      </ListItemText>
    </MenuItem>
  )
}
