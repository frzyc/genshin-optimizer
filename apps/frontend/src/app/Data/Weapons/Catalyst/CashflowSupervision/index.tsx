import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import {
  equal,
  lookup,
  naught,
  prod,
  subscript,
} from '../../../../Formula/utils'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'CashflowSupervision'
const data_gen = allStats.weapon.data[key]

const atk_arr = data_gen.refinementBonus.atk_
const normal_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const charged_dmg_arr = [-1, 0.14, 0.175, 0.21, 0.245, 0.28]
const atkSPD_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const atk_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, atk_arr)
)

const [condHpChangesPath, condHpChanges] = cond(key, 'hpChanges')
const hpChangesArr = range(1, 3)
const normal_dmg_ = lookup(
  condHpChanges,
  objKeyMap(hpChangesArr, (symbol) =>
    prod(
      symbol,
      subscript(input.weapon.refinement, normal_dmg_arr, { unit: '%' })
    )
  ),
  naught
)
const charged_dmg_ = lookup(
  condHpChanges,
  objKeyMap(hpChangesArr, (symbol) =>
    prod(
      symbol,
      subscript(input.weapon.refinement, charged_dmg_arr, { unit: '%' })
    )
  ),
  naught
)
const atkSPD_ = equal(
  condHpChanges,
  '3',
  subscript(input.weapon.refinement, atkSPD_arr)
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    normal_dmg_,
    charged_dmg_,
    atkSPD_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: atk_,
        },
      ],
    },
    {
      value: condHpChanges,
      path: condHpChangesPath,
      header: headerTemplate(key, st('stacks')),
      name: st('hpChange'),
      states: objKeyMap(hpChangesArr, (changes) => ({
        name: st('times', { count: changes }),
        fields: [
          {
            node: normal_dmg_,
          },
          {
            node: charged_dmg_,
          },
          {
            node: atkSPD_,
          },
          {
            text: stg('duration'),
            value: 4,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: 0.3,
            fixed: 1,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
