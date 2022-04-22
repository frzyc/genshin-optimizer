import { Skeleton, Typography } from "@mui/material";
import { ReactElement, ReactNode, Suspense } from "react";
import Assets from "../../Assets/Assets";
import WeaponSheet from "../../Data/Weapons/WeaponSheet";
import BootstrapTooltip from "../BootstrapTooltip";
import ImgIcon from "../Image/ImgIcon";

type Data = {
  sheet: WeaponSheet,
  addlText?: any,
  children: ReactElement<any, any> & ReactNode,
}
export default function WeaponNameTooltip({ sheet, addlText, children }: Data) {
  const title = <Suspense fallback={<Skeleton variant="text" width={100} />}>
    <Typography><ImgIcon src={Assets.weaponTypes[sheet.weaponType]} /> {sheet.name}</Typography>
    {addlText}
  </Suspense>
  return <BootstrapTooltip placement="top" title={title} disableInteractive>
    {children}
  </BootstrapTooltip>
}
