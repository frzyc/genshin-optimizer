import React, { useState } from 'react'
import FormControl from 'react-bootstrap/FormControl'

const CustomFormControl = ({ float = false, placeholder, value, onValueChange, disabled, allowEmpty = false }) => {
  let [focus, setFocus] = useState(false)
  let displayValue = value
  if (allowEmpty) displayValue = typeof value === "number" ? value : ""
  else displayValue = !value && focus ? "" : (value?.toString?.() || value)
  const props = {
    type: "number",
    className: "hide-appearance",
    placeholder,
    value: displayValue,
    disabled,
    onChange: (e) => {
      let value = e.target.value;
      if (float) {
        if (allowEmpty) value = value === "" ? null : (parseFloat(value) || 0)
        else value = parseFloat(value) || 0
      } else {
        if (allowEmpty) value = value === "" ? null : (parseInt(value) || 0)
        else value = parseInt(value) || 0
      }
      onValueChange?.(value);
    },
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
  }
  return <FormControl {...props} aria-label="custom-input" />
}
export default CustomFormControl;