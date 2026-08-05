import {
  crystallizeLevelMultipliers,
  transformativeReactionLevelMultipliers,
} from '@genshin-optimizer/gi/keymap'
import { input } from '../formula'
import { info } from '../info'
import { frac, infoMut, one, prod, subscript, sum } from '../utils'

export const crystallizeMulti1 = subscript(
  input.lvl,
  crystallizeLevelMultipliers,
  info('crystallize_level_multi_')
)
export const crystallizeElemas = prod(40 / 9, frac(input.total.eleMas, 1400))
export const crystallizeHit = infoMut(
  prod(
    infoMut(sum(one, /** + Crystallize bonus */ crystallizeElemas), {
      pivot: true,
      ...info('base_crystallize_multi_'),
    }),
    crystallizeMulti1
  ),
  info('crystallize')
)

export const transMulti1 = subscript(
  input.lvl,
  transformativeReactionLevelMultipliers,
  info('transformative_level_multi')
)
export const transMulti2 = prod(16, frac(input.total.eleMas, 2000))
