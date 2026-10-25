import { CharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { withDim } from '@genshin-optimizer/gi/formula'
import {
  dimLabel,
  useResolvedOptTarget,
} from '@genshin-optimizer/gi/formula-ui'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useContext } from 'react'

export function DimensionSelector() {
  const database = useDatabase()
  const { character } = useContext(CharacterContext)
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
        if (next) database.pandoTeams.set(character.key, { ref: next })
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
