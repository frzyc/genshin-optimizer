import { objKeyMap, objKeyValMap, range } from '@genshin-optimizer/common/util'
import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import {
  compareEq,
  constant,
  equal,
  input,
  lookup,
  prod,
  subscript,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'NewBough'
const [, trm] = trans('weapon', key)

const [condPassivePath, condPassive] = cond(key, 'passive')
const stacksArr = range(1, 3)
const atk_arr = [-1, 0.04, 0.05, 0.06, 0.07, 0.08]
const eleMasArr = [-1, 20, 25, 30, 35, 40]
const stellarAtk_arr = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]
const stellar_dmg_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const stacks = lookup(
  condPassive,
  objKeyMap(stacksArr, (i) => constant(i)),
  0
)
const atk_ = prod(
  stacks,
  compareEq(
    input.flags.radiance,
    undefined,
    subscript(input.weapon.refinement, atk_arr, { unit: '%' }),
    subscript(input.weapon.refinement, stellarAtk_arr, { unit: '%' })
  )
)
const eleMas = equal(
  input.flags.radiance,
  undefined,
  prod(stacks, subscript(input.weapon.refinement, eleMasArr))
)
const stellar_dmg_obj = objKeyValMap(allStellarReactionKeys, (k) => [
  `${k}_dmg_`,
  unequal(
    input.flags.radiance,
    undefined,
    prod(stacks, subscript(input.weapon.refinement, stellar_dmg_arr))
  ),
])

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_: atk_,
    eleMas,
    ...stellar_dmg_obj,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: trm('stacksCond'),
      states: objKeyMap(stacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: atk_,
          },
          {
            node: eleMas,
          },
          ...Object.values(stellar_dmg_obj).map((node) => ({ node })),
          {
            text: stg('duration'),
            value: 6,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
