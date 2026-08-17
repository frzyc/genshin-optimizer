import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { TargetTag, ZzzDatabase } from '@genshin-optimizer/zzz/db'
import {
  OptTargetSelectedLabel,
  optTargetQFromField,
  primaryTagFromField,
} from '@genshin-optimizer/zzz/formula-ui'
import { ListItemText, MenuItem } from '@mui/material'

function setNamedTarget(
  database: ZzzDatabase,
  characterKey: CharacterKey,
  sheet: string,
  name: string,
  q: string
) {
  database.teams.setFrame0(characterKey, {
    tag: { sheet, name, q },
  })
}

export function OptTargetFieldMenuItem({
  field,
  fieldKey,
  characterKey,
  target,
  database,
}: {
  field: Field
  fieldKey: string
  characterKey: CharacterKey
  target: TargetTag | undefined
  database: ZzzDatabase
}) {
  const ref = primaryTagFromField(field)
  if (!ref?.name) return null

  const sheet = ref.sheet ?? characterKey
  const q = optTargetQFromField(field, target, characterKey)
  if (!q) return null

  return (
    <MenuItem
      key={fieldKey}
      onClick={() =>
        setNamedTarget(database, characterKey, sheet, ref.name!, q)
      }
    >
      <ListItemText>
        <OptTargetSelectedLabel charKey={characterKey} tag={ref} />
      </ListItemText>
    </MenuItem>
  )
}
