import { allElementKeys, type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'ProspectorsDrill'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const atk_arr = [-1, 0.03, 0.04, 0.05, 0.06, 0.07]
const all_ele_dmg_arr = [-1, 0.07, 0.085, 0.1, 0.115, 0.13]

const [condSymbolsConsumedPath, condMarksConsumed] = cond(key, 'marksConsumed')
const marksConsumedArr = range(1, 3)
const atk_ = lookup(
  condMarksConsumed,
  objKeyMap(marksConsumedArr, (symbol) =>
    prod(symbol, subscript(input.weapon.refinement, atk_arr, { unit: '%' }))
  ),
  naught
)
const ele_dmg_ = lookup(
  condMarksConsumed,
  objKeyMap(marksConsumedArr, (symbol) =>
    prod(
      symbol,
      subscript(input.weapon.refinement, all_ele_dmg_arr, { unit: '%' })
    )
  ),
  naught
)
const all_ele_dmg_ = objKeyMap(
  allElementKeys.map((ele) => `${ele}_dmg_`),
  () => ({ ...ele_dmg_ })
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    ...all_ele_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condMarksConsumed,
      path: condSymbolsConsumedPath,
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      name: trm('condName'),
      states: objKeyMap(marksConsumedArr, (mark) => ({
        name: `${mark}`,
        fields: [
          {
            node: atk_,
          },
          ...Object.values(all_ele_dmg_).map((node) => ({ node })),
          {
            text: stg('duration'),
            value: 10,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: 15,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
