import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { FormulaDimension } from '@genshin-optimizer/zzz/formula'
import { formulaDimensions } from '@genshin-optimizer/zzz/formula'
import { getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import { useCharacterContext, useDatabaseContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import { MenuItem } from '@mui/material'

const DIMENSION_LABEL: Record<FormulaDimension, string> = {
  dmg: 'DMG',
  daze: 'Daze',
  anomBuildup: 'Anom',
}

export function DimensionSelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const team = useTeam(character.key)!
  const { tag: target } = getTeamFrame0(team)

  if (!target?.name || target.formulaDimension === undefined) return null

  const { formulaDimension = 'dmg', name } = target
  const sheet = target.sheet ?? character.key

  return (
    <DropdownButton title={DIMENSION_LABEL[formulaDimension]}>
      {formulaDimensions.map((dim) => (
        <MenuItem
          key={dim}
          selected={dim === formulaDimension}
          disabled={dim === formulaDimension}
          onClick={() =>
            database.teams.setFrame0(character.key, {
              tag: {
                sheet,
                name,
                formulaDimension: dim,
                damageType1: target.damageType1,
                damageType2: target.damageType2,
              },
            })
          }
        >
          {DIMENSION_LABEL[dim]}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
