import { ButtonProps, ToggleButton, ToggleButtonProps, styled } from "@mui/material";

type SolidColoredToggleButtonPartial = {
  baseColor?: ButtonProps["color"];
  selectedColor?: ButtonProps["color"];
}
export type SolidColoredToggleButtonProps = SolidColoredToggleButtonPartial & ToggleButtonProps


const SolidColoredToggleButton = styled(ToggleButton, {
  shouldForwardProp: (prop) => prop !== "baseColor" && prop !== "selectedColor"
})<SolidColoredToggleButtonPartial>(({ theme, baseColor = "secondary", selectedColor = "success" }) => ({
  '&': {
    backgroundColor: theme.palette[baseColor].main,
    color: theme.palette[baseColor].contrastText,
  },
  '&:hover': {
    backgroundColor: theme.palette[baseColor].dark,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette[selectedColor].main,
    color: theme.palette[selectedColor].contrastText,
  },
  '&.Mui-selected:hover': {
    backgroundColor: theme.palette[selectedColor].dark,
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette[baseColor].dark,
  },
  '&.Mui-selected.Mui-disabled': {
    backgroundColor: theme.palette[selectedColor].dark,
  },
}));

export default SolidColoredToggleButton
