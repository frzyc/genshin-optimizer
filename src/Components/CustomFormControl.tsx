import { useCallback, useEffect, useState } from 'react'
import FormControl from 'react-bootstrap/FormControl'
type props = {
  value: number | undefined,
  onChange: (newValue: number | undefined) => void,
  className?: string
  disabled?: boolean
  float?: boolean,
  placeholder?: string,
  allowEmpty?: boolean,
  max?: string | number,
  min?: string | number,
}
export default function CustomFormControl({ value, onChange, className = "", disabled = false, float = false, placeholder, allowEmpty = false, max, min }: props) {
  const [state, setState] = useState("")
  const sendChange = useCallback(
    () => {
      if (allowEmpty && state === "") return onChange(undefined)
      if (state === "") return onChange(0)
      const parseFunc = float ? parseFloat : parseInt
      onChange(parseFunc(state))
    },
    [onChange, state, float, allowEmpty],
  )
  useEffect(() => setState(value?.toString() ?? ""), [value, setState]) // update value on value change

  return <FormControl
    value={state}
    aria-label="custom-input"
    className={`hide-appearance ${className}`}
    type="number"
    placeholder={placeholder}
    onChange={(e: any) => setState(e.target.value)}
    onBlur={sendChange}
    disabled={disabled}
    onKeyDown={(e: any) => e.key === "Enter" && sendChange()}
    max={max}
    min={min}
  />
}