import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../../Formula'
import {
  constant,
  equal,
  infoMut,
  prod,
  subscript,
} from '../../../../Formula/utils'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SwordOfNarzissenkreuz'
const data_gen = allStats.weapon.data[key]

const dmg_arr = [-1, 1.6, 2, 2.4, 2.8, 3.2]
// TODO: Don't show dmg value when wielder has an Arkhe
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, dmg_arr, { unit: '%' }),
      input.total.atk
    ),
    'elemental',
    {
      hit: { ele: constant('physical') },
    }
  )
)

const data = dataObjForWeaponSheet(key, data_gen, undefined, {
  dmg,
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('dmg')),
      fields: [{ node: infoMut(dmg, { name: st('dmg') }) }],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
