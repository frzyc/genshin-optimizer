'use client'
import type { ButtonProps, InputProps } from '@mui/material'
import { Button, InputBase, styled } from '@mui/material'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
export type CustomNumberInputProps = Omit<InputProps, 'onChange'> & {
  value?: number | undefined
  onChange: (newValue: number | undefined) => void
  disabled?: boolean
  float?: boolean
  allowEmpty?: boolean
  disableNegative?: boolean
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
  value = 0,
  onChange,
  disabled = false,
  float = false,
  ...props
}: CustomNumberInputProps) {
  const { inputProps = {}, ...restProps } = props
  const { min, max } = inputProps
  const [display, setDisplay] = useState(value.toString())

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDisplay(e.target.value),
    []
  )

  const parseFunc = useCallback(
    (val: string) => (float ? Number.parseFloat(val) : Number.parseInt(val)),
    [float]
  )
  const onValidate = useCallback(() => {
    const change = (v: number) => {
      setDisplay(v.toString())
      onChange(v)
    }
    const newNum = parseFunc(display) || 0
    if (min !== undefined && newNum < min) return change(min)
    if (max !== undefined && newNum > max) return change(max)
    return change(newNum)
  }, [min, max, parseFunc, onChange, display])

  useEffect(() => setDisplay(value.toString()), [value]) // update value on value change

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      e.key === 'Enter' && onValidate(),
    [onValidate]
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
