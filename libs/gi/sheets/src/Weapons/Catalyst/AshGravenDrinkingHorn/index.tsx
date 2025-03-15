import { type WeaponKey } from '@genshin-optimizer/gi/consts'
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

const key: WeaponKey = 'AshGravenDrinkingHorn'

const dmgArr = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, dmgArr, { unit: '%' }),
      input.total.hp,
    ),
    'elemental',
    { hit: { ele: constant('physical') } },
  ),
)

const data = dataObjForWeaponSheet(key, undefined, {
  dmg,
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('dmg')),
      fields: [
        {
          node: infoMut(dmg, { name: st('dmg') }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
