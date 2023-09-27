import { type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'BalladOfTheBoundlessBlue'
const data_gen = allStats.weapon.data[key]

const normal_dmg_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const charged_dmg_arr = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]

const [condHitsPath, condHits] = cond(key, 'hits')
const hitsArr = range(1, 3)
const normal_dmg_ = lookup(
  condHits,
  objKeyMap(hitsArr, (symbol) =>
    prod(
      symbol,
      subscript(input.weapon.refinement, normal_dmg_arr, { unit: '%' })
    )
  ),
  naught
)
const charged_dmg_ = lookup(
  condHits,
  objKeyMap(hitsArr, (symbol) =>
    prod(
      symbol,
      subscript(input.weapon.refinement, charged_dmg_arr, { unit: '%' })
    )
  ),
  naught
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_,
    charged_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condHits,
      path: condHitsPath,
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      name: st('hitOp.normalOrCharged'),
      states: objKeyMap(hitsArr, (hit) => ({
        name: st('hits', { count: hit }),
        fields: [
          {
            node: normal_dmg_,
          },
          {
            node: charged_dmg_,
          },
          {
            text: stg('duration'),
            value: 6,
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
