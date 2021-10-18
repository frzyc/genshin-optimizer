import { styled } from "@mui/material"
interface ImgIconProps {
  size?: number;
}
const ImgIcon = styled("img", {
  name: 'ImgIcon',
  slot: 'Root',
})<ImgIconProps>(({ size = 1 }) => ({
  display: "inline-block",
  width: "auto",
  height: `${size * 1.2}em`,
  verticalAlign: "text-bottom"
}))

export default ImgIcon