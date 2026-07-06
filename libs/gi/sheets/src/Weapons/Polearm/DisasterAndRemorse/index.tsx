import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  greaterEq,
  input,
  one,
  percent,
  prod,
  subscript,
  sum,
  tally,
} from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'DisasterAndRemorse'
const [, trm] = trans('weapon', key)

const dmg_ = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]
const [condUnforgivablePath, condUnforgivable] = cond(key, 'unforgivable')
const unforgivable_normal_dmg_ = equal(
  'on',
  condUnforgivable,
  prod(
    sum(one, greaterEq(tally.hexerei, 2, percent(0.75))),
    subscript(input.weapon.refinement, dmg_, { unit: '%' })
  )
)
const unforgivable_charged_dmg_ = { ...unforgivable_normal_dmg_ }

const [condIrreparablePath, condIrreparaable] = cond(key, 'irreparable')
const irreparable_skill_dmg_ = equal(
  condIrreparaable,
  'on',
  prod(
    sum(one, greaterEq(tally.hexerei, 2, percent(0.75))),
    subscript(input.weapon.refinement, dmg_, { unit: '%' })
  )
)
const irreparable_burst_dmg_ = { ...irreparable_skill_dmg_ }

const data = dataObjForWeaponSheet(key, {
  premod: {
    normal_dmg_: unforgivable_normal_dmg_,
    charged_dmg_: unforgivable_charged_dmg_,
    skill_dmg_: irreparable_skill_dmg_,
    burst_dmg_: irreparable_burst_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condUnforgivable,
      path: condUnforgivablePath,
      header: headerTemplate(key, st('conditional')),
      name: trm('unforgivable'),
      states: {
        on: {
          fields: [
            {
              node: unforgivable_normal_dmg_,
            },
            {
              node: unforgivable_charged_dmg_,
            },
          ],
        },
      },
    },
    {
      value: condIrreparaable,
      path: condIrreparablePath,
      header: headerTemplate(key, st('conditional')),
      name: trm('irreparable'),
      states: {
        on: {
          fields: [
            {
              node: irreparable_skill_dmg_,
            },
            {
              node: irreparable_burst_dmg_,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
