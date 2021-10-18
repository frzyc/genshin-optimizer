import { styled } from "@mui/material";


const ColorText = styled("span")(({ theme, color }) => {
  if (color && theme.palette[color])
    return { color: theme.palette[color].main }
  return {}
})

export default ColorText