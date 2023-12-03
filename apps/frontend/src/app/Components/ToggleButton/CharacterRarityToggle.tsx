import type { CharacterRarityKey } from '@genshin-optimizer/consts'
import { allCharacterRarityKeys } from '@genshin-optimizer/consts'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Box, Chip, ToggleButton, useMediaQuery, useTheme } from '@mui/material'
import { handleMultiSelect } from '../../Util/MultiSelect'
import type { SolidToggleButtonGroupProps } from '../SolidToggleButtonGroup'
import SolidToggleButtonGroup from '../SolidToggleButtonGroup'
type CharacterRarityToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: CharacterRarityKey[]) => void
  value: CharacterRarityKey[]
  totals: Record<CharacterRarityKey, Displayable>
}
const rarityHandler = handleMultiSelect([...allCharacterRarityKeys])
export default function CharacterRarityToggle({
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
            <StarRoundedIcon />
            {!xs && <Chip label={totals[star]} size="small" />}
          </Box>
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
