import { ToggleButton } from "@mui/material";
import Assets from "../../Assets/Assets";
import { allWeaponTypeKeys, WeaponTypeKey } from "../../Types/consts";
import { handleMultiSelect } from "../../Util/MultiSelect";
import ImgIcon from "../Image/ImgIcon";
import SolidToggleButtonGroup, { SolidToggleButtonGroupProps } from "../SolidToggleButtonGroup";
type WeaponToggleProps = Omit<SolidToggleButtonGroupProps, "onChange" | "value"> & {
  onChange: (value: WeaponTypeKey[]) => void
  value: WeaponTypeKey[]
}
const weaponTypeHandler = handleMultiSelect([...allWeaponTypeKeys])
export default function WeaponToggle({ value, onChange, ...props }: WeaponToggleProps) {
  return <SolidToggleButtonGroup exclusive value={value} {...props}>
    {allWeaponTypeKeys.map(wt => <ToggleButton key={wt} value={wt} onClick={() => onChange(weaponTypeHandler(value, wt))}>
      <ImgIcon src={Assets.weaponTypes?.[wt]} size={2} />
    </ToggleButton>)}
  </SolidToggleButtonGroup>
}
