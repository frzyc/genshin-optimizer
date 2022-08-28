import { Box, ToggleButtonGroup } from "@mui/material";
import { allElements, ElementKey } from "../../Types/consts";
import { handleMultiSelect } from "../../Util/MultiSelect";
import SolidColoredToggleButton from "../SolidColoredToggleButton";
import { SolidToggleButtonGroupProps } from "../SolidToggleButtonGroup";
import StatIcon from "../StatIcon";
type ElementToggleProps = Omit<SolidToggleButtonGroupProps, "onChange" | "value"> & {
  onChange: (value: ElementKey[]) => void
  value: ElementKey[]
}
const elementHandler = handleMultiSelect([...allElements])
export default function ElementToggle({ value, onChange, ...props }: ElementToggleProps) {
  return <ToggleButtonGroup exclusive value={value} {...props}>
    {allElements.map(ele => <SolidColoredToggleButton key={ele} value={ele} selectedColor={ele} onClick={() => onChange(elementHandler(value, ele))}>
      <Box sx={{ fontSize: "2em", lineHeight: 1 }}>{StatIcon[ele]}</Box>
    </SolidColoredToggleButton>)}
  </ToggleButtonGroup>
}
