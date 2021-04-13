import React, { useCallback, useEffect, useState } from 'react'
import FormControl from 'react-bootstrap/FormControl'

export default function CustomFormControl({ value, onChange, disabled, float = false, placeholder, allowEmpty = false }) {
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
    [value, onChange, state, float, allowEmpty],
  )
  useEffect(() => setstate(value ?? ""), [value, setstate, stateDirty])//update value on value change

  return <FormControl
    value={state}
    aria-label="custom-input"
    className="hide-appearance"
    type="number"
    placeholder={placeholder}
    onChange={e => setstate(e.target.value)}
    onBlur={sendChange}
    disabled={disabled}
    onKeyDown={e => e.key === "Enter" && sendChange()}
  />
}