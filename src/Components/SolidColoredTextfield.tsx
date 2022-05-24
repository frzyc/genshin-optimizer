import { TextField, TextFieldProps, useTheme } from "@mui/material";

type SolidColoredTextFieldProps = TextFieldProps & {
  hasValue: boolean
  startAdornment?: Displayable
  flattenCorners?: boolean
}
export default function SolidColoredTextField({ hasValue, startAdornment, flattenCorners = false, ...props }: SolidColoredTextFieldProps) {
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
      ...props.InputProps,
      startAdornment,
    }}
    InputLabelProps={{ ...props.InputLabelProps, style: { color: theme.palette.text.primary } }}
    sx={{
      ...props.sx,
      "& .MuiFilledInput-root": { paddingRight: 0, backgroundColor: hasValue ? theme.palette.success.main : theme.palette.primary.main, borderRadius: flattenCorners ? 0 : undefined },
      "& .MuiFilledInput-root:before": { border: "none" },
      "& .MuiFilledInput-root:after": { border: "none" },
      "& .MuiFilledInput-root.Mui-focused": { paddingRight: 0, backgroundColor: hasValue ? theme.palette.success.main : theme.palette.primary.main, borderRadius: flattenCorners ? 0 : undefined },
      "& .MuiFilledInput-root:hover": { backgroundColor: hasValue ? theme.palette.success.dark : theme.palette.primary.dark },
      "& .MuiFilledInput-root:hover:not(.Mui-disabled):before": { border: "none" },
    }}
  />
}
