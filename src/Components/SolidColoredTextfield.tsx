import { TextField, TextFieldProps, useTheme } from "@mui/material";

type SolidColoredTextFieldProps = TextFieldProps & {
  hasValue: boolean
  startAdornment?: Displayable
}
export default function SolidColoredTextField({ hasValue, startAdornment, ...props }: SolidColoredTextFieldProps) {
  const theme = useTheme()
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
    InputLabelProps={{ style: { color: theme.palette.text.primary } }}
    sx={{
      "& .MuiFilledInput-root": { paddingRight: 0, backgroundColor: hasValue ? theme.palette.success.main : theme.palette.primary.main },
      "& .MuiFilledInput-root.Mui-focused": { paddingRight: 0, backgroundColor: hasValue ? theme.palette.success.main : theme.palette.primary.main },
      "& .MuiFilledInput-root:hover": { backgroundColor: hasValue ? theme.palette.success.dark : theme.palette.primary.dark }
    }}
  />
}
