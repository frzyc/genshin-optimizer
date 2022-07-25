import { styled } from "@mui/material";

const SqBadge = styled("span", {
  name: 'SqBadge',
  slot: 'Root',
})(({ theme, color = "primary" }) => ({
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
