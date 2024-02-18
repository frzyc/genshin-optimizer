import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'

import { input } from '../../../../Formula'
import { constant, subscript } from '../../../../Formula/utils'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'Rust'
const data_gen = allStats.weapon.data[key]

const normal_dmg_s = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const normal_dmg_ = subscript(input.weapon.refinement, normal_dmg_s)
const charged_dmg_ = constant(-0.1)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_,
    charged_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: normal_dmg_,
        },
        {
          node: charged_dmg_,
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
