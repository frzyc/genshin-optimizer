import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type { CharacterRarityKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterRarityKeys } from '@genshin-optimizer/zzz/consts'
import { Box, Chip, ToggleButton, useMediaQuery, useTheme } from '@mui/material'
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
    <SolidToggleButtonGroup exclusive value={value} {...props}>
      {allCharacterRarityKeys.map((rKey) => (
        <ToggleButton
          key={rKey}
          value={rKey}
          sx={{
            p: xs ? 1 : undefined,
            minWidth: xs ? 0 : '6em',
            display: 'flex',
            gap: xs ? 0 : 1,
          }}
          onClick={handleClick(rKey)}
        >
          <Box display="flex">
            <strong>{rKey}</strong>
            {!xs && <Chip label={totals[rKey]} size="small" />}
          </Box>
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
