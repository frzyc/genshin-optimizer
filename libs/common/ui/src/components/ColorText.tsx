import type { Palette, PaletteColor } from '@mui/material'
import { styled } from '@mui/material'
import type { HTMLAttributes } from 'react'

interface ColorTextProps extends HTMLAttributes<HTMLSpanElement> {
  color?: keyof Palette | string
  variant?: keyof PaletteColor
}

export const ColorText = styled('span')<ColorTextProps>(
  ({ theme, color, variant = 'main' }) => {
    if (!color) return {}
    if (!(color in theme.palette)) return { color: color }
    const pc = theme.palette[color as keyof Palette] as PaletteColor
    const pcv = pc[variant]
    if (!pcv) return {}
    return { color: pcv }
  }
)
