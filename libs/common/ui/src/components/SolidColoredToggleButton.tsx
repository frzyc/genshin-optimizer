import type { Palette, PaletteColor, ToggleButtonProps } from '@mui/material'
import { ToggleButton, styled } from '@mui/material'

type SolidColoredToggleButtonPartial = {
  baseColor?: keyof Palette
  selectedColor?: keyof Palette
}
export type SolidColoredToggleButtonProps = SolidColoredToggleButtonPartial &
  ToggleButtonProps

export const SolidColoredToggleButton = styled(ToggleButton, {
  shouldForwardProp: (prop) => prop !== 'baseColor' && prop !== 'selectedColor',
})<SolidColoredToggleButtonPartial>(({
  theme,
  baseColor = 'secondary',
  selectedColor = 'success',
}) => {
  const basePalette = theme.palette[baseColor] as PaletteColor
  const selectedPalette = theme.palette[selectedColor] as PaletteColor
  return {
    '&': {
      backgroundColor: basePalette.main,
      color: basePalette.contrastText,
    },
    '&:hover': {
      backgroundColor: basePalette.dark,
    },
    '&.Mui-selected': {
      backgroundColor: selectedPalette.main,
      color: selectedPalette.contrastText,
    },
    '&.Mui-selected:hover': {
      backgroundColor: selectedPalette.dark,
    },
    '&.Mui-disabled': {
      backgroundColor: basePalette.dark,
    },
    '&.Mui-selected.Mui-disabled': {
      backgroundColor: selectedPalette.dark,
    },
  }
})
