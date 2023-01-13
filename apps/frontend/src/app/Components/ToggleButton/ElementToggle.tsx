import { Box, Chip, ToggleButtonGroup } from "@mui/material";
import { allElements, ElementKey } from "../../Types/consts";
import { handleMultiSelect } from "../../Util/MultiSelect";
import SolidColoredToggleButton from "../SolidColoredToggleButton";
import { SolidToggleButtonGroupProps } from "../SolidToggleButtonGroup";
import StatIcon from "../StatIcon";
type ElementToggleProps = Omit<SolidToggleButtonGroupProps, "onChange" | "value"> & {
  onChange: (value: ElementKey[]) => void
  value: ElementKey[],
  totals: Record<ElementKey, number>
}
const elementHandler = handleMultiSelect([...allElements])
export default function ElementToggle({ value, totals, onChange, ...props }: ElementToggleProps) {
  return <ToggleButtonGroup exclusive value={value} {...props}>
    {allElements.map(ele => <SolidColoredToggleButton key={ele} value={ele} selectedColor={ele} onClick={() => onChange(elementHandler(value, ele))}>
      <Box sx={{ fontSize: "2em", lineHeight: 1 }}>{StatIcon[ele]}  </Box><Chip label={totals[ele]} size="small" />
    </SolidColoredToggleButton>)}
  </ToggleButtonGroup>
}
