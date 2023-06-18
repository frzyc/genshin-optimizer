import { input } from '../../../../Formula'
import { constant, infoMut, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'DebateClub'
const data_gen = allStats.weapon.data[key]

const dmgPerc = [0.6, 0.75, 0.9, 1.05, 1.2]
const dmg = customDmgNode(
  prod(
    subscript(input.weapon.refineIndex, dmgPerc, { unit: '%' }),
    input.total.atk
  ),
  'elemental',
  {
    hit: { ele: constant('physical') },
  }
)
const data = dataObjForWeaponSheet(key, data_gen)
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
