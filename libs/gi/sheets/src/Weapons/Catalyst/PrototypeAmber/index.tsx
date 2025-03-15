import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { customHealNode } from '../../../Characters/dataUtil'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'PrototypeAmber'

const [condPassivePath, condPassive] = cond(key, 'Gliding')
const healPerc = [-1, 0.04, 0.045, 0.05, 0.055, 0.06]

const heal = equal(
  input.weapon.key,
  key,
  customHealNode(
    prod(
      subscript(input.weapon.refinement, healPerc, { unit: '%' }),
      input.total.hp,
    ),
  ),
)
export const data = dataObjForWeaponSheet(key, undefined, { heal })
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      name: st('afterUse.burst'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            { node: infoMut(heal, { name: stg('healing'), variant: 'heal' }) },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
