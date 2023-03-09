import { styled } from '@mui/material'
interface ImgIconProps {
  size?: number
  sideMargin?: boolean
}
/**
 * An `img` wrapper that automates margin to make sure that the icon is always `1em` tall, no matter what `size` it is.
 */
const ImgIcon = styled('img', {
  name: 'ImgIcon',
  slot: 'Root',
  shouldForwardProp: (pn) =>
    !['size', 'sideMargin'].includes(pn as 'size' | 'sideMargin'),
})<ImgIconProps>(({ size = 1, sideMargin = false }) => ({
  display: 'inline-block',
  width: `${size}em`,
  height: `${size}em`,
  marginTop: `${0.5 * (1 - size)}em`,
  marginBottom: `${0.5 * (1 - size)}em`,
  marginLeft: sideMargin ? `${0.5 * (1 - size)}em` : undefined,
  marginRight: sideMargin ? `${0.5 * (1 - size)}em` : undefined,
  verticalAlign: 'text-bottom',
}))

export default ImgIcon
