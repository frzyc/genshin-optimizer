'use client'
import type { TextFieldProps } from '@mui/material'
import { TextField } from '@mui/material'
import type { ChangeEvent, FocusEvent } from 'react'
import { useEffect, useState } from 'react'

/**
 * A textfield for numeric inputs that only triggers `onChange` when it is blurred (unfocused) or if not multi-line, the enter key.
 * Allows parsing of numbers as both intergers and float, respects `inputProps.min` and `inputProps.max`.
 */
export function NumberInputLazy({
  value: valueProp,
  onChange,
  float = false,
  ...props
}: {
  value: number
  float?: boolean
  onChange: (value: number) => void
} & Omit<TextFieldProps, 'value' | 'onChange' | 'onBlur' | 'onKeyDown'>) {
  const [value, setValue] = useState(valueProp?.toString())
  const { min, max } = props?.inputProps ?? {}
  useEffect(() => {
    setValue(valueProp?.toString())
  }, [valueProp])
  const normalizedValue = float ? value.replace(',', '.') : value

  const saveValue = () => {
    let num = float ? parseFloat(normalizedValue) : parseInt(normalizedValue)
    if (isNaN(num)) {
      num = 0
      setValue(num.toString())
    }
    if (min !== undefined && num < min) {
      onChange(min)
      setValue(min.toString())
      return
    }
    if (max !== undefined && num > max) {
      onChange(max)
      setValue(max.toString())
      return
    }
    onChange(num)
  }

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = event.target.value

    if (val.match(float ? /[^0-9.,-]/ : /[^0-9-]/)) {
      return event.preventDefault()
    }

    setValue(val)
  }

  const onFocus = (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    event.target.select()
  }

  return (
    <TextField
      value={value?.toString()}
      onChange={handleChange}
      onBlur={saveValue}
      onFocus={onFocus}
      onKeyDown={(e) => e.key === 'Enter' && !props.multiline && saveValue()}
      {...props}
      inputProps={{
        inputMode: 'numeric',
        ...(props.inputProps ?? {}),
      }}
    />
  )
}
