import { styled } from "@mui/material"
interface ImgIconProps {
  size?: number;
  sideMargin?: boolean;
}
const CharIconSide = styled("img", {
  name: 'ImgIcon',
  slot: 'Root',
  shouldForwardProp: (pn) => !["size", "sideMargin"].includes(pn as "size" | "sideMargin")
})<ImgIconProps>(({ size = 2, sideMargin = false }) => ({
  display: "inline-block",
  width: `${size}em`,
  height: `${size}em`,
  marginTop: `${0.85 * (1 - size)}em`,
  marginBottom: `${0.15 * (1 - size)}em`,
  marginLeft: sideMargin ? undefined : `${0.3 * (1 - size)}em`,
  marginRight: sideMargin ? undefined : `${0.3 * (1 - size)}em`,
  verticalAlign: "text-bottom"
}))

export default CharIconSide
