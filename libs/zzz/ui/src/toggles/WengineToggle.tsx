import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { ImgIcon, SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import { specialtyDefIcon } from '@genshin-optimizer/zzz/assets'
import type { SpecialtyKey } from '@genshin-optimizer/zzz/consts'
import { allSpecialtyKeys } from '@genshin-optimizer/zzz/consts'
import { Chip, ToggleButton, useMediaQuery, useTheme } from '@mui/material'
import type { ReactNode } from 'react'

type WengineToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: SpecialtyKey[]) => void
  value: SpecialtyKey[]
  totals: Record<SpecialtyKey, ReactNode>
}

const wengineTypeHandler = handleMultiSelect([...allSpecialtyKeys])
export function WengineToggle({
  value,
  totals,
  onChange,
  ...props
}: WengineToggleProps) {
  const theme = useTheme()
  const xs = !useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <SolidToggleButtonGroup exclusive value={value} {...props}>
      {allSpecialtyKeys.map((sk) => (
        <ToggleButton
          key={sk}
          value={sk}
          sx={{
            p: xs ? 1 : undefined,
            minWidth: xs ? 0 : '6em',
            display: 'flex',
            gap: xs ? 0 : 1,
          }}
          onClick={() => onChange(wengineTypeHandler(value, sk))}
        >
          <ImgIcon src={specialtyDefIcon(sk)} size={2} sideMargin />
          <Chip label={totals[sk]} size="small" />
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
