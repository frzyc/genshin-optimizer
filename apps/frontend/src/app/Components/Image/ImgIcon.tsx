import { styled } from "@mui/material"
interface ImgIconProps {
  size?: number;
}
/**
 * An `img` wrapper that automates margin to make sure that the icon is always `1em`, no matter what `size` it is.
 */
const ImgIcon = styled("img", {
  name: 'ImgIcon',
  slot: 'Root',
})<ImgIconProps>(({ size = 1 }) => ({
  display: "inline-block",
  width: `${size}em`,
  height: `${size}em`,
  margin: `${0.5 * (1 - size)}em`,
  verticalAlign: "text-bottom"
}))

export default ImgIcon
