import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import { equal, prod, subscript } from '../../../../Formula/utils'
import { st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'EverlastingMoonglow'
const data_gen = allStats.weapon.data[key]

const hp_conv = [-1, 0.01, 0.015, 0.02, 0.025, 0.03]
const [, trm] = trans('weapon', key)
const normal_dmgInc = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refinement, hp_conv, { unit: '%' }),
    input.premod.hp
  )
)
const heal_ = subscript(
  input.weapon.refinement,
  data_gen.refinementBonus['heal_']
)
export const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      normal_dmgInc, // TODO: technically should be in "total", but should be fine as premod
      heal_,
    },
  },
  {
    normal_dmgInc,
  }
)
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: heal_,
        },
        {
          text: trm('name'),
          node: normal_dmgInc,
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
