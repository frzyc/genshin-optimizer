import type { RarityKey } from '@genshin-optimizer/consts'
import { allRarityKeys } from '@genshin-optimizer/consts'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Box, Chip, ToggleButton, useMediaQuery, useTheme } from '@mui/material'
import { handleMultiSelect } from '../../Util/MultiSelect'
import type { SolidToggleButtonGroupProps } from '../SolidToggleButtonGroup'
import SolidToggleButtonGroup from '../SolidToggleButtonGroup'
type RarityToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: RarityKey[]) => void
  value: RarityKey[]
  totals: Record<RarityKey, Displayable>
}
const rarityHandler = handleMultiSelect([...allRarityKeys])
export default function RarityToggle({
  value,
  totals,
  onChange,
  ...props
}: RarityToggleProps) {
  const theme = useTheme()
  const xs = !useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <SolidToggleButtonGroup exclusive value={value} {...props}>
      {allRarityKeys.map((star) => (
        <ToggleButton
          key={star}
          value={star}
          sx={{
            p: xs ? 1 : undefined,
            minWidth: xs ? 0 : '7em',
            display: 'flex',
            gap: xs ? 0 : 1,
          }}
          onClick={() => onChange(rarityHandler(value, star))}
        >
          <Box display="flex">
            <strong>{star}</strong>
            <StarRoundedIcon />
            <Chip label={totals[star]} size="small" />
          </Box>
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
