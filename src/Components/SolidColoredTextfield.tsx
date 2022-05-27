import { TextField, TextFieldProps, useTheme } from "@mui/material";

type SolidColoredTextFieldProps = Omit<TextFieldProps, "multiline" | "variant" | "color" | "hiddenLabel" | "type" | "InputLabelProps"> & {
  hasValue: boolean
  startAdornment?: Displayable
  flattenCorners?: boolean
}
export default function SolidColoredTextField({ hasValue, startAdornment, flattenCorners = false, InputProps, sx, ...props }: SolidColoredTextFieldProps) {
  const theme = useTheme()
  console.log(flattenCorners)
  return <TextField
    {...props}
    multiline
    variant="filled"
    color={hasValue ? "success" : "primary"}
    hiddenLabel={props.label ? false : true}
    type="search"
    InputProps={{
      ...InputProps,
      startAdornment,
    }}
    InputLabelProps={{ style: { color: theme.palette.text.primary } }}
    sx={{
      ...sx,
      "& .MuiFilledInput-root": { backgroundColor: hasValue ? theme.palette.success.main : theme.palette.primary.main, borderRadius: flattenCorners ? 0 : 1, paddingTop: props.label ? undefined : 0, paddingBottom: 0 },
      "& .MuiFilledInput-root:before": { border: "none" },
      "& .MuiFilledInput-root:after": { border: "none" },
      "& .MuiFilledInput-root.Mui-focused": { backgroundColor: hasValue ? theme.palette.success.light : theme.palette.primary.light },
      "& .MuiFilledInput-root:hover": { backgroundColor: hasValue ? theme.palette.success.dark : theme.palette.primary.dark },
      "& .MuiFilledInput-root:hover:not(.Mui-disabled):before": { border: "none" },
    }}
  />
}
