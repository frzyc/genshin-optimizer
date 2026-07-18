import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { TargetTag, ZzzDatabase } from '@genshin-optimizer/zzz/db'
import { isAbilityDim } from '@genshin-optimizer/zzz/formula'
import {
  AbilityOptTargetLabel,
  abilityDimFromField,
  FullTagDisplay,
  getFieldCategory,
  isAbilityFormulaTag,
  isMultiTagField,
  isTagField,
  OptTargetFormulaLabel,
  primaryTagFromField,
} from '@genshin-optimizer/zzz/formula-ui'
import { ListItemText, MenuItem } from '@mui/material'

function setAbilityTarget(
  database: ZzzDatabase,
  characterKey: CharacterKey,
  sheet: string,
  name: string,
  q: string
) {
  database.teams.setFrame0(characterKey, {
    tag: {
      sheet,
      name,
      q,
    },
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
  if (isMultiTagField(field)) {
    const ref = primaryTagFromField(field)
    if (!ref?.name) return null
    const sheet = ref.sheet ?? characterKey
    const q = abilityDimFromField(field, target ?? undefined, characterKey)
    if (!q) return null
    return (
      <MenuItem
        key={fieldKey}
        onClick={() =>
          setAbilityTarget(database, characterKey, sheet, ref.name!, q)
        }
      >
        <ListItemText>
          <AbilityOptTargetLabel charKey={characterKey} tag={ref} />
        </ListItemText>
      </MenuItem>
    )
  }

  if (!isTagField(field)) return null
  const { fieldRef } = field
  const { name } = fieldRef
  if (!name) return null

  if (isAbilityFormulaTag(fieldRef)) {
    const sheet = fieldRef.sheet ?? characterKey
    const q =
      target?.name === name &&
      (target.sheet ?? characterKey) === sheet &&
      target.q &&
      isAbilityDim(target.q)
        ? target.q
        : isAbilityDim(fieldRef.q)
          ? fieldRef.q
          : undefined
    if (!q) return null
    return (
      <MenuItem
        key={fieldKey}
        onClick={() =>
          setAbilityTarget(
            database,
            characterKey,
            fieldRef.sheet ?? characterKey,
            name,
            q
          )
        }
      >
        <ListItemText>
          <AbilityOptTargetLabel charKey={characterKey} tag={fieldRef} />
        </ListItemText>
      </MenuItem>
    )
  }

  return (
    <MenuItem
      key={fieldKey}
      onClick={() =>
        database.teams.setFrame0(characterKey, {
          tag: { sheet: characterKey, name },
        })
      }
    >
      <ListItemText>
        {getFieldCategory(characterKey, fieldRef) ? (
          <OptTargetFormulaLabel charKey={characterKey} tag={fieldRef} />
        ) : (
          <FullTagDisplay tag={fieldRef} />
        )}
      </ListItemText>
    </MenuItem>
  )
}
