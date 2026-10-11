import { objKeyValMap } from '@genshin-optimizer/common/util'
import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'Emberwell'

const atk_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const stellar_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const [condReactPath, condReact] = cond(key, 'react')
const [condStellarPath, condStellar] = cond(key, 'stellar')
const react_atk_ = equal(
  'on',
  condReact,
  subscript(input.weapon.refinement, atk_arr)
)
const stellar_stellar_dmg_obj = objKeyValMap(allStellarReactionKeys, (k) => [
  `${k}_dmg_`,
  equal('on', condStellar, subscript(input.weapon.refinement, stellar_dmg_arr)),
])

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_: react_atk_,
    ...stellar_stellar_dmg_obj,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condReact,
      path: condReactPath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterReaction'),
      states: {
        on: {
          fields: [
            {
              node: react_atk_,
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      value: condStellar,
      path: condStellarPath,
      header: headerTemplate(key, st('conditional')),
      name: st('elementalReaction.stellarglimmer'),
      states: {
        on: {
          fields: [
            ...Object.values(stellar_stellar_dmg_obj).map((node) => ({ node })),
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
