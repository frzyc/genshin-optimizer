import { Button, ButtonProps, InputBase, InputProps, styled } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
export type CustomNumberInputProps = Omit<InputProps, "onChange"> & {
  value?: number | undefined,
  onChange: (newValue: number | undefined) => void,
  disabled?: boolean
  float?: boolean,
  allowEmpty?: boolean,
  disableNegative?: boolean
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

const Wrapper = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  padding: 0,
  overflow: "hidden",
  "div": {
    width: "100%",
    height: "100%",
  },
}))

// wrap the Input with this when using the input in a buttongroup
export function CustomNumberInputButtonGroupWrapper({ children, disableRipple, disableFocusRipple, disableTouchRipple, ...props }: ButtonProps) {
  return <Wrapper disableRipple disableFocusRipple disableTouchRipple {...props}>{children}</Wrapper>
}

export default function CustomNumberInput({ value = 0, onChange, disabled = false, float = false, disableNegative = false, ...props }: CustomNumberInputProps) {
  const [number, setNumber] = useState(value)
  const [focused, setFocus] = useState(false)
  const parseFunc = useCallback((val: string) => {
    let num = float ? parseFloat(val) : parseInt(val)
    if (disableNegative) num = Math.abs(num)
    return num
  }, [float, disableNegative])
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
    inputProps={{ step: float ? 0.1 : 1 }}
    onChange={onInputChange}
    onBlur={onBlur}
    onFocus={onFocus}
    disabled={disabled}
    onKeyDown={onKeyDOwn}
    {...props}
  />
}
