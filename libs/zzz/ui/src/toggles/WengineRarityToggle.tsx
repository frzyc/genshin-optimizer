import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type { WengineRarityKey } from '@genshin-optimizer/zzz/consts'
import { allWengineRarityKeys } from '@genshin-optimizer/zzz/consts'
import { Box, Chip, ToggleButton, useMediaQuery, useTheme } from '@mui/material'
import type { ReactNode } from 'react'
type WengineRarityToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: WengineRarityKey[]) => void
  value: WengineRarityKey[]
  totals: Record<WengineRarityKey, ReactNode>
}
const rarityHandler = handleMultiSelect([...allWengineRarityKeys])
export function WengineRarityToggle({
  value,
  totals,
  onChange,
  ...props
}: WengineRarityToggleProps) {
  const theme = useTheme()
  const xs = !useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <SolidToggleButtonGroup exclusive value={value} {...props}>
      {allWengineRarityKeys.map((wrk) => (
        <ToggleButton
          key={wrk}
          value={wrk}
          sx={{
            p: xs ? 1 : undefined,
            minWidth: xs ? 0 : '6em',
            display: 'flex',
            gap: xs ? 0 : 1,
          }}
          onClick={() => onChange(rarityHandler(value, wrk))}
        >
          <Box display="flex">
            <strong>{wrk}</strong>
            <Chip label={totals[wrk]} size="small" />
          </Box>
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
