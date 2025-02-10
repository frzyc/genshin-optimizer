import { DropdownButton } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import type { CondMeta } from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { Button, MenuItem } from '@mui/material'
import { useCallback } from 'react'
import { useCharacterContext } from './CharacterContext'

export function ConditionalToggles({
  condMetas,
}: {
  condMetas: CondMeta[] | CondMeta
}) {
  if (!Array.isArray(condMetas)) condMetas = [condMetas]
  return condMetas.map((c) => <ConditionalToggle key={c.key} condMeta={c} />)
}
function ConditionalToggle({ condMeta }: { condMeta: CondMeta }) {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const value = character.conditionals[condMeta.key] ?? 0
  const updateConditional = useCallback(
    (value: number | undefined) =>
      database.chars.set(character.key, (chars) => ({
        conditionals: {
          ...chars.conditionals,
          [condMeta.key]: value,
        },
      })),
    [database.chars, character.key, condMeta.key]
  )
  if (condMeta.max > 1)
    return (
      <DropdownButton
        fullWidth
        value={value}
        color={value ? 'success' : 'primary'}
        title={
          typeof condMeta.text === 'function'
            ? condMeta.text(value)
            : condMeta.text
        }
        sx={{ borderRadius: 0 }}
      >
        <MenuItem onClick={() => updateConditional(undefined)}>Clear</MenuItem>
        {range(condMeta.min, condMeta.max).map((i) => (
          <MenuItem key={i} value={i} onClick={() => updateConditional(i)}>
            {typeof condMeta.text === 'function'
              ? condMeta.text(i)
              : condMeta.text}
          </MenuItem>
        ))}
      </DropdownButton>
    )
  if (condMeta.max === 1) {
    return (
      <Button
        fullWidth
        sx={{ borderRadius: 0 }}
        color={value ? 'success' : 'primary'}
        onClick={() => updateConditional(+!value)}
      >
        {typeof condMeta.text === 'function'
          ? condMeta.text(value)
          : condMeta.text}
      </Button>
    )
  }
  return null
}
