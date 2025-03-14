import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  input,
  min,
  percent,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'EngulfingLightning'

const atk = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]
const atkMax = [-1, 0.8, 0.9, 1, 1.1, 1.2]
const atk_ = equal(
  input.weapon.key,
  key,
  min(
    prod(
      subscript(input.weapon.refinement, atk),
      sum(input.premod.enerRech_, percent(-1)),
    ),
    subscript(input.weapon.refinement, atkMax),
  ),
  { pivot: true },
)

const enerRech = [-1, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55]
const [condPassivePath, condPassive] = cond(key, 'TimelessDream')
const enerRech_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, enerRech),
)

export const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      atk_,
      enerRech_,
    },
  },
  {
    atk_,
  },
)
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
      teamBuff: true,
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterUse.burst'),
      states: {
        on: {
          fields: [
            {
              node: enerRech_,
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
export default new WeaponSheet(sheet, data)
