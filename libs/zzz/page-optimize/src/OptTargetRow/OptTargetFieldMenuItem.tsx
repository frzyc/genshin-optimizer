import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { TargetTag, ZzzDatabase } from '@genshin-optimizer/zzz/db'
import {
  AbilityOptTargetLabel,
  abilityDimFromField,
  isAbilityFormulaTag,
  isMultiTagField,
  isTagField,
  OptTargetSelectedLabel,
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

function targetQFromField(
  field: Field,
  target: TargetTag | undefined,
  characterKey: CharacterKey
): string | undefined {
  const ref = primaryTagFromField(field)
  if (!ref) return undefined
  if (isMultiTagField(field) || isAbilityFormulaTag(ref)) {
    return abilityDimFromField(field, target, characterKey)
  }
  if (isTagField(field)) return field.fieldRef.q ?? undefined
  return undefined
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
  const q = targetQFromField(field, target, characterKey)
  if (!q) return null

  const label =
    isMultiTagField(field) || isAbilityFormulaTag(ref) ? (
      <AbilityOptTargetLabel charKey={characterKey} tag={ref} />
    ) : (
      <OptTargetSelectedLabel charKey={characterKey} tag={ref} />
    )

  return (
    <MenuItem
      key={fieldKey}
      onClick={() =>
        setNamedTarget(database, characterKey, sheet, ref.name!, q)
      }
    >
      <ListItemText>{label}</ListItemText>
    </MenuItem>
  )
}
