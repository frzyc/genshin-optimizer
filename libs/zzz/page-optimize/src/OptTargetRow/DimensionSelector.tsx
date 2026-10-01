import {
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { withDim } from '@genshin-optimizer/zzz/formula'
import {
  dimLabel,
  useResolvedOptTarget,
} from '@genshin-optimizer/zzz/formula-ui'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'

export function DimensionSelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const { ref, entry } = useResolvedOptTarget()
  const dims = entry ? Object.keys(entry.dims) : []
  if (!ref || !entry || dims.length < 2) return null

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={ref.dim}
      onChange={(_, dim: string | null) => {
        if (!dim || dim === ref.dim) return
        const next = withDim(ref, dim)
        if (next) database.teams.setFrame0(character.key, { ref: next })
      }}
      sx={{ flexShrink: 0 }}
    >
      {dims.map((dim) => (
        <ToggleButton key={dim} value={dim}>
          {dimLabel(dim)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
