import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript, sum } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'StaffOfHoma'
const data_gen = allStats.weapon.data[key]

const hpInc = [0.2, 0.25, 0.3, 0.35, 0.4]
const atkInc = [0.008, 0.01, 0.012, 0.014, 0.016]
const lowHpAtkInc = [0.01, 0.012, 0.014, 0.016, 0.018]
const hp_ = subscript(input.weapon.refineIndex, hpInc, { unit: '%' })
const [condPassivePath, condPassive] = cond(key, 'RecklessCinnabar')
const atk1 = prod(
  subscript(input.weapon.refineIndex, atkInc, { unit: '%' }),
  input.premod.hp
)
const atk2 = equal(
  input.weapon.key,
  key,
  equal(
    'on',
    condPassive,
    prod(
      subscript(input.weapon.refineIndex, lowHpAtkInc, { unit: '%' }),
      input.premod.hp
    ),
    KeyMap.info('atk')
  )
)
const data = dataObjForWeaponSheet(
  key,
  data_gen,
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
  }
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
          node: infoMut(atk1, KeyMap.info('atk')),
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
              node: infoMut(atk2, KeyMap.info('atk')),
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
