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

const key: WeaponKey = 'RecurveBow'

const healing_s = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const healing = equal(
  input.weapon.key,
  key,
  customHealNode(
    prod(input.total.hp, subscript(input.weapon.refinement, healing_s)),
  ),
)

const data = dataObjForWeaponSheet(key, undefined, { healing })

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(healing, { name: stg('healing'), variant: 'heal' }),
        },
      ],
    },
  ],
}

export default new WeaponSheet(sheet, data)
