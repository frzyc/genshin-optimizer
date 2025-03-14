import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  constant,
  equal,
  infoMut,
  input,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'CrescentPike'

const atkInc = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const hit = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      input.total.atk,
      subscript(input.weapon.refinement, atkInc, { unit: '%' }),
    ),
    'elemental',
    {
      hit: { ele: constant('physical') },
    },
  ),
)
const data = dataObjForWeaponSheet(key, undefined, { hit })

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('talents.passive')),
      fields: [
        {
          node: infoMut(hit, { name: st('dmg') }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
