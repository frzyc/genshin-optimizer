import type { Color } from '@genshin-optimizer/common/img-util'

export const misreadCharactersInSubstatMap = [
  {
    pattern: /#/,
    replacement: '+',
  },
]

export const blackColor: Color = {
  r: 0,
  g: 0,
  b: 0,
}

export const greyBorderColor: Color = {
  r: 55,
  g: 55,
  b: 55,
}
