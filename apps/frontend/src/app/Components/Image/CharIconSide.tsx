import { styled } from "@mui/material"
interface ImgIconProps {
  size?: number;
}
const CharIconSide = styled("img", {
  name: 'ImgIcon',
  slot: 'Root',
})<ImgIconProps>(({ size = 2 }) => ({
  display: "inline-block",
  width: `${size}em`,
  height: `${size}em`,
  marginLeft: `${0.5 * (1 - size)}em`,
  marginRight: `${0.5 * (1 - size)}em`,
  marginTop: `${0.85 * (1 - size)}em`,
  marginBottom: `${0.15 * (1 - size)}em`,
  verticalAlign: "text-bottom"
}))

export default CharIconSide
