import { input } from '../../../../Formula'
import {
  constant,
  equal,
  infoMut,
  prod,
  subscript,
} from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'TheViridescentHunt'
const data_gen = allStats.weapon.data[key]

const dmgPerc_s = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(subscript(input.weapon.refinement, dmgPerc_s), input.total.atk),
    'elemental',
    { hit: { ele: constant('physical') } }
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
