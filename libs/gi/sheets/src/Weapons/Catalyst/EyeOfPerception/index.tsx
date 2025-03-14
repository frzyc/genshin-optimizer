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

const key: WeaponKey = 'EyeOfPerception'

const dmg_Src = [-1, 2.4, 2.7, 3, 3.3, 3.6]
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, dmg_Src, { unit: '%' }),
      input.premod.atk,
    ),
    'elemental',
    {
      hit: { ele: constant('physical') },
    },
  ),
)

const data = dataObjForWeaponSheet(key, undefined, {
  dmg_: dmg,
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: infoMut(dmg, { name: st('dmg') }) }],
    },
  ],
}
export default new WeaponSheet(sheet, data)
