import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  lookup,
  naught,
  subscript,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'MoonweaversDawn'
const [, trm] = trans('weapon', key)

const burst_dmg_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const highEnergyBurst_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const lowEnergyBurst_dmg_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]

const [condEnergyPath, condEnergy] = cond(key, 'energy')

const burst_dmg_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, burst_dmg_arr, { unit: '%' })
)
const energyBurst_dmg_ = lookup(
  condEnergy,
  {
    '60': subscript(input.weapon.refinement, highEnergyBurst_dmg_arr),
    '40': subscript(input.weapon.refinement, lowEnergyBurst_dmg_arr),
  },
  naught
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    burst_dmg_: sum(burst_dmg_, energyBurst_dmg_),
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(burst_dmg_, { path: 'burst_dmg_' }),
        },
      ],
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condEnergyPath,
      value: condEnergy,
      name: trm('cond'),
      states: {
        '60': {
          name: '60',
          fields: [
            {
              node: infoMut(energyBurst_dmg_, { path: 'burst_dmg_' }),
            },
          ],
        },
        '40': {
          name: '40',
          fields: [
            {
              node: infoMut(energyBurst_dmg_, { path: 'burst_dmg_' }),
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
