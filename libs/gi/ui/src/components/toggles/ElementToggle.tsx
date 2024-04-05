import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { SolidColoredToggleButton } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type { ElementKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { ElementIcon } from '@genshin-optimizer/gi/svgicons'
import { Chip, ToggleButtonGroup, useMediaQuery, useTheme } from '@mui/material'
import type { ReactNode } from 'react'
type ElementToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: ElementKey[]) => void
  value: ElementKey[]
  totals: Record<ElementKey, ReactNode>
}
const elementHandler = handleMultiSelect([...allElementKeys])
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
      {allElementKeys.map((ele) => (
        <SolidColoredToggleButton
          key={ele}
          value={ele}
          sx={{
            p: sm ? 1 : undefined,
            minWidth: sm ? 0 : '6em',
            display: 'flex',
          }}
          selectedColor={ele}
          onClick={() => onChange(elementHandler(value, ele))}
        >
          <ElementIcon
            ele={ele}
            iconProps={{ fontSize: sm && !xs ? 'inherit' : undefined }}
          />
          {!xs && <Chip sx={{ ml: 0.5 }} label={totals[ele]} size="small" />}
        </SolidColoredToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
