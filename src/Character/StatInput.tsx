import { Replay } from "@mui/icons-material"
import { Button, ButtonGroup, ButtonGroupProps, styled } from "@mui/material"
import { ReactNode } from "react"
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from "../Components/CustomNumberInput"
import TextButton from "../Components/TextButton"

type StatInputInput = ButtonGroupProps & {
  name: Displayable,
  children?: ReactNode,
  value: number,
  placeholder?: string,
  defaultValue?: number,
  onValueChange: (newValue: number | undefined) => void,
  percent?: boolean,
  disabled?: boolean,
}
const FlexButtonGroup = styled(ButtonGroup)({
  display: "flex"
})

export default function StatInput({ name, children, value, placeholder, defaultValue = 0, onValueChange, percent = false, disabled = false, ...restProps }: StatInputInput) {
  return <FlexButtonGroup {...restProps} disabled={disabled}>
    {children}
    <TextButton sx={{ whiteSpace: "nowrap" }} >
      {name}
    </TextButton>
    <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }} >
      <CustomNumberInput
        sx={{ px: 1 }}
        inputProps={{
          sx: { textAlign: "right" }
        }}
        float={percent}
        placeholder={placeholder}
        value={value}
        onChange={onValueChange}
        disabled={disabled}
        endAdornment={percent ? "%" : undefined}
      />
    </CustomNumberInputButtonGroupWrapper>
    <Button onClick={() => onValueChange(defaultValue)} disabled={disabled || value === defaultValue} >
      <Replay />
    </Button>
  </FlexButtonGroup>
}