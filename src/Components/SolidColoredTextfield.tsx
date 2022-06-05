import { TextField, TextFieldProps, useTheme } from "@mui/material";

type SolidColoredTextFieldProps = Omit<TextFieldProps, "multiline" | "variant" | "color" | "hiddenLabel" | "type" | "InputLabelProps"> & {
  hasValue: boolean
  startAdornment?: Displayable
  flattenCorners?: boolean
}
export default function SolidColoredTextField({ hasValue, startAdornment, flattenCorners = false, InputProps, sx, ...props }: SolidColoredTextFieldProps) {
  const theme = useTheme()
  return <TextField
    {...props}
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
      // Remove the x at the end of search input for IE
      "& input[type=search]::-ms-clear": { display: "none", width: 0, height: 0 },
      "& input[type=search]::-ms-reveal": { display: "none", width: 0, height: 0 },

      // Remove the x at the end of search input for Chrome
      "& input[type=search]::-webkit-search-decoration": { display: "none" },
      "& input[type=search]::-webkit-search-cancel-button": { display: "none" },
      "& input[type=search]::-webkit-search-results-button": { display: "none" },
      "& input[type=search]::-webkit-search-results-decoration": { display: "none" },
    }}
  />
}
