import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'BladeOfAtonement'

const eleMasArr = [-1, 64, 80, 96, 112, 128]
const atk_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const [condReactPath, condReact] = cond(key, 'react')
const [condStellarPath, condStellar] = cond(key, 'stellar')
const react_eleMas = equal(
  'on',
  condReact,
  subscript(input.weapon.refinement, eleMasArr)
)
const stellar_atk_ = equal(
  'on',
  condReact,
  subscript(input.weapon.refinement, atk_arr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas: react_eleMas,
    atk_: stellar_atk_,
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
              node: react_eleMas,
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
            {
              node: stellar_atk_,
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
  ],
}
export default new WeaponSheet(sheet, data)
