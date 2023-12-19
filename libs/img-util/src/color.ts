import { clamp, within } from '@genshin-optimizer/util'

export type Color = {
  r: number
  g: number
  b: number
  a?: number | undefined
}

export function lighterColor(color: Color, value = 10) {
  return modColor(color, value)
}

export function darkerColor(color: Color, value = 10) {
  return modColor(color, -value)
}
export function modColor(color: Color, value = 10) {
  const { r, g, b, a } = color
  return {
    r: clamp(r + value, 0, 255),
    g: clamp(g + value, 0, 255),
    b: clamp(b + value, 0, 255),
    a,
  }
}

export function colorWithin(color: Color, colorDark: Color, colorLight: Color) {
  return (
    within(color.r, colorDark.r, colorLight.r) &&
    within(color.g, colorDark.g, colorLight.g) &&
    within(color.b, colorDark.b, colorLight.b)
  )
}
