import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import {
  compareEq,
  constant,
  infoMut,
  input,
  lookup,
  prod,
  subscript,
  target,
} from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'CalamityQueller'

const [, trm] = trans('weapon', key)

const [condStackPath, condStack] = cond(key, 'stack')

const dmg_ = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = [-1, 0.032, 0.04, 0.048, 0.056, 0.064]

const dmg_Nodes = Object.fromEntries(
  allElementKeys.map((e) => [
    `${e}_dmg_`,
    subscript(input.weapon.refinement, dmg_),
  ]),
)
const atkInc = prod(
  compareEq(
    target.charKey,
    input.activeCharKey,
    infoMut(constant(1), { name: trm('active') }),
    infoMut(constant(2), { name: trm('inactive') }),
  ),
  lookup(
    condStack,
    objKeyMap(range(1, 6), (i) => infoMut(constant(i), { name: st('stacks') })),
    0,
  ),
  subscript(input.weapon.refinement, atk_),
)

export const data = dataObjForWeaponSheet(key, {
  premod: {
    ...dmg_Nodes,
    atk_: atkInc,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: Object.values(dmg_Nodes).map((node) => ({ node })),
    },
    {
      value: condStack,
      path: condStackPath,
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      name: trm('effectName'),
      states: Object.fromEntries(
        range(1, 6).map((i) => [
          i,
          {
            name: st('stack', { count: i }),
            fields: [
              {
                node: atkInc,
              },
            ],
          },
        ]),
      ),
    },
  ],
}
export default new WeaponSheet(sheet, data)
