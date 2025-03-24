import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { ImgIcon, SolidColoredToggleButton } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import { rarityDefIcon } from '@genshin-optimizer/zzz/assets'
import type { CharacterRarityKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterRarityKeys } from '@genshin-optimizer/zzz/consts'
import {
  Box,
  Chip,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { type ReactNode, useCallback, useMemo } from 'react'
type CharacterRarityToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: CharacterRarityKey[]) => void
  value: CharacterRarityKey[]
  totals: Record<CharacterRarityKey, ReactNode>
}

export function CharacterRarityToggle({
  value,
  totals,
  onChange,
  ...props
}: CharacterRarityToggleProps) {
  const theme = useTheme()
  const xs = !useMediaQuery(theme.breakpoints.up('sm'))
  const rarityHandler = useMemo(
    () => handleMultiSelect([...allCharacterRarityKeys]),
    []
  )
  const handleClick = useCallback(
    (key: CharacterRarityKey) => () => onChange(rarityHandler(value, key)),
    [onChange, rarityHandler, value]
  )
  return (
    <ToggleButtonGroup exclusive value={value} {...props}>
      {allCharacterRarityKeys.map((rKey) => (
        <SolidColoredToggleButton
          key={rKey}
          value={rKey}
          sx={{
            p: xs ? 1 : undefined,
            minWidth: xs ? 0 : '6em',
            display: 'flex',
            gap: xs ? 0 : 1,
          }}
          selectedColor={'primary'}
          onClick={handleClick(rKey)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImgIcon src={rarityDefIcon(rKey)} size={1.5} sideMargin />
            {!xs && <Chip label={totals[rKey]} size="small" />}
          </Box>
        </SolidColoredToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
