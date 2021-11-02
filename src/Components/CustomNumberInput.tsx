import { InputBase, InputProps, styled } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
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

export default function CustomNumberInput({ value = 0, onChange, disabled = false, float = false, ...props }: props) {
  const [number, setNumber] = useState(value)
  const [focused, setFocus] = useState(false)
  const parseFunc = useMemo(() => float ? parseFloat : parseInt, [float],)
  const onBlur = useCallback(
    () => {
      onChange(number)
      setFocus(false)
    },
    [onChange, number, setFocus],
  )
  const onFocus = useCallback(
    () => {
      setFocus(true)
    },
    [setFocus],
  )
  useEffect(() => setNumber(value), [value, setNumber]) // update value on value change
  const onInputChange = useCallback(e => setNumber(parseFunc(e.target.value) || 0), [setNumber, parseFunc],)
  const onKeyDOwn = useCallback(e => e.key === "Enter" && onBlur(), [onBlur],)
  return <StyledInputBase
    value={(focused && !number) ? "" : number}
    aria-label="custom-input"
    type="number"
    onChange={onInputChange}
    onBlur={onBlur}
    onFocus={onFocus}
    disabled={disabled}
    onKeyDown={onKeyDOwn}
    {...props}
  />
}