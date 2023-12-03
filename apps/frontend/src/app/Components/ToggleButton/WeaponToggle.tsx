import type { WeaponTypeKey } from '@genshin-optimizer/consts'
import { allWeaponTypeKeys } from '@genshin-optimizer/consts'
import { imgAssets } from '@genshin-optimizer/gi-assets'
import { Chip, ToggleButton, useMediaQuery, useTheme } from '@mui/material'
import { handleMultiSelect } from '../../Util/MultiSelect'
import ImgIcon from '../Image/ImgIcon'
import type { SolidToggleButtonGroupProps } from '../SolidToggleButtonGroup'
import SolidToggleButtonGroup from '../SolidToggleButtonGroup'
type WeaponToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: WeaponTypeKey[]) => void
  value: WeaponTypeKey[]
  totals: Record<WeaponTypeKey, Displayable>
}

const weaponTypeHandler = handleMultiSelect([...allWeaponTypeKeys])
export default function WeaponToggle({
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
