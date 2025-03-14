import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SerpentSpine'
const [, trm] = trans('weapon', key)

const all_dmg_s = [-1, 0.06, 0.07, 0.08, 0.09, 0.1]
const takeDMG_s = [-1, 3, 2.7, 2.4, 2.2, 2]

const [condPassivePath, condPassive] = cond(key, 'Wavesplitter')
const all_dmg_ = subscript(input.weapon.refinement, all_dmg_s, { unit: '%' })
const all_dmg_stack = lookup(
  condPassive,
  {
    ...objKeyMap(range(1, 5), (i) => prod(all_dmg_, i)),
  },
  naught,
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    all_dmg_: all_dmg_stack,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('activeCharField'),
      states: {
        ...objKeyMap(range(1, 5), (i) => ({
          name: st('seconds', { count: i * 4 }),
          fields: [
            {
              node: all_dmg_stack,
            },
            {
              text: trm('takeMoreDmg'),
              value: (data) =>
                takeDMG_s[data.get(input.weapon.refinement).value] * i,
              unit: '%',
            },
          ],
        })),
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
