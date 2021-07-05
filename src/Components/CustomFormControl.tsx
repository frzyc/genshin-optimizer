import React, { useCallback, useEffect, useState } from 'react'
import FormControl from 'react-bootstrap/FormControl'
type props = {
  value: any,
  onChange: (any) => void,
  className?: string
  disabled?: boolean
  float?: boolean,
  placeholder?: string,
  allowEmpty?: boolean,
  max?: string | number,
  min?: string | number,
}
export default function CustomFormControl({ value, onChange, className = "", disabled = false, float = false, placeholder, allowEmpty = false, max, min }: props) {
  const [state, setstate] = useState(value ?? "")
  const [stateDirty, setstateDirty] = useState({})
  const sendChange = useCallback(
    () => {
      setstateDirty({})
      if (allowEmpty && state === "") return onChange(null)
      if (state === "") setstate(0)
      const parseFunc = float ? parseFloat : parseInt
      onChange(parseFunc(state) || 0)
    },
    [onChange, state, float, allowEmpty],
  )
  useEffect(() => setstate(value ?? ""), [value, setstate, stateDirty])//update value on value change

  return <FormControl
    value={state}
    aria-label="custom-input"
    className={`hide-appearance ${className}`}
    type="number"
    placeholder={placeholder}
    onChange={e => setstate(e.target.value)}
    onBlur={sendChange}
    disabled={disabled}
    onKeyDown={e => e.key === "Enter" && sendChange()}
    max={max}
    min={min}
  />
}