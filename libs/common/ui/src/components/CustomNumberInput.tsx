import type { ButtonProps, InputProps } from '@mui/material'
import { Button, InputBase, styled } from '@mui/material'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
export type CustomNumberInputProps = Omit<InputProps, 'onChange'> & {
  value?: number | undefined | null
  onChange: (newValue: number | undefined) => void
  disabled?: boolean
  float?: boolean
  allowEmpty?: boolean
  disableNegative?: boolean
  onEnter?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export const StyledInputBase = styled(InputBase)(
  ({ theme, color = 'primary' }) => ({
    backgroundColor: theme.palette[color].main,
    transition: 'all 0.5s ease',
    '&:hover': {
      backgroundColor: theme.palette[color].dark,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette[color].dark,
    },
    '&.Mui-disabled': {
      backgroundColor: theme.palette[color].dark,
    },
  })
)

const Wrapper = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  padding: 0,
  overflow: 'hidden',
  div: {
    width: '100%',
    height: '100%',
  },
}))

// wrap the Input with this when using the input in a buttongroup
export function CustomNumberInputButtonGroupWrapper({
  children,
  disableRipple,
  disableFocusRipple,
  disableTouchRipple,
  ...props
}: ButtonProps) {
  return (
    <Wrapper disableRipple disableFocusRipple disableTouchRipple {...props}>
      {children}
    </Wrapper>
  )
}

export function CustomNumberInput({
  value = undefined,
  onChange,
  disabled = false,
  float = false,
  allowEmpty = false,
  onEnter = () => {},
  ...props
}: CustomNumberInputProps) {
  if ((value === undefined || value === null) && !allowEmpty) value = 0
  if (value === null) value = undefined
  const { inputProps = {}, ...restProps } = props
  const { min, max } = inputProps
  const [display, setDisplay] = useState(
    value === undefined ? '' : value.toString()
  )

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDisplay(e.target.value),
    []
  )

  const parseFunc = useCallback(
    (val: string) => (float ? parseFloat(val) : parseInt(val)),
    [float]
  )
  const onValidate = useCallback(() => {
    const change = (v?: number) => {
      setDisplay(v === undefined ? '' : v.toString())
      onChange(v)
    }
    let newNum = parseFunc(display)
    if (isNaN(newNum)) {
      if (allowEmpty) return change(undefined)
      newNum = 0
    }
    if (newNum === undefined) return change(undefined)
    if (min !== undefined && newNum < min) return change(min)
    if (max !== undefined && newNum > max) return change(max)
    return change(newNum)
  }, [display, allowEmpty, parseFunc, min, max, onChange])

  useEffect(
    () => setDisplay(value === undefined ? '' : value.toString()),
    [value, setDisplay]
  ) // update value on value change

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        onValidate()
        onEnter(e)
      }
    },
    [onValidate, onEnter]
  )

  return (
    <StyledInputBase
      value={display}
      aria-label="custom-input"
      type="number"
      inputProps={{ step: float ? 0.1 : 1, ...inputProps }}
      onChange={onInputChange}
      onBlurCapture={onValidate}
      disabled={disabled}
      onKeyDown={onKeyDown}
      {...restProps}
    />
  )
}
