import React, { useState } from 'react'
import FormControl from 'react-bootstrap/FormControl'

const FloatFormControl = ({ placeholder, value, onValueChange, disabled }) => {
  let [focus, setFocus] = useState(false)
  return <FormControl type="number" className="hide-appearance"
    placeholder={placeholder}
    value={!value && focus ? "" : value?.toString?.() || value}
    disabled={disabled}
    onChange={(e) => {
      let value = e.target.value;
      value = parseFloat(value) || 0
      onValueChange?.(value);
    }}
    onFocus={() => setFocus(true)}
    onBlur={() => setFocus(false)}
  />
}


const IntFormControl = ({ placeholder, value, onValueChange, disabled }) => {
  let [focus, setFocus] = useState(false)
  return <FormControl type="number" className="hide-appearance"
    placeholder={placeholder}
    value={!value && focus ? "" : value?.toString?.() || value}
    disabled={disabled}
    onChange={(e) => {
      let value = e.target.value;
      value = parseInt(value) || 0
      onValueChange?.(value);
    }}
    onFocus={() => setFocus(true)}
    onBlur={() => setFocus(false)}
  />
}

export {
  FloatFormControl,
  IntFormControl
}