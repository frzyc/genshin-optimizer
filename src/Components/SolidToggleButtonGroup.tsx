import { ButtonProps, styled, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";

export type SolidToggleButtonGroupProps = SolidToggleButtonGroupPropsPartial & ToggleButtonGroupProps
type SolidToggleButtonGroupPropsPartial = {
  baseColor?: ButtonProps["color"];
  selectedColor?: ButtonProps["color"];
}

const SolidToggleButtonGroup = styled(ToggleButtonGroup, {
  shouldForwardProp: (prop) => prop !== "baseColor"
})<SolidToggleButtonGroupPropsPartial>(({ theme, baseColor = "primary", selectedColor = "success" }) => ({
  '& .MuiToggleButtonGroup-grouped': {
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
  },
}));

export default SolidToggleButtonGroup