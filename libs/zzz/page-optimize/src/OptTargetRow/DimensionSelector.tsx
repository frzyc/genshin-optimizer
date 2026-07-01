import { getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import type { FormulaDimension } from '@genshin-optimizer/zzz/formula'
import {
  formulaDimensionByQ,
  formulaDimensions,
  formulas,
  resolveFormulaQ,
} from '@genshin-optimizer/zzz/formula'
import { FORMULA_DIMENSION_LABEL } from '@genshin-optimizer/zzz/formula-ui'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'

export function DimensionSelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const team = useTeam(character.key)!
  const { tag: target } = getTeamFrame0(team)

  if (!target?.name || !target.formulaQ) return null

  const { name, formulaQ } = target
  const sheet = target.sheet ?? character.key
  const formulaDimension = formulaDimensionByQ[formulaQ]

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={formulaDimension}
      onChange={(_, dim: FormulaDimension | null) => {
        if (!dim || dim === formulaDimension) return
        const sheetFormulas = (
          formulas as Record<string, Record<string, unknown>>
        )[sheet]
        const nextFormulaQ = resolveFormulaQ(sheetFormulas, name, dim)
        if (!nextFormulaQ) return
        database.teams.setFrame0(character.key, {
          tag: {
            sheet,
            name,
            formulaQ: nextFormulaQ,
            damageType1: target.damageType1,
            damageType2: target.damageType2,
          },
        })
      }}
      sx={{ flexShrink: 0 }}
    >
      {formulaDimensions.map((dim) => (
        <ToggleButton key={dim} value={dim}>
          {FORMULA_DIMENSION_LABEL[dim]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
