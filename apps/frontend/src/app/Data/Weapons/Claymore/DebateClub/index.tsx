import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { constant, infoMut, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'DebateClub'
const data_gen = data_gen_json as WeaponData

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
