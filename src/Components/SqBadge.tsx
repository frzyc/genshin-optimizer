import { ButtonProps, styled } from "@mui/material";
import { HTMLAttributes } from "react";

interface ColorTextProps extends HTMLAttributes<HTMLSpanElement> {
  color?: ButtonProps['color'],
}

const SqBadge = styled("span", {
  name: 'SqBadge',
  slot: 'Root',
})<ColorTextProps>(({ theme, color = "primary" }) => ({
  display: "inline-block",
  padding: ".25em .4em",
  lineHeight: 1,
  textAlign: "center",
  whiteSpace: "nowrap",
  verticalAlign: "baseline",
  borderRadius: ".25em",
  backgroundColor: theme.palette[color]?.main,
  color: theme.palette[color]?.contrastText
}))
export default SqBadge
