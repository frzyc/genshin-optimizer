import { getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { formulas, isAbilityDim } from '@genshin-optimizer/zzz/formula'
import {
  type FormulaDimension,
  dimensionByAbilityDim,
  formulaDimensionLabel,
  formulaDimensions,
  resolveAbilityDim,
} from '@genshin-optimizer/zzz/formula-ui'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'

export function DimensionSelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const team = useTeam(character.key)!
  const { tag: target } = getTeamFrame0(team)

  if (!target?.name || !target.q || !isAbilityDim(target.q)) return null

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
        const sheetFormulas = formulas[sheet as keyof typeof formulas]
        const nextAbilityDim = resolveAbilityDim(sheetFormulas, name, dim)
        if (!nextAbilityDim) return
        database.teams.setFrame0(character.key, {
          tag: {
            sheet,
            name,
            q: nextAbilityDim,
            damageType1: target.damageType1,
            damageType2: target.damageType2,
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
