import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { ImgIcon, SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type { WeaponTypeKey } from '@genshin-optimizer/gi/consts'
import { allWeaponTypeKeys } from '@genshin-optimizer/gi/consts'
import { Chip, ToggleButton, useMediaQuery, useTheme } from '@mui/material'
import type { ReactNode } from 'react'
type WeaponToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: WeaponTypeKey[]) => void
  value: WeaponTypeKey[]
  totals: Record<WeaponTypeKey, ReactNode>
}

const weaponTypeHandler = handleMultiSelect([...allWeaponTypeKeys])
export function WeaponToggle({
  value,
  totals,
  onChange,
  ...props
}: WeaponToggleProps) {
  const theme = useTheme()
  const xs = !useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <SolidToggleButtonGroup exclusive value={value} {...props}>
      {allWeaponTypeKeys.map((wt) => (
        <ToggleButton
          key={wt}
          value={wt}
          sx={{
            p: xs ? 1 : undefined,
            minWidth: xs ? 0 : '6em',
            display: 'flex',
            gap: xs ? 0 : 1,
          }}
          onClick={() => onChange(weaponTypeHandler(value, wt))}
        >
          <ImgIcon src={imgAssets.weaponTypes?.[wt]} size={2} sideMargin />
          <Chip label={totals[wt]} size="small" />
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
