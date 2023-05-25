import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { customHealNode } from '../../../Characters/dataUtil'
import { stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'OtherworldlyStory'
const data_gen = allStats.weapon.data[key]

const healPerc = [0.01, 0.0125, 0.015, 0.0175, 0.02]
const heal = equal(
  input.weapon.key,
  key,
  customHealNode(
    prod(
      subscript(input.weapon.refineIndex, healPerc, { unit: '%' }),
      input.total.hp
    )
  )
)
export const data = dataObjForWeaponSheet(key, data_gen, undefined, { heal })
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(heal, { name: stg('healing'), variant: 'heal' }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
