import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'Cloudforged'
const [, trm] = trans('weapon', key)

const eleMas_arr = [-1, 40, 50, 60, 70, 80]
const energyStacksArr = range(1, 2)
const [condEnergyStacksPath, condEnergyStacks] = cond(key, 'energyStacks')
const eleMas = lookup(
  condEnergyStacks,
  objKeyMap(energyStacksArr, (stack) =>
    prod(subscript(input.weapon.refinement, eleMas_arr), stack),
  ),
  naught,
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('stacks')),
      path: condEnergyStacksPath,
      value: condEnergyStacks,
      name: trm('cond'),
      states: objKeyMap(energyStacksArr, (stack) => ({
        name: st('times', { count: stack }),
        fields: [
          {
            node: eleMas,
          },
          {
            text: stg('duration'),
            value: 10,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
