'use client'
import type { Palette, PaletteColor } from '@mui/material'
import type { HTMLAttributes } from 'react'
import { styled } from '@mui/material'

interface ColorTextProps extends HTMLAttributes<HTMLSpanElement> {
  color?: keyof Palette
}

export const SqBadge = styled('span', {
  name: 'SqBadge',
  slot: 'Root',
})<ColorTextProps>(({ theme, color = 'primary' }) => ({
  display: 'inline-block',
  padding: '.25em .4em',
  lineHeight: 1,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  verticalAlign: 'baseline',
  borderRadius: '.25em',
  backgroundColor: (theme.palette[color] as PaletteColor | undefined)?.main,
  color: (theme.palette[color] as PaletteColor | undefined)?.contrastText,
}))
