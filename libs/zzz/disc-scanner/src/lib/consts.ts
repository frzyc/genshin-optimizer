import type { Color } from '@genshin-optimizer/common-img-util'

export const misreadCharactersInSubstatMap = [
  {
    pattern: /#/,
    replacement: '+',
  },
]

export const greyBorderColor: Color = {
  r: 55,
  g: 55,
  b: 55,
}

/** Dark fill inside the disc detail card (outside is mesh / chrome). */
export const cardFillColor: Color = {
  r: 18,
  g: 18,
  b: 20,
}
