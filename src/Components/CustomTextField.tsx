import { debounce, TextField, TextFieldProps } from "@mui/material";
import { ChangeEvent, useCallback, useMemo } from "react";

type CustomTextFieldProps = TextFieldProps & {
  onChange: (newValue: string | undefined) => void,
}
export default function CustomTextField({ onChange, ...props}: CustomTextFieldProps) {
  const changeHandler = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value)
    },
    [onChange]
  )
  // TODO R18: useDeferredValue
  const debouncedChangedHandler = useMemo(() => debounce(changeHandler, 200), [changeHandler])

  return <TextField
    variant="filled"
    onChange={debouncedChangedHandler}
    {...props}
  />
}
