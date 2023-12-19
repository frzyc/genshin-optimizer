import { Box } from '@mui/material'
import type { StaticImageData } from 'next/image'
import Image from 'next/image'

export function ImageIcon({
  src,
  alt = 'icon',
  size = 1,
  sideMargin = false,
}: {
  src: StaticImageData
  alt?: string
  size?: number
  sideMargin?: boolean
}) {
  return (
    <Box
      sx={{
        display: 'inline-block',
        position: 'relative',
        width: `${size}em`,
        height: `${size}em`,
        marginTop: `${0.5 * (1 - size)}em`,
        marginBottom: `${0.5 * (1 - size)}em`,
        marginLeft: sideMargin ? `${0.5 * (1 - size)}em` : undefined,
        marginRight: sideMargin ? `${0.5 * (1 - size)}em` : undefined,
        verticalAlign: 'text-bottom',
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        style={{
          objectFit: 'contain',
        }}
      />
    </Box>
  )
}
