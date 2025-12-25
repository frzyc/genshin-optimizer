import type { Palette, PaletteColor } from '@mui/material'
import { styled } from '@mui/material'
import type { HTMLAttributes } from 'react'

interface ColorTextProps extends HTMLAttributes<HTMLSpanElement> {
  color?: keyof Palette
  variant?: keyof PaletteColor
}

export const ColorText = styled('span')<ColorTextProps>(
  ({ theme, color, variant = 'main' }) => {
    if (!color) return {}
    const pc = theme.palette[color] as PaletteColor
    if (!pc) return { color: color }
    const pcv = pc[variant]
    if (!pcv) return {}
    return { color: pcv }
  }
)
