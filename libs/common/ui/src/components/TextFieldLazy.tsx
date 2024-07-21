'use client'
import type { TextFieldProps } from '@mui/material'
import { TextField } from '@mui/material'
import { useEffect, useState } from 'react'

/**
 * A textfield that only triggers `onChange` when it is blurred (unfocused) or if not multi-line, the enter key.
 */
export function TextFieldLazy<T extends string | undefined | null>({
  value: valueProp,
  onChange,
  ...props
}: {
  value: T
  onChange: (value: T) => void
} & Omit<TextFieldProps, 'value' | 'onChange' | 'onBlur' | 'onKeyDown'>) {
  const [value, setValue] = useState(valueProp)

  useEffect(() => {
    setValue(valueProp)
  }, [valueProp])

  const saveValue = () => onChange(value)

  return (
    <TextField
      value={value}
      onChange={(e) => setValue(e.target.value as T)}
      onBlur={saveValue}
      onKeyDown={(e) => e.key === 'Enter' && !props.multiline && saveValue()}
      {...props}
    />
  )
}
