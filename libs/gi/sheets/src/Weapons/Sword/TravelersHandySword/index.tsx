import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { customHealNode } from '../../../Characters/dataUtil'
import { st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TravelersHandySword'

const hpRegenSrc = [-1, 0.01, 0.0125, 0.015, 0.0175, 0.02]
const heal = equal(
  input.weapon.key,
  key,
  customHealNode(
    prod(
      subscript(input.weapon.refinement, hpRegenSrc, { unit: '%' }),
      input.total.hp,
    ),
  ),
)
const data = dataObjForWeaponSheet(key, undefined, { heal })

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        { node: infoMut(heal, { name: stg('healing'), variant: 'heal' }) },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
