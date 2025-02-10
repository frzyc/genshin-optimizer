import { DropdownButton } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import type { CondMeta } from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { Button, MenuItem } from '@mui/material'
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
        <MenuItem
          onClick={() => {
            database.chars.set(character.key, (chars) => ({
              conditionals: {
                ...chars.conditionals,
                [condMeta.key]: undefined,
              },
            }))
          }}
        >
          Clear
        </MenuItem>
        {range(condMeta.min, condMeta.max).map((i) => (
          <MenuItem
            key={i}
            value={i}
            onClick={() => {
              database.chars.set(character.key, (chars) => ({
                conditionals: {
                  ...chars.conditionals,
                  [condMeta.key]: i,
                },
              }))
            }}
          >
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
        onClick={() =>
          database.chars.set(character.key, (chars) => ({
            conditionals: {
              ...chars.conditionals,
              [condMeta.key]: +!value,
            },
          }))
        }
      >
        {typeof condMeta.text === 'function'
          ? condMeta.text(value)
          : condMeta.text}
      </Button>
    )
  }
  return null
}
