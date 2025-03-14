import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'StaffOfHoma'

const hpInc = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const atkInc = [-1, 0.008, 0.01, 0.012, 0.014, 0.016]
const lowHpAtkInc = [-1, 0.01, 0.012, 0.014, 0.016, 0.018]
const hp_ = subscript(input.weapon.refinement, hpInc, { unit: '%' })
const [condPassivePath, condPassive] = cond(key, 'RecklessCinnabar')
const atk1 = prod(
  subscript(input.weapon.refinement, atkInc, { unit: '%' }),
  input.premod.hp,
)
const atk2 = equal(
  input.weapon.key,
  key,
  equal(
    'on',
    condPassive,
    prod(
      subscript(input.weapon.refinement, lowHpAtkInc, { unit: '%' }),
      input.premod.hp,
    ),
    { path: 'atk' },
  ),
)
const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      hp_,
    },
    total: {
      atk: sum(atk1, atk2),
    },
  },
  {
    atk2_: atk2,
  },
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: hp_,
        },
        {
          node: infoMut(atk1, { path: 'atk' }),
        },
      ],
    },
    {
      value: condPassive,
      path: condPassivePath,
      teamBuff: true,
      header: headerTemplate(key),
      name: st('lessPercentHP', { percent: 50 }),
      states: {
        on: {
          fields: [
            {
              node: infoMut(atk2, { path: 'atk' }),
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
