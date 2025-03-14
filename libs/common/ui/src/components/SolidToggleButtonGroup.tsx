import type {
  Palette,
  PaletteColor,
  ToggleButtonGroupProps,
} from '@mui/material'
import { ToggleButtonGroup, styled } from '@mui/material'

export type SolidToggleButtonGroupProps = SolidToggleButtonGroupPropsPartial &
  ToggleButtonGroupProps
type SolidToggleButtonGroupPropsPartial = {
  baseColor?: keyof Palette
  selectedColor?: keyof Palette
}

export const SolidToggleButtonGroup = styled(ToggleButtonGroup, {
  shouldForwardProp: (prop) => prop !== 'baseColor' && prop !== 'selectedColor',
})<SolidToggleButtonGroupPropsPartial>(({
  theme,
  baseColor = 'secondary',
  selectedColor = 'success',
}) => {
  const basePalette = theme.palette[baseColor] as PaletteColor
  const selectedPalette = theme.palette[selectedColor] as PaletteColor
  return {
    '& .MuiToggleButtonGroup-grouped': {
      '&': {
        backgroundColor: basePalette.main,
        color: basePalette.contrastText,
      },
      '&:hover': {
        backgroundColor: basePalette.dark,
        transition: 'background-color 0.25s ease',
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
    },
  }
})
