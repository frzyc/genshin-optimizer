import { Box, ToggleButton } from "@mui/material";
import { useCallback } from "react";
import { allElements, ElementKey } from "../../Types/consts";
import SolidToggleButtonGroup, { SolidToggleButtonGroupProps } from "../SolidToggleButtonGroup";
import { uncoloredEleIcons } from "../StatIcon";
type ElementToggleProps = Omit<SolidToggleButtonGroupProps, "onChange" | "value"> & {
  onChange: (value: ElementKey | "") => void
  value: ElementKey | ""
}
export default function ElementToggle({ value, onChange, ...props }: ElementToggleProps) {
  const cb = useCallback((e, newVal) => onChange(newVal || ""), [onChange])
  return <SolidToggleButtonGroup exclusive onChange={cb} value={value || allElements} {...props}>
    {allElements.map(ele => <ToggleButton key={ele} value={ele} >
      <Box sx={{ fontSize: "2em", lineHeight: 1 }}>{uncoloredEleIcons[ele]}</Box>
    </ToggleButton>)}
  </SolidToggleButtonGroup>
}
