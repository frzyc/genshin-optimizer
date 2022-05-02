import { useMediaQuery, useTheme } from "@mui/material";

export default function useMediaQueryUp() {
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.up('sm'));
  const md = useMediaQuery(theme.breakpoints.up('md'));
  const lg = useMediaQuery(theme.breakpoints.up('lg'));
  const xl = useMediaQuery(theme.breakpoints.up('xl'));
  if (xl) return "xl"
  if (lg) return "lg"
  if (md) return "md"
  if (sm) return "sm"
  return "xs"
}
