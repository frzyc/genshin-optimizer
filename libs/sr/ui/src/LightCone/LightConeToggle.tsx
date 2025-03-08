import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type { PathKey } from '@genshin-optimizer/sr/consts'
import { allPathKeys } from '@genshin-optimizer/sr/consts'
import { PathIcon } from '@genshin-optimizer/sr/svgicons'
import { Chip, ToggleButton, useMediaQuery, useTheme } from '@mui/material'
import type { ReactNode } from 'react'
type LightConeToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: PathKey[]) => void
  value: PathKey[]
  totals: Record<PathKey, ReactNode>
}

const lightconeTypeHandler = handleMultiSelect([...allPathKeys])
export function LightConeToggle({
  value,
  totals,
  onChange,
  ...props
}: LightConeToggleProps) {
  const theme = useTheme()
  const xs = !useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <SolidToggleButtonGroup exclusive value={value} {...props}>
      {allPathKeys.map((pt) => (
        <ToggleButton
          key={pt}
          value={pt}
          sx={{
            p: xs ? 1 : undefined,
            minWidth: xs ? 0 : '6em',
            display: 'flex',
            gap: xs ? 0 : 1,
          }}
          onClick={() => onChange(lightconeTypeHandler(value, pt))}
        >
          <PathIcon pathKey={pt} />
          <Chip label={totals[pt]} size="small" />
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
