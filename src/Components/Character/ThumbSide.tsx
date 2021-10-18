import { styled } from "@mui/system";

const ThumbSide = styled("img")(({ theme }) => ({
  display: "inline-block",
  width: "auto",
  height: `2.3em`,
  lineHeight: 1,
  verticalAlign: "text-bottom",
  marginTop: theme.spacing(-3),
  marginLeft: theme.spacing(-1.25),
  marginRight: theme.spacing(-1),
  marginBottom: theme.spacing(-1),
}))

export default ThumbSide