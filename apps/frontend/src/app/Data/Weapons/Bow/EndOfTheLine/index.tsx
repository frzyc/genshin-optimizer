import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  infoMut,
  input,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'EndOfTheLine'
const data_gen = allStats.weapon.data[key]

const dmgArr = [-1, 0.8, 1, 1.2, 1.4, 1.6]
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, dmgArr, { unit: '%' }),
      input.total.atk
    ),
    'elemental'
  )
)

const data = dataObjForWeaponSheet(key, data_gen, undefined, { dmg })

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(dmg, { name: st('dmg') }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
