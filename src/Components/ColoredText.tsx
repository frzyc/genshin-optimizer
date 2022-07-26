import { styled } from "@mui/material";
import { HTMLAttributes } from "react";

interface ColorTextProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string,
  variant?: string,
}

const ColorText = styled("span")<ColorTextProps>(({ theme, color, variant = "main" }) => {
  if (color && theme.palette[color])
    return { color: theme.palette[color][variant] }
  return {}
})

export default ColorText
