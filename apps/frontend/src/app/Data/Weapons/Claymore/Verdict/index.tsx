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
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'Verdict'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const atk_arr = data_gen.refinementBonus.atk_
const skill_dmg_arr = [-1, 0.18, 0.225, 0.27, 0.315, 0.36]

const atk_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, atk_arr)
)

const [condSealsPath, condSeals] = cond(key, 'seals')
const sealsArr = range(1, 2)
const skill_dmg_ = lookup(
  condSeals,
  objKeyMap(sealsArr, (stack) =>
    prod(
      stack,
      subscript(input.weapon.refinement, skill_dmg_arr, { unit: '%' })
    )
  ),
  naught
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    skill_dmg_,
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
      value: condSeals,
      path: condSealsPath,
      header: headerTemplate(key, st('stacks')),
      name: trm('condName'),
      states: objKeyMap(sealsArr, (seals) => ({
        name: `${seals}`,
        fields: [
          {
            node: skill_dmg_,
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
