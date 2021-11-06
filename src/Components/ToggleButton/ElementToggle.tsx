import { Box, ToggleButtonGroup } from "@mui/material";
import { useCallback } from "react";
import { allElements, ElementKey } from "../../Types/consts";
import SolidColoredToggleButton from "../SolidColoredToggleButton";
import { SolidToggleButtonGroupProps } from "../SolidToggleButtonGroup";
import { uncoloredEleIcons } from "../StatIcon";
type ElementToggleProps = Omit<SolidToggleButtonGroupProps, "onChange" | "value"> & {
  onChange: (value: ElementKey | "") => void
  value: ElementKey | ""
}
export default function ElementToggle({ value, onChange, ...props }: ElementToggleProps) {
  const cb = useCallback((e, newVal) => onChange(newVal || ""), [onChange])
  return <ToggleButtonGroup exclusive onChange={cb} value={value || allElements} {...props}>
    {allElements.map(ele => <SolidColoredToggleButton key={ele} value={ele} selectedColor={ele} >
      <Box sx={{ fontSize: "2em", lineHeight: 1 }}>{uncoloredEleIcons[ele]}</Box>
    </SolidColoredToggleButton>)}
  </ToggleButtonGroup>
}
