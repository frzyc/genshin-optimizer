import { getTeamFrame0, resolveTargetTag } from '@genshin-optimizer/zzz/db'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { isAbilityDim } from '@genshin-optimizer/zzz/formula'
import {
  dimensionByAbilityDim,
  type FormulaDimension,
  formulaDimensionLabel,
  formulaDimensions,
  isAbilityFormulaTag,
  resolveAbilityDim,
} from '@genshin-optimizer/zzz/formula-ui'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useMemo } from 'react'

export function DimensionSelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const team = useTeam(character.key)!
  const { tag: target } = getTeamFrame0(team)
  const resolvedTag = useMemo(
    () => (target ? resolveTargetTag(target) : undefined),
    [target]
  )

  if (
    !target?.name ||
    !target.q ||
    !isAbilityDim(target.q) ||
    !resolvedTag ||
    !isAbilityFormulaTag(resolvedTag)
  )
    return null

  const { name, q } = target
  const sheet = target.sheet ?? character.key
  const formulaDimension = dimensionByAbilityDim[q]

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={formulaDimension}
      onChange={(_, dim: FormulaDimension | null) => {
        if (!dim || dim === formulaDimension) return
        const nextAbilityDim = resolveAbilityDim(sheet, name, dim)
        if (!nextAbilityDim) return
        database.teams.setFrame0(character.key, {
          tag: {
            sheet,
            name,
            q: nextAbilityDim,
          },
        })
      }}
      sx={{ flexShrink: 0 }}
    >
      {formulaDimensions.map((dim) => (
        <ToggleButton key={dim} value={dim}>
          {formulaDimensionLabel(dim)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
