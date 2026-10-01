import { DropdownButton } from '@genshin-optimizer/common/ui'
import {
  type AttributeKey,
  allAttributeKeys,
} from '@genshin-optimizer/zzz/consts'
import {
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { withAttribute } from '@genshin-optimizer/zzz/formula'
import { useResolvedOptTarget } from '@genshin-optimizer/zzz/formula-ui'
import { AttributeName } from '@genshin-optimizer/zzz/ui'
import { MenuItem } from '@mui/material'

export function AttributeOverlaySelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const { ref, entry } = useResolvedOptTarget()
  if (!entry?.overlays?.attribute || !ref) return null
  return (
    <DropdownButton
      title={
        ref.attribute ? (
          <AttributeName attribute={ref.attribute} />
        ) : (
          'No Attribute'
        )
      }
      color={ref.attribute}
    >
      <MenuItem
        onClick={() =>
          database.teams.setFrame0(character.key, (frame) => {
            if (!frame.ref) return false
            const next = withAttribute(frame.ref, undefined)
            return next ? { ref: next } : false
          })
        }
      >
        No Attribute
      </MenuItem>
      {allAttributeKeys.map((attr: AttributeKey) => (
        <MenuItem
          key={attr}
          onClick={() =>
            database.teams.setFrame0(character.key, (frame) => {
              if (!frame.ref) return false
              const next = withAttribute(frame.ref, attr)
              return next ? { ref: next } : false
            })
          }
        >
          <AttributeName attribute={attr} />
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
