import { InputBase, InputProps, styled } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
type props = Omit<InputProps, "onChange"> & {
  value?: number | undefined,
  onChange: (newValue: number | undefined) => void,
  disabled?: boolean
  float?: boolean,
  allowEmpty?: boolean,
}

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  transition: "all 0.5s ease",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  "&.Mui-focused": {
    backgroundColor: theme.palette.primary.dark,
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.primary.dark,
  },
}))

// wrap the Input with this when using the input in a buttongroup
export const CustomNumberInputButtonGroupWrapper = styled("button", {
  shouldForwardProp: (prop) => !["fullWidth", "disableRipple", "disableFocusRipple", "disableElevation"].includes(prop as string)
})(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  padding: 0,
  overflow: "hidden",
  border: "none",
  borderRadius: theme.shape.borderRadius,
  "& div": {
    width: "100%",
    height: "100%",
  },
  "&.MuiButtonGroup-grouped:not(:last-of-type)": {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  "&.MuiButtonGroup-grouped:not(:first-of-type)": {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
}))

export default function CustomNumberInput({ value, onChange, disabled = false, float = false, ...props }: props) {
  const [state, setState] = useState("")
  const sendChange = useCallback(
    () => {
      if (state === "") return onChange(0)
      const parseFunc = float ? parseFloat : parseInt
      onChange(parseFunc(state))
    },
    [onChange, state, float],
  )
  useEffect(() => setState(value?.toString() ?? ""), [value, setState]) // update value on value change
  const onInputChange = useCallback(e => setState(e.target.value), [setState],)
  const onKeyDOwn = useCallback(e => e.key === "Enter" && sendChange(), [sendChange],)
  return <StyledInputBase
    value={state}
    aria-label="custom-input"
    type="number"
    onChange={onInputChange}
    onBlur={sendChange}
    disabled={disabled}
    onKeyDown={onKeyDOwn}
    {...props}
  />
}