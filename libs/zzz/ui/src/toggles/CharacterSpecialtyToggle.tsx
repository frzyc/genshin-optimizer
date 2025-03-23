import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { ImgIcon, SolidColoredToggleButton } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import { specialityDefIcon } from '@genshin-optimizer/zzz/assets'
import type { SpecialityKey } from '@genshin-optimizer/zzz/consts'
import { allSpecialityKeys } from '@genshin-optimizer/zzz/consts'
import { Chip, ToggleButtonGroup, useMediaQuery, useTheme } from '@mui/material'
import type { ReactNode } from 'react'
type CharSpecialtyToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: SpecialityKey[]) => void
  value: SpecialityKey[]
  totals: Record<SpecialityKey, ReactNode>
}

const specaltyTypeHandler = handleMultiSelect([...allSpecialityKeys])
export function CharSpecialtyToggle({
  value,
  totals,
  onChange,
  ...props
}: CharSpecialtyToggleProps) {
  const theme = useTheme()
  const xs = !useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <ToggleButtonGroup exclusive value={value} {...props}>
      {allSpecialityKeys.map((sk) => (
        <SolidColoredToggleButton
          key={sk}
          value={sk}
          sx={{
            p: xs ? 1 : undefined,
            minWidth: xs ? 0 : '6em',
            display: 'flex',
            gap: xs ? 0 : 1,
          }}
          selectedColor={'primary'}
          onClick={() => onChange(specaltyTypeHandler(value, sk))}
        >
          <ImgIcon src={specialityDefIcon(sk)} size={2} sideMargin />
          <Chip label={totals[sk]} size="small" />
        </SolidColoredToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
