import { ToggleButton } from "@mui/material";
import { useCallback } from "react";
import Assets from "../../Assets/Assets";
import { allWeaponTypeKeys, WeaponTypeKey } from "../../Types/consts";
import ImgIcon from "../Image/ImgIcon";
import SolidToggleButtonGroup, { SolidToggleButtonGroupProps } from "../SolidToggleButtonGroup";
type WeaponToggleProps = Omit<SolidToggleButtonGroupProps, "onChange" | "value"> & {
  onChange: (value: WeaponTypeKey | "") => void
  value: WeaponTypeKey | ""
}
export default function WeaponToggle({ value, onChange, ...props }: WeaponToggleProps) {
  const cb = useCallback((e, newVal) => onChange(newVal || ""), [onChange])
  return <SolidToggleButtonGroup exclusive onChange={cb} value={value || allWeaponTypeKeys} {...props}>
    {allWeaponTypeKeys.map(wt => <ToggleButton key={wt} value={wt}>
      <ImgIcon src={Assets.weaponTypes?.[wt]} size={2} />
    </ToggleButton>)}
  </SolidToggleButtonGroup>
}