import { type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, range } from '@genshin-optimizer/util'
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

const key: WeaponKey = 'TomeOfTheEternalFlow'
const data_gen = allStats.weapon.data[key]

const hp_arr = data_gen.refinementBonus.hp_
const charged_dmg_arr = [-1, 0.14, 0.18, 0.22, 0.26, 0.3]

const hp_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, hp_arr)
)

const [condHpChangesPath, condHpChanges] = cond(key, 'hpChanges')
const hpChangesArr = range(1, 3)
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

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    hp_,
    charged_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: hp_,
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
            node: charged_dmg_,
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
