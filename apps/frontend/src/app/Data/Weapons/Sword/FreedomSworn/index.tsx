import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FreedomSworn'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const [condPassivePath, condPassive] = cond(key, 'MillennialMovement')
const autoSrc = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const atk_Src = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const dmg_arr = data_gen.refinementBonus.dmg_
if (!dmg_arr)
  throw new Error(`data_gen.refinementBonus.dmg_ for ${key} was undefined`)
const dmg_ = subscript(input.weapon.refinement, dmg_arr)
// TODO: These should not stack, similar to NO. But I don't want to copy NO's
// solution, since then these nodes won't show in the team buff panel. And it's
// a bit unlikely people will try to stack this buff
const atk_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, atk_Src)
)
const normal_dmg_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, autoSrc)
)
const charged_dmg_ = { ...normal_dmg_ }
const plunging_dmg_ = { ...normal_dmg_ }

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_: dmg_,
  },
  teamBuff: {
    premod: {
      atk_,
      normal_dmg_,
      charged_dmg_,
      plunging_dmg_,
    },
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: dmg_ }],
    },
    {
      value: condPassive,
      path: condPassivePath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: trm('sigilsConsumed'),
      states: {
        on: {
          fields: [
            {
              node: atk_,
            },
            {
              node: normal_dmg_,
            },
            {
              node: charged_dmg_,
            },
            {
              node: plunging_dmg_,
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
export default new WeaponSheet(key, sheet, data_gen, data)
