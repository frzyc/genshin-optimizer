import type { ElementKey } from '@genshin-optimizer/consts'
import { allElementKeys } from '@genshin-optimizer/consts'
import { Chip, ToggleButtonGroup, useMediaQuery, useTheme } from '@mui/material'
import { ElementIcon } from '../../KeyMap/StatIcon'
import { handleMultiSelect } from '../../Util/MultiSelect'
import SolidColoredToggleButton from '../SolidColoredToggleButton'
import type { SolidToggleButtonGroupProps } from '../SolidToggleButtonGroup'
type ElementToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: ElementKey[]) => void
  value: ElementKey[]
  totals: Record<ElementKey, Displayable>
}
const elementHandler = handleMultiSelect([...allElementKeys])
export default function ElementToggle({
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
