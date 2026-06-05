import { colorToRgbaString, hexToColor } from '@genshin-optimizer/common/util'
import type { ElementKey } from '@genshin-optimizer/gi/consts'
import type { Theme } from '@mui/material'

export function elementHeaderGradientSx(elementKey: ElementKey) {
  return (theme: Theme) => {
    const hex = theme.palette[elementKey].main as string
    const color = hexToColor(hex)
    const contentColor = hexToColor(theme.palette.contentLight.main as string)
    if (!color || !contentColor) return {}
    const eleRgba = colorToRgbaString(color, 0.45)
    const backRgba = colorToRgbaString(contentColor, 0.5)
    const borderRgba = colorToRgbaString(color, 0.55)
    return {
      background: `linear-gradient(to right, ${backRgba} 0%, ${eleRgba} 100%)`,
      borderBottom: `2px solid ${borderRgba}`,
    }
  }
}

export function teamSlotGradientSx(
  elements: Array<ElementKey | undefined>,
  selectedIndex: number
) {
  return (theme: Theme) => {
    const backrgba = colorToRgbaString(
      hexToColor(theme.palette.contentLight.main as string)!,
      0.5
    )!
    const rgbas = [
      backrgba,
      ...elements.map((ele, i) => {
        if (!ele) return 'rgba(0,0,0,0)'
        const hex = theme.palette[ele].main as string
        const color = hexToColor(hex)
        if (!color) return 'rgba(0,0,0,0)'
        return colorToRgbaString(color, selectedIndex === i ? 0.5 : 0.15)
      }),
    ]
    const selectedEle = elements[selectedIndex]
    const selectedRgb =
      selectedEle && hexToColor(theme.palette[selectedEle].main as string)
    const borderRgba =
      (selectedRgb && colorToRgbaString(selectedRgb, 0.45)) ??
      'rgba(200,200,200,0.45)'
    return {
      background: `linear-gradient(to right, ${rgbas
        .map(
          (rgba, i, arr) =>
            `${rgba} ${i * (100 / arr.length) + 50 / arr.length}%`
        )
        .join(', ')})`,
      borderBottom: `2px solid ${borderRgba}`,
    }
  }
}

export function chromeJoinedButtonSx(index: number, total: number) {
  return {
    flex: '1 1 0',
    minWidth: 0,
    borderRadius: 0,
    py: 1.25,
    px: 1.5,
    textTransform: 'none' as const,
    justifyContent: 'flex-start',
    borderTop: 0,
    borderLeft: 0,
    ...(index > 0 && { marginLeft: '-1px' }),
    ...(index === total - 1 && { borderRight: 0 }),
    ...(index > 0 && index < total - 1 && { borderRight: 0 }),
  }
}
