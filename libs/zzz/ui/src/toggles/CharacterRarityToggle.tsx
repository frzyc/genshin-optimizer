import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type { CharacterRarityKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterRarityKeys } from '@genshin-optimizer/zzz/consts'
import { Box, Chip, ToggleButton, useMediaQuery, useTheme } from '@mui/material'
import type { ReactNode } from 'react'
type CharacterRarityToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: CharacterRarityKey[]) => void
  value: CharacterRarityKey[]
  totals: Record<CharacterRarityKey, ReactNode>
}
const rarityHandler = handleMultiSelect([...allCharacterRarityKeys])
export function CharacterRarityToggle({
  value,
  totals,
  onChange,
  ...props
}: CharacterRarityToggleProps) {
  const theme = useTheme()
  const xs = !useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <SolidToggleButtonGroup exclusive value={value} {...props}>
      {allCharacterRarityKeys.map((star) => (
        <ToggleButton
          key={star}
          value={star}
          sx={{
            p: xs ? 1 : undefined,
            minWidth: xs ? 0 : '6em',
            display: 'flex',
            gap: xs ? 0 : 1,
          }}
          onClick={() => onChange(rarityHandler(value, star))}
        >
          <Box display="flex">
            <strong>{star}</strong>
            {!xs && <Chip label={totals[star]} size="small" />}
          </Box>
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
