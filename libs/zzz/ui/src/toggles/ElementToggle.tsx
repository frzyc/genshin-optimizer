import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { SolidColoredToggleButton } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type { AttributeKey } from '@genshin-optimizer/zzz/consts'
import { allAttributeKeys } from '@genshin-optimizer/zzz/consts'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import { Chip, ToggleButtonGroup, useMediaQuery, useTheme } from '@mui/material'
import type { ReactNode } from 'react'
type ElementToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: AttributeKey[]) => void
  value: AttributeKey[]
  totals: Record<AttributeKey, ReactNode>
}
const elementHandler = handleMultiSelect([...allAttributeKeys])
export function ElementToggle({
  value,
  totals,
  onChange,
  ...props
}: ElementToggleProps) {
  const theme = useTheme()
  const sm = !useMediaQuery(theme.breakpoints.up('md'))
  const xs = !useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <ToggleButtonGroup exclusive value={value} {...props}>
      {allAttributeKeys.map((atr) => (
        <SolidColoredToggleButton
          key={atr}
          value={atr}
          sx={{
            p: sm ? 1 : undefined,
            minWidth: sm ? 0 : '6em',
            display: 'flex',
          }}
          selectedColor={'primary'}
          onClick={() => onChange(elementHandler(value, atr))}
        >
          <ElementIcon
            ele={atr}
            iconProps={{ fontSize: sm && !xs ? 'inherit' : undefined }}
          />
          {!xs && <Chip sx={{ ml: 0.5 }} label={totals[atr]} size="small" />}
        </SolidColoredToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
