import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript, sum } from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'VividNotions'
const [, trm] = trans('weapon', key)

const atk_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]
const atk_ = subscript(input.weapon.refinement, atk_arr)

const [condDawnPath, condDawn] = cond(key, 'dawn')
const dawn_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]
const dawn_plunging_critDMG_ = equal(
  condDawn,
  'on',
  subscript(input.weapon.refinement, dawn_arr),
  { path: 'plunging_critDMG_' }
)

const [condTwilightPath, condTwilight] = cond(key, 'twilight')
const twilight_arr = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]
const twilight_plunging_critDMG_ = equal(
  condTwilight,
  'on',
  subscript(input.weapon.refinement, twilight_arr),
  { path: 'plunging_critDMG_' }
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_,
    plunging_critDMG_: sum(dawn_plunging_critDMG_, twilight_plunging_critDMG_),
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
      header: headerTemplate(key, st('conditional')),
      path: condDawnPath,
      value: condDawn,
      name: trm('dawn'),
      states: {
        on: {
          fields: [
            {
              node: dawn_plunging_critDMG_,
            },
            {
              text: stg('duration'),
              value: 15,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condTwilightPath,
      value: condTwilight,
      name: trm('twilight'),
      states: {
        on: {
          fields: [
            {
              node: twilight_plunging_critDMG_,
            },
            {
              text: stg('duration'),
              value: 15,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
