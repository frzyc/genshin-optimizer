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
