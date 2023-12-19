import { allElementKeys, type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap } from '@genshin-optimizer/util'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TalkingStick'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const atk_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const all_ele_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const [condAffectedPyroPath, condAffectedPyro] = cond(key, 'affectedPyro')
const atk_ = equal(
  condAffectedPyro,
  'on',
  subscript(input.weapon.refinement, atk_arr)
)

const [condAffectedOtherPath, condAffectedOther] = cond(key, 'affectedOther')
const all_ele_dmg_ = equal(
  condAffectedOther,
  'on',
  subscript(input.weapon.refinement, all_ele_dmg_arr)
)
const all_ele_dmg_map = objKeyMap(
  allElementKeys.map((ele) => `${ele}_dmg_`),
  () => ({ ...all_ele_dmg_ })
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    ...all_ele_dmg_map,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condAffectedPyro,
      path: condAffectedPyroPath,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName.atk_'),
      states: {
        on: {
          fields: [
            {
              node: atk_,
            },
            {
              text: stg('duration'),
              value: 15,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      value: condAffectedOther,
      path: condAffectedOtherPath,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName.dmg_'),
      states: {
        on: {
          fields: [
            ...Object.values(all_ele_dmg_map).map((node) => ({ node })),
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
